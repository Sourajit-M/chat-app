import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export const generateTokenAndSetCookie = (res: Response, payload: object) => {
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    secure: env.NODE_ENV === "production",                  
  });

  return token;
}