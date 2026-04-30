import { useState, useRef, ChangeEvent } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getSocket } from "../../lib/socket";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  replyingTo?: any;
  setReplyingTo?: (message: any) => void;
}

const MessageInput = ({ replyingTo, setReplyingTo }: Props) => {
  const { selectedConversation, sendMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    if (isImage && file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (isVideo && file.size > 20 * 1024 * 1024) {
      toast.error("Video must be less than 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setMediaPreview({ url: reader.result as string, type: isImage ? "image" : "video" });
    reader.readAsDataURL(file);
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !selectedConversation || !authUser) return;

    socket.emit("typing", {
      conversationId: selectedConversation.id,
      userId: authUser.id,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Emit stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId: selectedConversation.id,
        userId: authUser.id,
      });
    }, 2000);
  };

  const handleSend = async () => {
    if (!selectedConversation) return;
    if (!text.trim() && !mediaPreview) return;
    if (isSending) return;

    setIsSending(true);

    // Stop typing indicator
    const socket = getSocket();
    if (socket && authUser) {
      socket.emit("stopTyping", {
        conversationId: selectedConversation.id,
        userId: authUser.id,
      });
    }

    await sendMessage(selectedConversation.id, {
      text: text.trim() || undefined,
      image: mediaPreview?.type === "image" ? mediaPreview.url : undefined,
      video: mediaPreview?.type === "video" ? mediaPreview.url : undefined,
      replyToId: replyingTo?.id || undefined,
    });

    setText("");
    setMediaPreview(null);
    if (setReplyingTo) setReplyingTo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-base-300 bg-base-100 flex flex-col gap-2">

      {/* Replying To Preview */}
      {replyingTo && (
        <div className="bg-base-200 rounded-lg p-3 border-l-4 border-primary flex items-start justify-between">
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="text-xs font-semibold text-primary">
              Replying to {replyingTo.sender?.fullName || "User"}
            </span>
            <span className="text-xs text-base-content/70 truncate">
              {replyingTo.image ? "📸 Photo" : replyingTo.text}
            </span>
          </div>
          <button 
            onClick={() => setReplyingTo?.(null)}
            className="btn btn-ghost btn-xs btn-circle shrink-0 text-base-content/50 hover:bg-base-300 hover:text-base-content"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Media Preview */}
      {mediaPreview && (
        <div className="mb-1 relative w-fit">
          {mediaPreview.type === "image" ? (
            <img
              src={mediaPreview.url}
              alt="preview"
              className="h-24 w-24 object-cover rounded-xl border border-base-300"
            />
          ) : (
            <video
              src={mediaPreview.url}
              className="h-24 w-24 object-cover rounded-xl border border-base-300"
              controls
            />
          )}
          <button
            onClick={() => {
              setMediaPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">

        {/* Media Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle shrink-0"
          type="button"
          title="Upload image or video"
        >
          <Image className="w-5 h-5" />
        </button>

        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleMediaChange}
        />

        {/* Text Input */}
        <textarea
          className="textarea textarea-bordered flex-1 resize-none min-h-[44px] max-h-32 text-sm leading-relaxed py-2.5"
          placeholder="Type a message... (Enter to send)"
          value={text}
          onChange={(e) => { setText(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !mediaPreview)}
          className="btn btn-primary btn-sm btn-circle shrink-0"
          type="button"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default MessageInput;
