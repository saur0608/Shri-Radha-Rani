import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponse } from '../utils/apiResponse';

export class ReviewController {
  static async listProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await ReviewService.listProductReviews(productId, page, limit);
      return ApiResponse.success(res, result.reviews, 'Reviews retrieved', 200, {
        ...result.meta,
        stats: result.stats,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const review = await ReviewService.createReview(userId, req.body);
      return ApiResponse.created(res, review, 'Devotional review submitted with gratitude!');
    } catch (err) {
      next(err);
    }
  }
}
