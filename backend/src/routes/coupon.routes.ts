import { Router } from 'express';
import { CouponController } from '../controllers/coupon.controller';
import { validate } from '../middleware/validate.middleware';
import { validateCouponSchema } from '../validators/coupon.validator';

const router = Router();

router.post('/validate', validate({ body: validateCouponSchema }), CouponController.validateCoupon);

export default router;
