import { useSocket } from "../hooks/useSocket";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/sidebar/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import { MessageSquare } from "lucide-react";

const HomePage = () => {
  const { onlineUserIds } = useSocket();
  const { selectedConversation } = useChatStore();

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar onlineUserIds={onlineUserIds} />

      {selectedConversation ? (
        <ChatContainer onlineUserIds={onlineUserIds} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-base-200 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Welcome to ChatApp</h2>
            <p className="text-base-content/60 mt-1">
              Select a conversation or start a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;