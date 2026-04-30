import { useSocket } from "../hooks/useSocket";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/sidebar/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import NoChatSelected from "../components/chat/NoChatSelected";

const HomePage = () => {
  const { onlineUserIds } = useSocket();
  const { selectedConversation } = useChatStore();
  useConnectionStatus();

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar 
        onlineUserIds={onlineUserIds} 
        className={selectedConversation ? "hidden md:flex" : "flex w-full"} 
      />

      {selectedConversation ? (
        <ChatContainer 
          onlineUserIds={onlineUserIds} 
          className="flex w-full"
        />
      ) : (
        <NoChatSelected />
      )}
    </div>
  );
};

export default HomePage;