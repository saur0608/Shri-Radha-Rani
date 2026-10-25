import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { z } from 'zod';
import { productQuerySchema } from '../validators/product.validator';

export class ProductService {
  static async listProducts(query: z.infer<typeof productQuerySchema>) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.category) {
      where.category = { slug: query.category };
    } else if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameHi: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { descriptionHi: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    if (query.size) {
      where.variants = {
        some: {
          size: { contains: query.size, mode: 'insensitive' },
        },
      };
    }

    if (query.color) {
      where.variants = {
        some: {
          color: { contains: query.color, mode: 'insensitive' },
        },
      };
    }

    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    if (query.isBestseller !== undefined) where.isBestseller = query.isBestseller;
    if (query.isNewArrival !== undefined) where.isNewArrival = query.isNewArrival;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    } else if (query.sort === 'bestseller') {
      orderBy = { isBestseller: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, nameHi: true, slug: true },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          },
          variants: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductBySlugOrId(identifier: string) {
    const isId = identifier.startsWith('c') && identifier.length >= 20;

    const product = await prisma.product.findFirst({
      where: isId ? { id: identifier } : { slug: identifier },
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        variants: {
          orderBy: { price: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found.');
    }

    // Calculate rating statistics
    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...product,
      rating: {
        average: reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 5.0,
        count: reviewStats._count.rating || 0,
      },
    };
  }

  static async getSearchSuggestions(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim();
    const suggestions = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { nameHi: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 6,
      select: {
        id: true,
        name: true,
        nameHi: true,
        slug: true,
        basePrice: true,
        discountPrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    });

    return suggestions;
  }

  static async getFeaturedCollections() {
    const [bestsellers, newArrivals, featured] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isBestseller: true },
        take: 8,
        include: {
          images: { orderBy: { isPrimary: 'desc' } },
          category: { select: { name: true, nameHi: true, slug: true } },
          variants: true,
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, isNewArrival: true },
        take: 8,
        include: {
          images: { orderBy: { isPrimary: 'desc' } },
          category: { select: { name: true, nameHi: true, slug: true } },
          variants: true,
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 8,
        include: {
          images: { orderBy: { isPrimary: 'desc' } },
          category: { select: { name: true, nameHi: true, slug: true } },
          variants: true,
        },
      }),
    ]);

    return { bestsellers, newArrivals, featured };
  }
}
