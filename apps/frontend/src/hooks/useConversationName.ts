import { useAuthStore } from "../store/useAuthStore";
import type { Conversation } from "@chat-app/shared";

export const useConversationInfo = (conversation: Conversation) => {
  const { authUser } = useAuthStore();

  if (conversation.isGroup) {
    return {
      name: conversation.name || "Unnamed Group",
      avatar: conversation.groupIcon || null,
      isGroup: true,
    };
  }

  // For DMs, show the OTHER person's info
  const otherParticipant = conversation.participants.find(
    (p) => p.user.id !== authUser?.id
  );

  return {
    name: otherParticipant?.user.fullName || "Unknown",
    avatar: otherParticipant?.user.profilePic || null,
    isGroup: false,
    otherUser: otherParticipant?.user,
  };
};