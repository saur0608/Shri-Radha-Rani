import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      setAuthCookie(res, result.token);
      return ApiResponse.created(res, result, 'Devotee account registered successfully. Radhe Radhe!');
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      setAuthCookie(res, result.token);
      return ApiResponse.success(res, result, 'Welcome back! Logged in successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      clearAuthCookie(res);
      return ApiResponse.success(res, null, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.user!.userId);
      return ApiResponse.success(res, profile, 'Profile retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await AuthService.updateProfile(req.user!.userId, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await AuthService.addAddress(req.user!.userId, req.body);
      return ApiResponse.created(res, address, 'Delivery address saved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.deleteAddress(req.user!.userId, req.params.id);
      return ApiResponse.success(res, result, 'Address removed successfully.');
    } catch (err) {
      next(err);
    }
  }
}
