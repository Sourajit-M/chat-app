import { useAuthStore } from "../../store/useAuthStore";
import type { Message } from "@chat-app/shared";

interface Props {
  message: Message;
}

const MessageBubble = ({ message }: Props) => {
  const { authUser } = useAuthStore();
  const isSentByMe = message.senderId === authUser?.id;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-end gap-2 ${isSentByMe ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <img
        src={message.sender?.profilePic || "/avatar.png"}
        alt={message.sender?.fullName}
        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
      />

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isSentByMe ? "items-end" : "items-start"}`}>

        {/* Sender name (for groups) */}
        {!isSentByMe && message.sender?.fullName && (
          <span className="text-xs text-base-content/50 px-1">
            {message.sender.fullName}
          </span>
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
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-base-content/40">{time}</span>
          {isSentByMe && (
            <span className={`text-[10px] ${message.isRead ? "text-primary" : "text-base-content/40"}`}>
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;