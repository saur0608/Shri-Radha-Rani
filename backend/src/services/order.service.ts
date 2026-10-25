import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { ENV } from '../config/env';
import { CouponService } from './coupon.service';
import { z } from 'zod';
import { createOrderSchema, quoteOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

interface CalculatedItem {
  productId: string;
  variantId: string | null;
  productName: string;
  productNameHi: string;
  variantInfo: string | null;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export class OrderService {
  /**
   * Helper to verify and recalculate all item prices strictly from the database.
   * NEVER trust client-provided prices or totals.
   */
  private static async resolveOrderItems(itemsInput: Array<{ productId: string; variantId?: string | null; quantity: number }>): Promise<{
    calculatedItems: CalculatedItem[];
    subtotal: number;
  }> {
    let subtotal = 0;
    const calculatedItems: CalculatedItem[] = [];

    for (const item of itemsInput) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      });

      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Item '${item.productId}' is not available.`);
      }

      let unitPrice = Number(product.discountPrice ?? product.basePrice);
      let variantInfo: string | null = null;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw ApiError.badRequest(`Selected variant for '${product.name}' was not found.`);
        }
        unitPrice = Number(variant.price);
        variantInfo = [variant.size, variant.color].filter(Boolean).join(' / ');
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for '${product.name}'${variantInfo ? ` (${variantInfo})` : ''}. Only ${availableStock} in stock.`
        );
      }

      const itemTotalPrice = unitPrice * item.quantity;
      subtotal += itemTotalPrice;

      calculatedItems.push({
        productId: product.id,
        variantId: item.variantId ?? null,
        productName: product.name,
        productNameHi: product.nameHi,
        variantInfo,
        imageUrl: product.images[0]?.url || '',
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotalPrice,
      });
    }

    return { calculatedItems, subtotal };
  }

  /**
   * Calculate live quote for checkout (items, shipping, coupon discount, total).
   */
  static async calculateQuote(data: z.infer<typeof quoteOrderSchema>, userId?: string) {
    let itemsToProcess = data.items;

    // If items are not directly passed, load from the user's or session's cart
    if (!itemsToProcess || itemsToProcess.length === 0) {
      const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId: data.sessionId ?? undefined },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest('Your shopping cart is empty.');
      }

      itemsToProcess = cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    }

    const { calculatedItems, subtotal } = await this.resolveOrderItems(itemsToProcess);

    // Apply Coupon if provided
    let discount = 0;
    let couponDetails = null;

    if (data.couponCode) {
      try {
        const couponResult = await CouponService.validateCoupon(data.couponCode, subtotal);
        discount = couponResult.discountAmount;
        couponDetails = couponResult;
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          throw err;
        }
        throw ApiError.badRequest('Invalid coupon code.');
      }
    }

    // Shipping fee calculation based on policy:
    // Free shipping above threshold (₹999), otherwise standard fee (₹70)
    const afterDiscountSubtotal = Math.max(0, subtotal - discount);
    const shippingFee = afterDiscountSubtotal >= ENV.FREE_SHIPPING_THRESHOLD ? 0 : ENV.STANDARD_SHIPPING_FEE;
    const totalAmount = Math.round((afterDiscountSubtotal + shippingFee) * 100) / 100;

    return {
      items: calculatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      shippingFee,
      freeShippingThreshold: ENV.FREE_SHIPPING_THRESHOLD,
      freeShippingEligible: afterDiscountSubtotal >= ENV.FREE_SHIPPING_THRESHOLD,
      totalAmount,
      coupon: couponDetails,
    };
  }

  /**
   * Create an order in a single database transaction with atomic stock decrement.
   */
  static async createOrder(data: z.infer<typeof createOrderSchema>, userId?: string) {
    let itemsInput = data.items;

    // Load items from cart if omitted
    if (!itemsInput || itemsInput.length === 0) {
      const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId: data.sessionId ?? undefined },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest('Cart is empty. Please add items to checkout.');
      }

      itemsInput = cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    }

    const quote = await this.calculateQuote(
      {
        items: itemsInput,
        sessionId: data.sessionId,
        couponCode: data.couponCode,
      },
      userId
    );

    // Generate unique order number (e.g. RR-20251025-XXXX)
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `RR-${timestamp}-${randomSuffix}`;

    // Execute in Prisma Transaction for atomic stock deductions and order creation
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify and decrement stock atomically
      for (const item of quote.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (!variant || variant.stock < item.quantity) {
            throw ApiError.badRequest(
              `Stock unavailable for ${item.productName} (${item.variantInfo || 'variant'}). Please adjust cart.`
            );
          }

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.stock < item.quantity) {
            throw ApiError.badRequest(
              `Stock unavailable for ${item.productName}. Please adjust cart.`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 2. Increment coupon usage if applied
      if (data.couponCode) {
        await tx.coupon.updateMany({
          where: { code: data.couponCode.toUpperCase().trim() },
          data: { usedCount: { increment: 1 } },
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          shippingAddress: data.shippingAddress as unknown as Prisma.InputJsonValue,
          subtotal: new Prisma.Decimal(quote.subtotal),
          discount: new Prisma.Decimal(quote.discount),
          shippingFee: new Prisma.Decimal(quote.shippingFee),
          totalAmount: new Prisma.Decimal(quote.totalAmount),
          couponCode: data.couponCode?.toUpperCase().trim() || null,
          status: 'PLACED',
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          customerNotes: data.customerNotes || null,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              productNameHi: item.productNameHi,
              variantInfo: item.variantInfo,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              quantity: item.quantity,
              totalPrice: new Prisma.Decimal(item.totalPrice),
              imageUrl: item.imageUrl,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 4. Clear the cart
      if (userId) {
        await tx.cart.deleteMany({ where: { userId } });
      } else if (data.sessionId) {
        await tx.cart.deleteMany({ where: { sessionId: data.sessionId } });
      }

      return newOrder;
    });

    return order;
  }

  static async getOrderByIdOrNumber(identifier: string, userId?: string, isAdmin = false) {
    const isId = identifier.startsWith('c') && identifier.length >= 20;

    const order = await prisma.order.findFirst({
      where: isId ? { id: identifier } : { orderNumber: identifier },
      include: {
        items: true,
        payments: true,
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    // Customer can only view their own orders unless admin
    if (!isAdmin && userId && order.userId && order.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order.');
    }

    return order;
  }

  static async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateOrderStatus(
    orderId: string,
    data: z.infer<typeof updateOrderStatusSchema>
  ) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      throw ApiError.notFound('Order not found.');
    }

    // Handle stock replenishment if order is transitioned to CANCELLED from another status
    return prisma.$transaction(async (tx) => {
      if (data.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: data.status as OrderStatus,
          trackingNumber: data.trackingNumber !== undefined ? data.trackingNumber : existingOrder.trackingNumber,
          courierName: data.courierName !== undefined ? data.courierName : existingOrder.courierName,
          adminNotes: data.adminNotes !== undefined ? data.adminNotes : existingOrder.adminNotes,
          // If marked delivered and method was COD, update payment status to PAID
          ...(data.status === 'DELIVERED' && existingOrder.paymentMethod === 'COD'
            ? { paymentStatus: 'PAID' }
            : {}),
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return updated;
    });
  }
}
