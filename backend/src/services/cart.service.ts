import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';

export class CartService {
  private static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw ApiError.badRequest('Either userId or sessionId is required to access cart.');
    }

    let cart;
    if (userId) {
      cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }
    }

    return cart!;
  }

  static async getCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // Calculate live database pricing for each cart item
    let subtotal = 0;
    const formattedItems = cart.items.map((item) => {
      // Use variant price if variant selected, else discountPrice or basePrice
      const unitPrice = item.variant
        ? Number(item.variant.price)
        : Number(item.product.discountPrice ?? item.product.basePrice);

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      const availableStock = item.variant ? item.variant.stock : item.product.stock;

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        nameHi: item.product.nameHi,
        slug: item.product.slug,
        image: item.product.images[0]?.url || '',
        variantId: item.variantId,
        variantSize: item.variant?.size,
        variantColor: item.variant?.color,
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        inStock: availableStock >= item.quantity,
        availableStock,
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      totalItems: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
    };
  }

  static async addItem(params: {
    userId?: string;
    sessionId?: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
  }) {
    const { userId, sessionId, productId, variantId, quantity } = params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      throw ApiError.notFound('Product is currently not available.');
    }

    let availableStock = product.stock;
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        throw ApiError.notFound('Selected product variant does not exist.');
      }
      availableStock = variant.stock;
    }

    if (availableStock < quantity) {
      throw ApiError.badRequest(
        `Only ${availableStock} units available in stock. Cannot add ${quantity} units.`
      );
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        throw ApiError.badRequest(
          `Cannot add more. Only ${availableStock} units in stock. You already have ${existingItem.quantity} in your cart.`
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? null,
          quantity,
        },
      });
    }

    return this.getCart(userId, sessionId);
  }

  static async updateQuantity(params: {
    userId?: string;
    sessionId?: string;
    itemId: string;
    quantity: number;
  }) {
    const { userId, sessionId, itemId, quantity } = params;
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });

    if (!item) {
      throw ApiError.notFound('Cart item not found.');
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return this.getCart(userId, sessionId);
    }

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (quantity > availableStock) {
      throw ApiError.badRequest(`Only ${availableStock} units available in stock.`);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId, sessionId);
  }

  static async removeItem(params: {
    userId?: string;
    sessionId?: string;
    itemId: string;
  }) {
    const { userId, sessionId, itemId } = params;
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw ApiError.notFound('Item not found in cart.');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId, sessionId);
  }

  static async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return { message: 'Cart cleared successfully' };
  }

  static async mergeGuestCart(userId: string, sessionId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({ where: { id: guestCart.id } });

    return this.getCart(userId);
  }
}
