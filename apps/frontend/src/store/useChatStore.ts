import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "./useAuthStore";
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
  updateGroupIcon: (conversationId: string, groupIcon: string) => Promise<void>;
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, data: { text?: string; image?: string; video?: string; replyToId?: string }) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  initSocketListeners: () => void;
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
      
      // Join all conversation rooms so we receive background events (new messages, reads, etc)
      const socket = getSocket();
      if (socket) {
        res.data.forEach((c: any) => socket.emit("joinConversation", c.id));
      }
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
    set((state) => ({
      selectedConversation: conversation,
      messages: [],
      typingUserIds: [],
      conversations: state.conversations.map((c) =>
        c.id === conversation.id ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  getOrCreateDM: async (userId) => {
    try {
      const res = await axiosInstance.post(`/conversations/dm/${userId}`);
      const conversation = res.data;
      const exists = get().conversations.find((c) => c.id === conversation.id);
      if (!exists) {
        set((state) => ({ conversations: [conversation, ...state.conversations] }));
      }
      
      const socket = getSocket();
      if (socket) socket.emit("joinConversation", conversation.id);

      set((state) => ({
        selectedConversation: conversation,
        messages: [],
        typingUserIds: [],
        conversations: state.conversations.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open DM");
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/conversations/group", data);
      
      const socket = getSocket();
      if (socket) socket.emit("joinConversation", res.data.id);

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

  updateGroupIcon: async (conversationId, groupIcon) => {
    try {
      const res = await axiosInstance.put(
        `/conversations/group/${conversationId}/icon`,
        { groupIcon }
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
      toast.success("Group icon updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update group icon");
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
      const res = await axiosInstance.post(`/messages/${conversationId}`, data);
      
      set((state) => {
        // Optimistically add to messages if we are still in this conversation
        const isSelected = state.selectedConversation?.id === conversationId;
        const newMessages = isSelected 
          ? (state.messages.some(m => m.id === res.data.id) ? state.messages : [...state.messages, res.data])
          : state.messages;

        // Optimistically update the sidebar conversation
        const newConversations = state.conversations
          .map((c) =>
            c.id === conversationId
              ? { ...c, messages: [res.data], updatedAt: res.data.createdAt }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return {
          messages: newMessages,
          conversations: newConversations,
        };
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    // Check if listeners are already attached to prevent duplicates
    if (socket.listeners("newMessage").length > 0) return;

    socket.on("newMessage", (message: Message) => {
      const isSelected = message.conversationId === get().selectedConversation?.id;

      if (isSelected) {
        set((state) => ({ 
          messages: state.messages.some(m => m.id === message.id) 
            ? state.messages 
            : [...state.messages, message] 
        }));
      }

      const exists = get().conversations.find((c) => c.id === message.conversationId);
      if (!exists) {
        // Unknown conversation (e.g. new DM), fetch conversations to update sidebar
        get().getConversations();
      }

      const { authUser } = useAuthStore.getState();
      const isFromOther = authUser && message.senderId !== authUser.id;

      set((state) => ({
        conversations: state.conversations
          .map((c) =>
            c.id === message.conversationId
              ? { 
                  ...c, 
                  messages: [message], 
                  updatedAt: message.createdAt,
                  unreadCount: isSelected ? 0 : (isFromOther ? (c.unreadCount || 0) + 1 : c.unreadCount)
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
      }));

      // Immediately mark as read since we are actively in this conversation
      if (isSelected && isFromOther) {
        socket.emit("messageRead", { conversationId: message.conversationId, userId: authUser.id });
      }
    });

    socket.on("messageDeleted", (deletedMessage: Message) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === deletedMessage.id ? deletedMessage : m
        ),
        conversations: state.conversations.map((c) => {
          if (c.id === deletedMessage.conversationId && c.messages?.[0]?.id === deletedMessage.id) {
            return { ...c, messages: [deletedMessage] };
          }
          return c;
        }),
      }));
    });

    socket.on("messagesRead", ({ conversationId }: { conversationId: string }) => {
      if (get().selectedConversation?.id === conversationId) {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, isRead: true })),
        }));
      }
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

}));