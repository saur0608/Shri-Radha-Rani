import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/apiResponse';

export class PaymentController {
  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const paymentOrder = await PaymentService.createRazorpayOrder(orderId);
      return ApiResponse.success(res, paymentOrder, 'Razorpay order created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await PaymentService.verifyPaymentSignature({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });
      return ApiResponse.success(res, result, 'Payment verified successfully');
    } catch (err) {
      next(err);
    }
  }

  static async razorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signatureHeader = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as unknown as { rawBody?: Buffer | string }).rawBody || JSON.stringify(req.body);

      const result = await PaymentService.processWebhook(rawBody, signatureHeader);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
