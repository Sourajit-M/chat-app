import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import type { Message } from "@chat-app/shared";

export const useSocket = () => {
  const { authUser } = useAuthStore();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authUser) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(authUser.id);

    socket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUserIds(userIds);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [authUser]);

  return { onlineUserIds };
};