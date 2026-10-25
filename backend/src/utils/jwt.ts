import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
  phone: string;
  email?: string | null;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export interface VerificationTokenPayload {
  sub?: string;
  target: string;
  channel: 'SMS' | 'EMAIL';
  purpose: string;
  ev?: boolean;
}

export const signVerificationToken = (payload: VerificationTokenPayload): string => {
  return jwt.sign(
    {
      sub: payload.target,
      ev: true,
      ...payload,
    },
    ENV.OTP_SECRET,
    {
      expiresIn: '15m',
    }
  );
};

export const verifyVerificationToken = (token: string): VerificationTokenPayload => {
  return jwt.verify(token, ENV.OTP_SECRET) as VerificationTokenPayload;
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

