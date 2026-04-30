import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import ConversationItem from "./ConversationItem";
import CreateGroupModal from "./CreateGroupModal";
import { Users, Search, Plus, MessageSquare } from "lucide-react";

interface Props {
  onlineUserIds: string[];
  className?: string;
}

const Sidebar = ({ onlineUserIds, className = "" }: Props) => {
  const { conversations, users, getConversations, getUsers,
          getOrCreateDM, isLoadingConversations } = useChatStore();
  const { authUser } = useAuthStore();

  const [search, setSearch] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    getConversations();
    getUsers();
  }, [getConversations, getUsers]);

  const filteredConversations = conversations.filter((c) => {
    if (c.isGroup) return c.name?.toLowerCase().includes(search.toLowerCase());
    const other = c.participants.find((p) => p.user.id !== authUser?.id);
    return other?.user.fullName.toLowerCase().includes(search.toLowerCase());
  });

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <>
      <aside className={`h-full w-full md:w-72 border-r border-base-300 flex flex-col bg-base-100 ${className}`}>

        {/* Header */}
        <div className="p-4 border-b border-base-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold">Messages</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { setShowUsers(!showUsers); setUserSearch(""); }}
                className="btn btn-ghost btn-sm btn-circle"
                title="New DM"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn btn-ghost btn-sm btn-circle"
                title="New Group"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input input-bordered input-sm w-full pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* New DM — User List Dropdown */}
        {showUsers && (
          <div className="border-b border-base-300 p-3 space-y-2 bg-base-200">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
              Start a DM
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered input-xs w-full pl-8"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 mt-2">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-base-content/50">
                  <Users className="w-6 h-6 mb-2 opacity-40" />
                  <p className="text-xs">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => { getOrCreateDM(user.id); setShowUsers(false); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-base-300 transition-colors text-left"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-sm">{user.fullName}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            // Skeleton loaders
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-28 rounded" />
                  <div className="skeleton h-3 w-40 rounded" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-base-200/50 rounded-2xl border border-base-200 border-dashed m-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs text-base-content/60 mt-1 max-w-[200px]">
                Click the + icon above to start a direct message with someone, or create a group.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onlineUserIds={onlineUserIds}
              />
            ))
          )}
        </div>

      </aside>

      {showGroupModal && (
        <CreateGroupModal onClose={() => setShowGroupModal(false)} />
      )}
    </>
  );
};

export default Sidebar;