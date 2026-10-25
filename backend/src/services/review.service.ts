import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { z } from 'zod';
import { createReviewSchema } from '../validators/review.validator';

export class ReviewService {
  static async listProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
      prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      reviews,
      stats: {
        averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 5.0,
        totalReviews: stats._count.rating || 0,
      },
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createReview(userId: string, data: z.infer<typeof createReviewSchema>) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw ApiError.notFound('Product not found.');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId: data.productId, userId },
    });

    if (existingReview) {
      throw ApiError.conflict('You have already submitted a review for this devotional item.');
    }

    // Check if user has an order with this product to verify purchase
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId,
        paymentStatus: 'PAID',
        items: {
          some: { productId: data.productId },
        },
      },
    });

    const isVerifiedPurchase = Boolean(verifiedOrder);

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        isVerifiedPurchase,
        isApproved: true, // auto-approved or can be toggled by admin
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return review;
  }
}
