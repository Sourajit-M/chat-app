import { useState, useRef, ChangeEvent } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getSocket } from "../../lib/socket";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const { selectedConversation, sendMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
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
    if (!text.trim() && !imagePreview) return;
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
      image: imagePreview || undefined,
    });

    setText("");
    setImagePreview(null);
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
    <div className="p-4 border-t border-base-300 bg-base-100">

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative w-fit">
          <img
            src={imagePreview}
            alt="preview"
            className="h-24 w-24 object-cover rounded-xl border border-base-300"
          />
          <button
            onClick={() => {
              setImagePreview(null);
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

        {/* Image Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle shrink-0"
          type="button"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
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
          disabled={isSending || (!text.trim() && !imagePreview)}
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