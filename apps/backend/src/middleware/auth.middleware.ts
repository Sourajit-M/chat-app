import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    profilePic: string | null;
  };
}

export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try{
    const token = req.cookies?.token;

    if(!token) {
      res.status(401).json({ message: 'Unauthorized - no token' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePic: true,
      },
    });


    if (!user) {
      res.status(401).json({ message: 'Unauthorized - user not found' });
      return;
    }

    req.user = user;
    next();
  }catch (error) {
    res.status(401).json({ message: 'Unauthorized - invalid token' });
  }

}