import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server as HttpServer } from "http";
import { env } from "../config/env";

const onlineUsers = new Map<string, string>();

export let io: Server;

export const initSocket = async( httpServer: HttpServer): Promise<void> => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowed = [
          env.CLIENT_URL,
          "http://localhost:5173",
          "https://chat-app-frontend-eta-two.vercel.app",
        ];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed"));
        }
      },
      credentials: true,
    },
  });

  const pubClient = createClient({url: env.REDIS_URL})
  const subClient = pubClient.duplicate()

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient))
  console.log("Socket.io Redis adapter connected");

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if(userId){
      onlineUsers.set(userId, socket.id)
      socket.join(userId)
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()))
      console.log(`User Connected: ${userId}`);
    }

    // Join a conversation room
    socket.on("joinConversation", (conversationId: string) => {
      socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on("leaveConversation", (conversationId: string) => {
      socket.leave(conversationId);
    });

    // Typing indicators
    socket.on("typing", ({ conversationId, userId: typingUserId }: {
      conversationId: string;
      userId: string;
    }) => {
      socket.to(conversationId).emit("userTyping", { userId: typingUserId });
    });

    socket.on("stopTyping", ({ conversationId, userId: typingUserId }: {
      conversationId: string;
      userId: string;
    }) => {
      socket.to(conversationId).emit("userStopTyping", { userId: typingUserId });
    });

    // Mark messages as read
    socket.on("messageRead", async ({ conversationId, userId: readerId }: {
      conversationId: string;
      userId: string;
    }) => {
      // Import prisma dynamically or at the top of the file
      const { prisma } = require("../config/prisma");
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: readerId },
            isRead: false,
          },
          data: { isRead: true },
        });
        socket.to(conversationId).emit("messagesRead", { conversationId });
      } catch (error) {
        console.error("Error marking messages as read via socket:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User disconnected: ${userId}`);
      }
    });
  })
}

export const getOnlineUsers = () => Array.from(onlineUsers.keys());