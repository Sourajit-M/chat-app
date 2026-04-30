import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (userId: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    query: { userId },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  })

  // Global listener to prevent missed events due to React StrictMode
  socket.on("getOnlineUsers", (userIds: string[]) => {
    import("../store/useAuthStore").then(({ useAuthStore }) => {
      useAuthStore.getState().setOnlineUsers(userIds);
    });
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
};