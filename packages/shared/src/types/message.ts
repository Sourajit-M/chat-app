export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  image: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    profilePic: string | null;
  };
  reactions? : Reaction[];
}

export interface Reaction {
  id: string;
  email: string;
  userId: string;
  messageId: string;
}
