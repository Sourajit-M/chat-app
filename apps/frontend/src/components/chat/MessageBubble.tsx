import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Reply, Trash2, Check, CheckCheck, Ban } from "lucide-react";
import type { Message } from "@chat-app/shared";

interface Props {
  message: Message;
  setReplyingTo?: (message: Message | null) => void;
}

const MessageBubble = ({ message, setReplyingTo }: Props) => {
  const { authUser } = useAuthStore();
  const { deleteMessage } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  
  const isSentByMe = message.senderId === authUser?.id;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(message.id);
    }
    setShowMenu(false);
  };

  if (message.isDeleted) {
    return (
      <div className={`flex items-end gap-2 ${isSentByMe ? "flex-row-reverse" : "flex-row"}`}>
        <img
          src={message.sender?.profilePic || "/avatar.png"}
          alt={message.sender?.fullName}
          className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 opacity-50"
        />
        <div className={`flex flex-col gap-1 max-w-[70%] ${isSentByMe ? "items-end" : "items-start"}`}>
          <div className="px-4 py-2.5 rounded-2xl text-sm italic text-base-content/50 border border-base-300 bg-base-200/50 flex items-center gap-2">
            <Ban className="w-4 h-4" />
            This message was deleted
          </div>
          <span className="text-[10px] text-base-content/40 px-1">{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-end gap-2 group ${isSentByMe ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Avatar */}
      <img
        src={message.sender?.profilePic || "/avatar.png"}
        alt={message.sender?.fullName}
        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
      />

      {/* Bubble Container */}
      <div className={`flex flex-col gap-1 max-w-[70%] relative ${isSentByMe ? "items-end" : "items-start"}`}>
        
        {/* Hover Menu */}
        {showMenu && (
          <div className={`absolute -top-8 flex items-center gap-1 bg-base-100 border border-base-300 shadow-sm rounded-lg p-1 z-10 ${isSentByMe ? "right-0" : "left-0"}`}>
            {setReplyingTo && (
              <button 
                onClick={() => setReplyingTo(message)}
                className="btn btn-ghost btn-xs btn-square hover:bg-base-200 text-base-content/70"
                title="Reply"
              >
                <Reply className="w-3.5 h-3.5" />
              </button>
            )}
            {isSentByMe && (
              <button 
                onClick={handleDelete}
                className="btn btn-ghost btn-xs btn-square hover:bg-error/10 text-error"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Sender name (for groups) */}
        {!isSentByMe && message.sender?.fullName && (
          <span className="text-xs text-base-content/50 px-1">
            {message.sender.fullName}
          </span>
        )}

        {/* Quoted Reply */}
        {message.replyTo && (
          <div className="bg-base-300/50 rounded-lg p-2 mb-1 border-l-4 border-primary text-xs opacity-75 max-w-xs truncate">
            <span className="font-semibold text-primary">{message.replyTo.sender?.fullName || "User"}</span>
            <p className="truncate text-base-content/70 mt-0.5">
              {message.replyTo.video ? "🎥 Video" : message.replyTo.image ? "📸 Photo" : message.replyTo.text}
            </p>
          </div>
        )}

        {/* Image */}
        {message.image && (
          <img
            src={message.image}
            alt="message"
            className="max-w-xs rounded-xl object-cover border border-base-300 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.image!, "_blank")}
          />
        )}

        {/* Video */}
        {message.video && (
          <video
            src={message.video}
            className="max-w-xs rounded-xl object-cover border border-base-300"
            controls
          />
        )}

        {/* Text */}
        {message.text && (
          <div
            className={`
              px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              ${isSentByMe
                ? "bg-primary text-primary-content rounded-br-sm"
                : "bg-base-200 text-base-content rounded-bl-sm"
              }
            `}
          >
            {message.text}
          </div>
        )}

        {/* Timestamp + Read */}
        <div className="flex items-center gap-1 px-1 mt-0.5">
          <span className="text-[10px] text-base-content/40">{time}</span>
          {isSentByMe && (
            <span className={message.isRead ? "text-info" : "text-base-content/40"}>
              {message.isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3 h-3" />}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;