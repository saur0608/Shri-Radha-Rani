import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { z } from 'zod';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';
import { orderListQuerySchema } from '../validators/order.validator';

export class AdminService {
  /**
   * Admin Dashboard statistics
   */
  static async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayOrdersCount,
      todayRevenueAgg,
      totalRevenueAgg,
      totalOrdersCount,
      totalCustomersCount,
      lowStockProducts,
      lowStockVariants,
      recentOrders,
    ] = await Promise.all([
      // Today's orders
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      // Lifetime revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      // Total orders
      prisma.order.count(),
      // Total customers
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // Low stock products (< 5)
      prisma.product.findMany({
        where: { stock: { lt: 5 }, isActive: true },
        take: 10,
        select: { id: true, name: true, sku: true, stock: true },
      }),
      // Low stock variants (< 5)
      prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        take: 10,
        include: { product: { select: { name: true } } },
      }),
      // Recent orders
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { name: true, phone: true } },
        },
      }),
    ]);

    return {
      today: {
        orders: todayOrdersCount,
        revenue: Number(todayRevenueAgg._sum.totalAmount || 0),
      },
      lifetime: {
        revenue: Number(totalRevenueAgg._sum.totalAmount || 0),
        orders: totalOrdersCount,
        customers: totalCustomersCount,
      },
      lowStockAlerts: [
        ...lowStockProducts.map((p) => ({
          type: 'PRODUCT',
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
        })),
        ...lowStockVariants.map((v) => ({
          type: 'VARIANT',
          id: v.id,
          name: `${v.product.name} (${v.size || ''} ${v.color || ''})`,
          sku: v.sku,
          stock: v.stock,
        })),
      ],
      recentOrders,
    };
  }

  /**
   * Product Management
   */
  static async createProduct(data: z.infer<typeof createProductSchema>) {
    // Generate slug if omitted
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw ApiError.conflict('A product with this slug already exists.');
    }

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw ApiError.conflict('A product with this SKU already exists.');
    }

    return prisma.product.create({
      data: {
        name: data.name,
        nameHi: data.nameHi,
        slug,
        categoryId: data.categoryId,
        description: data.description,
        descriptionHi: data.descriptionHi || null,
        basePrice: new Prisma.Decimal(data.basePrice),
        discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
        sku: data.sku,
        stock: data.stock,
        isFeatured: data.isFeatured ?? false,
        isBestseller: data.isBestseller ?? false,
        isNewArrival: data.isNewArrival ?? false,
        material: data.material || null,
        dimensions: data.dimensions || null,
        careInstructions: data.careInstructions || null,
        careInstructionsHi: data.careInstructionsHi || null,
        images: {
          create: data.images.map((img, index) => ({
            url: img.url,
            altText: img.altText || data.name,
            isPrimary: img.isPrimary ?? (index === 0),
            displayOrder: img.displayOrder ?? index,
          })),
        },
        variants: {
          create: data.variants?.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            sku: v.sku,
            price: new Prisma.Decimal(v.price),
            stock: v.stock,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  static async updateProduct(id: string, data: z.infer<typeof updateProductSchema>) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Product not found.');
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuMatch = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuMatch) throw ApiError.conflict('SKU already in use.');
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.nameHi ? { nameHi: data.nameHi } : {}),
        ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.descriptionHi !== undefined ? { descriptionHi: data.descriptionHi } : {}),
        ...(data.basePrice ? { basePrice: new Prisma.Decimal(data.basePrice) } : {}),
        ...(data.discountPrice !== undefined
          ? { discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null }
          : {}),
        ...(data.sku ? { sku: data.sku } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.isBestseller !== undefined ? { isBestseller: data.isBestseller } : {}),
        ...(data.isNewArrival !== undefined ? { isNewArrival: data.isNewArrival } : {}),
        ...(data.material !== undefined ? { material: data.material } : {}),
        ...(data.dimensions !== undefined ? { dimensions: data.dimensions } : {}),
        ...(data.careInstructions !== undefined ? { careInstructions: data.careInstructions } : {}),
        ...(data.careInstructionsHi !== undefined ? { careInstructionsHi: data.careInstructionsHi } : {}),
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    // Soft-delete or hard-delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Product archived successfully.' };
  }

  /**
   * Order Management for Admin
   */
  static async listOrders(query: z.infer<typeof orderListQuerySchema>) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: true,
        },
      }),
      prisma.order.count({ where }),
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

  /**
   * Customer List
   */
  static async listCustomers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            where: { paymentStatus: 'PAID' },
            select: { totalAmount: true },
          },
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      createdAt: c.createdAt,
      totalOrders: c._count.orders,
      totalSpent: c.orders.reduce((acc, curr) => acc + Number(curr.totalAmount), 0),
    }));

    return {
      customers: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Coupon Management
   */
  static async listCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createCoupon(data: z.infer<typeof createCouponSchema>) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: new Prisma.Decimal(data.discountValue),
        minOrderAmount: new Prisma.Decimal(data.minOrderAmount),
        maxDiscountAmount: data.maxDiscountAmount ? new Prisma.Decimal(data.maxDiscountAmount) : null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        usageLimit: data.usageLimit || null,
        isActive: data.isActive,
      },
    });
  }

  static async updateCoupon(id: string, data: z.infer<typeof updateCouponSchema>) {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.discountType ? { discountType: data.discountType } : {}),
        ...(data.discountValue !== undefined ? { discountValue: new Prisma.Decimal(data.discountValue) } : {}),
        ...(data.minOrderAmount !== undefined ? { minOrderAmount: new Prisma.Decimal(data.minOrderAmount) } : {}),
        ...(data.maxDiscountAmount !== undefined
          ? { maxDiscountAmount: data.maxDiscountAmount ? new Prisma.Decimal(data.maxDiscountAmount) : null }
          : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  static async deleteCoupon(id: string) {
    await prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }
}
