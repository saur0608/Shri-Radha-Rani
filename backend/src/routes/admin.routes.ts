import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { orderListQuerySchema, updateOrderStatusSchema } from '../validators/order.validator';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, requireRole('ADMIN'));

// Dashboard stats
router.get('/dashboard', AdminController.getDashboard);

// Products
router.post('/products', validate({ body: createProductSchema }), AdminController.createProduct);
router.put('/products/:id', validate({ body: updateProductSchema }), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Orders
router.get('/orders', validate({ query: orderListQuerySchema }), AdminController.listOrders);
router.put('/orders/:id/status', validate({ body: updateOrderStatusSchema }), AdminController.updateOrderStatus);

// Customers
router.get('/customers', AdminController.listCustomers);

// Coupons
router.get('/coupons', AdminController.listCoupons);
router.post('/coupons', validate({ body: createCouponSchema }), AdminController.createCoupon);
router.put('/coupons/:id', validate({ body: updateCouponSchema }), AdminController.updateCoupon);
router.delete('/coupons/:id', AdminController.deleteCoupon);

// Categories
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

export default router;
