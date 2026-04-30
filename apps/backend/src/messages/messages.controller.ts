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
  replyTo: {
    select: {
      id: true,
      text: true,
      image: true,
      sender: {
        select: {
          fullName: true,
        },
      },
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

    // Mark all unread messages from OTHERS as read
    const updateResult = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    if (updateResult.count > 0) {
      io.to(conversationId).emit("messagesRead", { conversationId });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: messageInclude,
      orderBy: { createdAt: "asc" },
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
    const { text, image, video, replyToId } = req.body;

    if (!text && !image && !video) {
      res.status(400).json({ message: "Message must have text, image, or video" });
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

    let videoUrl: string | undefined;
    if (video) {
      const uploaded = await cloudinary.uploader.upload(video, {
        folder: "chat-app/messages/videos",
        resource_type: "video",
      });
      videoUrl = uploaded.secure_url;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        text: text || null,
        image: imageUrl || null,
        video: videoUrl || null,
        replyToId: replyToId || null,
      },
      include: messageInclude,
    });

    // Update conversation updatedAt so it bubbles to top of sidebar
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      include: { participants: true }
    });

    // Emit to everyone in the conversation reliably via their userId rooms
    conversation.participants.forEach((p) => {
      io.to(p.userId).emit("newMessage", message);
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/messages/:messageId
export const deleteMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only delete your own messages" });
      return;
    }

    // Soft delete
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        text: null,
        image: null,
        video: null,
      },
      include: messageInclude,
    });

    io.to(message.conversationId).emit("messageDeleted", deletedMessage);

    res.status(200).json(deletedMessage);
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};