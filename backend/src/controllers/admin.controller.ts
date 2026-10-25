import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../db/prisma';

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      return ApiResponse.success(res, stats, 'Admin dashboard statistics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // Products
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.createProduct(req.body);
      return ApiResponse.created(res, product, 'Product added successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.updateProduct(req.params.id, req.body);
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.deleteProduct(req.params.id);
      return ApiResponse.success(res, result, 'Product archived');
    } catch (err) {
      next(err);
    }
  }

  // Orders
  static async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.listOrders(req.query as never);
      return ApiResponse.success(res, result.orders, 'Orders retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.updateOrderStatus(req.params.id, req.body);
      return ApiResponse.success(res, order, `Order status updated to ${order.status}`);
    } catch (err) {
      next(err);
    }
  }

  // Customers
  static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.listCustomers(page, limit);
      return ApiResponse.success(res, result.customers, 'Customers retrieved', 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  // Coupons
  static async listCoupons(_req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await AdminService.listCoupons();
      return ApiResponse.success(res, coupons, 'Coupons retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await AdminService.createCoupon(req.body);
      return ApiResponse.created(res, coupon, 'Coupon code created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await AdminService.updateCoupon(req.params.id, req.body);
      return ApiResponse.success(res, coupon, 'Coupon updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.deleteCoupon(req.params.id);
      return ApiResponse.success(res, result, 'Coupon deleted');
    } catch (err) {
      next(err);
    }
  }

  // Category management
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.create({
        data: req.body,
      });
      return ApiResponse.created(res, category, 'Category created');
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.update({
        where: { id: req.params.id },
        data: req.body,
      });
      return ApiResponse.success(res, category, 'Category updated');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.category.delete({ where: { id: req.params.id } });
      return ApiResponse.success(res, null, 'Category deleted');
    } catch (err) {
      next(err);
    }
  }
}
