import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
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

  getConversations: () => Promise<void>;
  getUsers: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  getOrCreateDM: (userId: string) => Promise<void>;
  createGroup: (data: { name: string; memberIds: string[] }) => Promise<void>;
  addGroupMember: (conversationId: string, userId: string) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
  updateGroup: (conversationId: string, name: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  users: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingUsers: false,

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
    set({ selectedConversation: conversation, messages: [] });
  },

  getOrCreateDM: async (userId) => {
    try {
      const res = await axiosInstance.post(`/conversations/dm/${userId}`);
      const conversation = res.data;

      // Add to list if not already there
      const exists = get().conversations.find((c) => c.id === conversation.id);
      if (!exists) {
        set((state) => ({ conversations: [conversation, ...state.conversations] }));
      }

      set({ selectedConversation: conversation, messages: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to open DM");
    }
  },

  createGroup: async (data) => {
    try {
      const res = await axiosInstance.post("/conversations/group", data);
      set((state) => ({
        conversations: [res.data, ...state.conversations],
        selectedConversation: res.data,
        messages: [],
      }));
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
}));