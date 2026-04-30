import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useConversationInfo } from "../../hooks/useConversationName";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import GroupInfoPanel from "./GroupInfoPanel";
import SummaryModal from "./SummaryModal";
import { Loader2, Users, X, Info, Sparkles } from "lucide-react";

interface Props {
  onlineUserIds: string[];
  className?: string;
}

const ChatContainer = ({ onlineUserIds, className = "" }: Props) => {
  const {
    selectedConversation,
    messages,
    isLoadingMessages,
    typingUserIds,
    getMessages,
    selectConversation,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const { name, avatar, isGroup, otherUser } =
    useConversationInfo(selectedConversation!);

  const isOnline =
    !isGroup && otherUser && onlineUserIds.includes(otherUser.id);

  useEffect(() => {
    if (!selectedConversation) return;
    getMessages(selectedConversation.id);
    setShowGroupInfo(false);
    setReplyingTo(null);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUserIds, replyingTo]);

  const typingUsers =
    selectedConversation?.participants
      .filter(
        (p) =>
          typingUserIds.includes(p.user.id) && p.user.id !== authUser?.id
      )
      .map((p) => p.user.fullName) || [];

  return (
    <div className={`flex-1 flex overflow-hidden ${className}`}>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-base-300 bg-base-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isGroup ? (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={name}
                    />
                  ) : (
                    <Users className="w-5 h-5 text-primary" />
                  )}
                </div>
              ) : (
                <img
                  src={avatar || "/avatar.png"}
                  alt={name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-base-100" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-base-content/60">
                {isGroup
                  ? `${selectedConversation?.participants.length} members`
                  : isOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>

          {/* ← Header right buttons — properly closed */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSummary(true)}
              className="btn btn-ghost btn-sm btn-circle"
              title="AI Summary"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {isGroup && (
              <button
                onClick={() => setShowGroupInfo(!showGroupInfo)}
                className={`btn btn-ghost btn-sm btn-circle ${
                  showGroupInfo ? "bg-base-200" : ""
                }`}
                title="Group info"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => selectConversation(null as any)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div> {/* ← End of Header */}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-base-200">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-base-content/40 text-sm">
              No messages yet. Say hello! 👋
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} setReplyingTo={setReplyingTo} />
            ))
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(", ")} are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div> {/* ← End of Messages */}

        {/* Input */}
        <MessageInput replyingTo={replyingTo} setReplyingTo={setReplyingTo} />

      </div> {/* ← End of Main Chat Area */}

      {/* Group Info Side Panel */}
      {isGroup && showGroupInfo && selectedConversation && (
        <GroupInfoPanel
          conversation={selectedConversation}
          onClose={() => setShowGroupInfo(false)}
          onlineUserIds={onlineUserIds}
        />
      )}

      {/* Summary Modal */}
      {showSummary && selectedConversation && (
        <SummaryModal
          conversationId={selectedConversation.id}
          conversationName={name}
          onClose={() => setShowSummary(false)}
        />
      )}

    </div> // ← End of root flex container
  );
};

export default ChatContainer;