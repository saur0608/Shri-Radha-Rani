import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyVerificationToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { prisma } from '../db/prisma';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload & { name?: string };
      verifiedEmail?: string;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    const decoded = verifyToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, phone: true, email: true, name: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User account no longer exists.');
    }

    req.user = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(ApiError.unauthorized('Invalid or expired token. Please log in again.'));
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, phone: true, email: true, name: true },
      });
      if (user) {
        req.user = {
          userId: user.id,
          role: user.role,
          phone: user.phone,
          email: user.email,
          name: user.name,
        };
      }
    }
  } catch {
    // Guest user - silently ignore invalid/expired tokens for optional auth
  }
  return next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Access denied. Insufficient permissions.'));
    }

    next();
  };
};

/**
 * Middleware ensuring request possesses a valid, unexpired email verification token.
 * Compatible with the email-otp specification.
 */
export const requireVerifiedEmail = (purpose?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email first.',
      });
    }

    try {
      const decoded = verifyVerificationToken(token);
      if (!decoded.ev || decoded.channel !== 'EMAIL' || (purpose && decoded.purpose !== purpose)) {
        throw new Error('Invalid verification token');
      }
      req.verifiedEmail = decoded.sub || decoded.target;
      next();
    } catch {
      return res.status(401).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email first.',
      });
    }
  };
};
