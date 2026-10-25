import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/apiResponse';

export class OrderController {
  static async quoteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const quote = await OrderService.calculateQuote(req.body, userId);
      return ApiResponse.success(res, quote, 'Order quote calculated from database');
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const order = await OrderService.createOrder(req.body, userId);
      return ApiResponse.created(res, order, 'Order placed successfully. Radhe Radhe!');
    } catch (err) {
      next(err);
    }
  }

  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';
      const order = await OrderService.getOrderByIdOrNumber(req.params.idOrNumber, userId, isAdmin);
      return ApiResponse.success(res, order, 'Order details retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await OrderService.getUserOrders(userId, page, limit);
      return ApiResponse.success(res, result.orders, 'User order history retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
}
