import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";
import toast from "react-hot-toast";
import type { Conversation, Message } from "@chat-app/shared";

interface User {
  id: string;
  fullName: string;
  email: string;
  profilePic: string | null;
}

interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  users: User[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingUsers: boolean;
  typingUserIds: string[];

  getConversations: () => Promise<void>;
  getUsers: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  getOrCreateDM: (userId: string) => Promise<void>;
  createGroup: (data: { name: string; memberIds: string[] }) => Promise<void>;
  addGroupMember: (conversationId: string, userId: string) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
  updateGroup: (conversationId: string, name: string) => Promise<void>;
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, data: { text?: string; image?: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  users: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingUsers: false,
  typingUserIds: [],

  getConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await axiosInstance.get("/conversations");
      set({ conversations: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load conversations");
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  getUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const res = await axiosInstance.get("/conversations/users");
      set({ users: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  selectConversation: (conversation) => {
    set({ selectedConversation: conversation, messages: [], typingUserIds: [] });
  },

  getOrCreateDM: async (userId) => {
    try {
      const res = await axiosInstance.post(`/conversations/dm/${userId}`);
      const conversation = res.data;
      const exists = get().conversations.find((c) => c.id === conversation.id);
      if (!exists) {
        set((state) => ({ conversations: [conversation, ...state.conversations] }));
      }
      set({ selectedConversation: conversation, messages: [], typingUserIds: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open DM");
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/conversations/group", data);
      set((state) => {
        const exists = state.conversations.find((c) => c.id === res.data.id);
        return {
          conversations: exists ? state.conversations : [res.data, ...state.conversations],
          selectedConversation: res.data,
          messages: [],
        };
      });
      toast.success("Group created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  addGroupMember: async (conversationId, userId) => {
    try {
      const res = await axiosInstance.post(
        `/conversations/group/${conversationId}/members`,
        { userId }
      );
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? res.data : c
        ),
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? res.data
            : state.selectedConversation,
      }));
      toast.success("Member added!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  },

  removeGroupMember: async (conversationId, userId) => {
    try {
      const res = await axiosInstance.delete(
        `/conversations/group/${conversationId}/members/${userId}`
      );
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? res.data : c
        ),
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? res.data
            : state.selectedConversation,
      }));
      toast.success("Member removed!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  updateGroup: async (conversationId, name) => {
    try {
      const res = await axiosInstance.put(
        `/conversations/group/${conversationId}`,
        { name }
      );
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? res.data : c
        ),
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? res.data
            : state.selectedConversation,
      }));
      toast.success("Group updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  getMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      set({ messages: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId, data) => {
    try {
      await axiosInstance.post(`/messages/${conversationId}`, data);
      // No need to push to messages here — socket event handles it
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
  const socket = getSocket();
  if (!socket) return;

  const { selectedConversation } = get();
  if (!selectedConversation) return;

  socket.emit("joinConversation", selectedConversation.id);

  socket.on("newMessage", (message: Message) => {
    if (message.conversationId !== get().selectedConversation?.id) return;
    set((state) => ({ messages: [...state.messages, message] }));
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === message.conversationId
            ? { ...c, messages: [message], updatedAt: message.createdAt }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    }));
  });

  socket.on("userTyping", ({ userId }: { userId: string }) => {
    set((state) => ({
      typingUserIds: state.typingUserIds.includes(userId)
        ? state.typingUserIds
        : [...state.typingUserIds, userId],
    }));
  });

  socket.on("userStopTyping", ({ userId }: { userId: string }) => {
    set((state) => ({
      typingUserIds: state.typingUserIds.filter((id) => id !== userId),
    }));
  });

  // Group updated (name change, member added)
  socket.on("groupUpdated", (updatedConversation: Conversation) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === updatedConversation.id ? updatedConversation : c
      ),
      selectedConversation:
        state.selectedConversation?.id === updatedConversation.id
          ? updatedConversation
          : state.selectedConversation,
    }));
  });

  // New group created — add to sidebar
  socket.on("groupCreated", (conversation: Conversation) => {
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conversation.id);
      if (exists) return state;
      return { conversations: [conversation, ...state.conversations] };
    });
  });

  // Removed from group
  socket.on("removedFromGroup", ({ conversationId }: { conversationId: string }) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      selectedConversation:
        state.selectedConversation?.id === conversationId
          ? null
          : state.selectedConversation,
    }));
  });
},

unsubscribeFromMessages: () => {
  const socket = getSocket();
  if (!socket) return;

  const { selectedConversation } = get();
  if (selectedConversation) {
    socket.emit("leaveConversation", selectedConversation.id);
  }

  socket.off("newMessage");
  socket.off("userTyping");
  socket.off("userStopTyping");
  socket.off("groupUpdated");
  socket.off("groupCreated");
  socket.off("removedFromGroup");
},
}));