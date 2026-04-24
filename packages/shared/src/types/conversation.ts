import type { User } from "./user";
import type { Message } from "./message";

export interface ConversationParticipant {
  user: Pick<User, "id" | "fullName" | "email" | "profilePic">;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  groupIcon: string | null;
  adminId: string | null;
  createdAt: string;
  updatedAt: string;
  participants: {
    user: User;
    joinedAt: string;
  }[];
  messages: Message[];
  lastMessage: Message | null;
}
