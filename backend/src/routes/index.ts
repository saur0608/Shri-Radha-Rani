import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/health', healthRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    shop: 'Shri Radha Rani Shringar',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default apiRouter;

