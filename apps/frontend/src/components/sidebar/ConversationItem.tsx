import { useConversationInfo } from "../../hooks/useConversationName";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Users } from "lucide-react";
import type { Conversation } from "@chat-app/shared";

interface Props {
  conversation: Conversation;
  onlineUserIds: string[];
}

const ConversationItem = ({ conversation, onlineUserIds }: Props) => {
  const { selectedConversation, selectConversation } = useChatStore();
  const { authUser } = useAuthStore();
  const { name, avatar, isGroup, otherUser } = useConversationInfo(conversation);

  const isSelected = selectedConversation?.id === conversation.id;
  const isOnline = !isGroup && otherUser && onlineUserIds.includes(otherUser.id);

  const lastMessage = conversation.messages?.[0];
  const lastMessageText = lastMessage
    ? lastMessage.image && !lastMessage.text
      ? "📷 Image"
      : lastMessage.text || ""
    : "No messages yet";

  const isSentByMe = lastMessage?.senderId === authUser?.id;

  return (
    <button
      onClick={() => selectConversation(conversation)}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left
        ${isSelected ? "bg-base-300" : "hover:bg-base-200"}
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {avatar
              ? <img src={avatar} className="w-12 h-12 rounded-full object-cover" alt={name} />
              : <Users className="w-6 h-6 text-primary" />
            }
          </div>
        ) : (
          <img
            src={avatar || "/avatar.png"}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-100" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">{name}</span>
          {isGroup && (
            <span className="text-xs text-base-content/40 shrink-0 ml-1">
              {conversation.participants.length} members
            </span>
          )}
        </div>
        <p className="text-xs text-base-content/60 truncate mt-0.5">
          {isSentByMe ? "You: " : ""}{lastMessageText}
        </p>
      </div>
    </button>
  );
};

export default ConversationItem;