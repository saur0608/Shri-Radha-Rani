import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';

export class CouponService {
  static async validateCoupon(code: string, subtotal: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      throw ApiError.badRequest('Invalid or expired coupon code.');
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      throw ApiError.badRequest('This coupon offer has not started yet.');
    }

    if (coupon.endDate && coupon.endDate < now) {
      throw ApiError.badRequest('This coupon has expired.');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon usage limit has been reached.');
    }

    const minAmount = Number(coupon.minOrderAmount);
    if (subtotal < minAmount) {
      throw ApiError.badRequest(
        `Coupon '${coupon.code}' requires a minimum order amount of ₹${minAmount}. Your current subtotal is ₹${subtotal.toFixed(2)}.`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
      appliedSubtotal: subtotal,
      finalSubtotal: Math.max(0, subtotal - discountAmount),
    };
  }
}
