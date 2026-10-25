import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { ApiResponse } from '../utils/apiResponse';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

      const cart = await CartService.getCart(userId, sessionId);
      return ApiResponse.success(res, cart, 'Cart retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.body.sessionId || (req.headers['x-session-id'] as string);

      const cart = await CartService.addItem({
        userId,
        sessionId,
        productId: req.body.productId,
        variantId: req.body.variantId,
        quantity: req.body.quantity ?? 1,
      });

      return ApiResponse.success(res, cart, 'Item added to cart successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

      const cart = await CartService.updateQuantity({
        userId,
        sessionId,
        itemId: req.params.itemId,
        quantity: req.body.quantity,
      });

      return ApiResponse.success(res, cart, 'Cart updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

      const cart = await CartService.removeItem({
        userId,
        sessionId,
        itemId: req.params.itemId,
      });

      return ApiResponse.success(res, cart, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

      const result = await CartService.clearCart(userId, sessionId);
      return ApiResponse.success(res, result, 'Cart cleared');
    } catch (err) {
      next(err);
    }
  }

  static async mergeCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const sessionId = req.body.sessionId;

      const cart = await CartService.mergeGuestCart(userId, sessionId);
      return ApiResponse.success(res, cart, 'Guest cart merged successfully');
    } catch (err) {
      next(err);
    }
  }
}
