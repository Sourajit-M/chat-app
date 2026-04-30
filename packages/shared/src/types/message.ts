export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  image: string | null;
  video?: string | null;
  isRead: boolean;
  isDeleted?: boolean;
  replyToId?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    fullName: string;
    profilePic: string | null;
  };
  replyTo?: {
    id: string;
    text: string | null;
    image: string | null;
    video?: string | null;
    sender: {
      fullName: string;
    }
  } | null;
  reactions? : Reaction[];
}

export interface Reaction {
  id: string;
  email: string;
  userId: string;
  messageId: string;
}
