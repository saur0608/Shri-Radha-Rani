import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../utils/apiResponse';

export class ProductController {
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.listProducts(req.query as never);
      return ApiResponse.success(res, result.products, 'Products retrieved successfully', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlugOrId(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductBySlugOrId(req.params.slugOrId);
      return ApiResponse.success(res, product, 'Product details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const suggestions = await ProductService.getSearchSuggestions(query);
      return ApiResponse.success(res, suggestions, 'Search suggestions retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getCollections(_req: Request, res: Response, next: NextFunction) {
    try {
      const collections = await ProductService.getFeaturedCollections();
      return ApiResponse.success(res, collections, 'Featured collections retrieved');
    } catch (err) {
      next(err);
    }
  }
}
