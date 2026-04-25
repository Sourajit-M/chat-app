import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { cloudinary } from "../config/cloudinary";
import { io } from "../socket/socket.server";

const messageInclude = {
  sender: {
    select: {
      id: true,
      fullName: true,
      profilePic: true,
    },
  },
  reactions: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  },
};

// GET /api/messages/:conversationId
export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: { userId, conversationId },
      },
    });

    if (!participant) {
      res.status(403).json({ message: "You are not part of this conversation" });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      orderBy: { createdAt: "asc" },
    });

    // Mark all unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/messages/:conversationId
export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;
    const { text, image } = req.body;

    if (!text && !image) {
      res.status(400).json({ message: "Message must have text or image" });
      return;
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: { userId, conversationId },
      },
    });

    if (!participant) {
      res.status(403).json({ message: "You are not part of this conversation" });
      return;
    }

    let imageUrl: string | undefined;
    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "chat-app/messages",
      });
      imageUrl = uploaded.secure_url;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: text || null,
        image: imageUrl || null,
      },
      include: messageInclude,
    });

    // Update conversation updatedAt so it bubbles to top of sidebar
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Emit to everyone in the conversation room
    io.to(conversationId).emit("newMessage", message);

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};