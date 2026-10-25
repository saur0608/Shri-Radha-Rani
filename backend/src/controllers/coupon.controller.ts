import { Request, Response, NextFunction } from 'express';
import { CouponService } from '../services/coupon.service';
import { ApiResponse } from '../utils/apiResponse';

export class CouponController {
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const result = await CouponService.validateCoupon(code, subtotal);
      return ApiResponse.success(res, result, 'Coupon applied successfully!');
    } catch (err) {
      next(err);
    }
  }
}
