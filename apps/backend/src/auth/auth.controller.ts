import { Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateTokenAndSetCookie } from '../lib/jwt';
import { signupSchema, loginSchema } from './auth.schema';
import { AuthRequest } from '../middleware/auth.middleware';
import { cloudinary } from '../config/cloudinary';

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.flatten().fieldErrors });
      return
    }

    const { fullName, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword },
      select: { id: true, email: true, fullName: true, profilePic: true, createdAt: true, updatedAt: true },
    })


    generateTokenAndSetCookie(res, { userId: user.id });

    res.status(201).json({ user });
  }catch (error) {
    res.status(500).json({ message: 'Signup error', error });
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    generateTokenAndSetCookie(res, { userId: user.id });

    res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?.id;

    if(!profilePic){
      res.status(400).json({ message: 'Profile picture is required' });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(profilePic, {
      folder: 'chat-app/avatars',
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePic: uploadResult.secure_url },
      select: { id: true, email: true, fullName: true, profilePic: true, createdAt: true, updatedAt: true },
    });
    res.status(200).json({ user: updatedUser });
  }catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};