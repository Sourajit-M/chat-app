import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "../store/useAuthStore";

export const useConnectionStatus = () => {
  const { authUser } = useAuthStore();
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authUser) return;

    const socket = getSocket();
    if (!socket) return;

    const handleDisconnect = () => {
      toastIdRef.current = toast.error("Connection lost. Reconnecting...", {
        duration: Infinity,
        id: "connection-status",
      });
    };

    const handleReconnect = () => {
      toast.success("Reconnected!", {
        id: "connection-status",
        duration: 2000,
      });
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [authUser]);
};