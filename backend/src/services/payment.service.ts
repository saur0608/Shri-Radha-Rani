import crypto from 'crypto';
import Razorpay from 'razorpay';
import { prisma } from '../db/prisma';
import { ApiError } from '../utils/apiError';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

export class PaymentService {
  /**
   * Create Razorpay Order with amount calculated strictly from Order record in DB.
   */
  static async createRazorpayOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found.');
    }

    if (order.paymentStatus === 'PAID') {
      throw ApiError.badRequest('This order has already been paid for.');
    }

    const razorpay = getRazorpayInstance();
    // Razorpay amount is in paise (₹1 = 100 paise)
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerPhone: order.customerPhone,
        },
      });
    } catch (err: unknown) {
      logger.error('Failed to create Razorpay order:', err);
      throw ApiError.internal('Unable to initiate online payment. Please try again.');
    }

    // Save or update payment attempt in database
    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentGateway: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PENDING',
        rawResponse: razorpayOrder as object,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(order.totalAmount),
      amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
      },
    };
  }

  /**
   * Verify Razorpay Payment signature cryptographically.
   */
  static async verifyPaymentSignature(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpaySignature, 'utf-8')
    );

    if (!isSignatureValid) {
      logger.warn(`Invalid Razorpay signature for order ${orderId}`);
      await prisma.payment.updateMany({
        where: { orderId, razorpayOrderId },
        data: { status: 'FAILED' },
      });
      throw ApiError.badRequest('Payment verification failed: Invalid digital signature.');
    }

    // Transaction to mark Order and Payment as PAID
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      }),
      prisma.payment.updateMany({
        where: { orderId, razorpayOrderId },
        data: {
          status: 'PAID',
          razorpayPaymentId,
          razorpaySignature,
        },
      }),
    ]);

    logger.info(`Payment verified and marked PAID for order ${orderId} (${razorpayPaymentId})`);

    return {
      verified: true,
      message: 'Payment verified and confirmed successfully.',
      orderId,
    };
  }

  /**
   * Process Razorpay Server-to-Server Webhook even if customer closes browser window.
   */
  static async processWebhook(rawBody: string | Buffer, signatureHeader: string) {
    if (!ENV.RAZORPAY_WEBHOOK_SECRET) {
      throw ApiError.badRequest('Webhook secret not configured on server.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signatureHeader) {
      logger.warn('Unauthorized webhook signature mismatch.');
      throw ApiError.unauthorized('Invalid webhook signature.');
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
    logger.info(`Received Razorpay webhook event: ${event.event}`);

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { razorpayOrderId },
          include: { order: true },
        });

        if (paymentRecord && paymentRecord.order.paymentStatus !== 'PAID') {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: paymentRecord.orderId },
              data: { paymentStatus: 'PAID' },
            }),
            prisma.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: 'PAID',
                razorpayPaymentId: razorpayPaymentId || paymentRecord.razorpayPaymentId,
                rawResponse: event as object,
              },
            }),
          ]);
          logger.info(`Webhook successfully marked order ${paymentRecord.orderId} as PAID`);
        }
      }
    }

    return { received: true };
  }
}
