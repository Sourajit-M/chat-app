import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useAuthStore } from "../store/useAuthStore";

export const useSocket = () => {
  const { authUser, onlineUsers, setOnlineUsers } = useAuthStore();

  useEffect(() => {
    if (!authUser) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(authUser.id);

    socket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    import("../store/useChatStore").then(({ useChatStore }) => {
      const store = useChatStore.getState();
      store.initSocketListeners();
      store.conversations.forEach((c) => socket.emit("joinConversation", c.id));
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [authUser, setOnlineUsers]);

  return { onlineUserIds: onlineUsers };
};
