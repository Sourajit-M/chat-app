import { useState, ChangeEvent } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  X, Edit2, Check, UserPlus, UserMinus,
  Users, Crown, Search, Camera, Loader2
} from "lucide-react";
import type { Conversation } from "@chat-app/shared";

interface Props {
  conversation: Conversation;
  onClose: () => void;
  onlineUserIds: string[];
}

const GroupInfoPanel = ({ conversation, onClose, onlineUserIds }: Props) => {
  const { authUser } = useAuthStore();
  const { users, addGroupMember, removeGroupMember, updateGroup, updateGroupIcon } = useChatStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation.name || "");
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [isUpdatingIcon, setIsUpdatingIcon] = useState(false);

  const isAdmin = conversation.adminId === authUser?.id;
  const memberIds = conversation.participants.map((p) => p.user.id);

  const nonMembers = users.filter((u) => !memberIds.includes(u.id));
  const filteredNonMembers = nonMembers.filter((u) =>
    u.fullName.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === conversation.name) {
      setIsEditingName(false);
      return;
    }
    await updateGroup(conversation.id, newName.trim());
    setIsEditingName(false);
  };

  const handleIconUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setIsUpdatingIcon(true);
      await updateGroupIcon(conversation.id, base64Image);
      setIsUpdatingIcon(false);
    };
  };

  return (
    <div className="w-72 border-l border-base-300 bg-base-100 flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Group Info</span>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-xs btn-circle">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Group Name */}
      <div className="p-4 border-b border-base-300 space-y-3">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative">
            {conversation.groupIcon ? (
              <img
                src={conversation.groupIcon}
                alt={conversation.name || "Group"}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
            )}
            
            {isAdmin && (
              <label
                htmlFor="group-icon-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-1 rounded-full cursor-pointer transition-all duration-200 shadow-sm ${isUpdatingIcon ? "animate-pulse pointer-events-none" : ""}`}
              >
                {isUpdatingIcon ? (
                  <Loader2 className="w-3.5 h-3.5 text-base-100 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-base-100" />
                )}
                <input
                  type="file"
                  id="group-icon-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleIconUpload}
                  disabled={isUpdatingIcon}
                />
              </label>
            )}
          </div>
        </div>

        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              className="btn btn-primary btn-sm btn-circle"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-center">
              {conversation.name || "Unnamed Group"}
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsEditingName(true)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-center text-base-content/50">
          {conversation.participants.length} members
        </p>
      </div>

      {/* Members List */}
      <div className="p-4 space-y-2 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
            Members
          </span>
          {isAdmin && (
            <button
              onClick={() => setShowAddMembers(!showAddMembers)}
              className="btn btn-ghost btn-xs gap-1"
            >
              <UserPlus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>

        {/* Add Members Panel */}
        {showAddMembers && isAdmin && (
          <div className="bg-base-200 rounded-xl p-3 space-y-2 mb-3">
            <p className="text-xs font-medium text-base-content/60">Add members</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-base-content/40" />
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered input-xs w-full pl-8"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredNonMembers.length === 0 ? (
                <p className="text-xs text-center text-base-content/40 py-2">
                  No users to add
                </p>
              ) : (
                filteredNonMembers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      addGroupMember(conversation.id, user.id);
                      setMemberSearch("");
                    }}
                    className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-base-300 transition-colors text-left"
                  >
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs">{user.fullName}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-1">
          {conversation.participants.map(({ user }) => {
            const isOnline = onlineUserIds.includes(user.id);
            const isGroupAdmin = conversation.adminId === user.id;
            const isSelf = user.id === authUser?.id;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full ring-1 ring-base-100" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {user.fullName}
                      {isSelf && (
                        <span className="text-xs text-base-content/40 ml-1">(you)</span>
                      )}
                    </p>
                    {isGroupAdmin && (
                      <div className="flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-warning" />
                        <span className="text-[10px] text-warning">Admin</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove button — admin only, can't remove self */}
                {isAdmin && !isSelf && !isGroupAdmin && (
                  <button
                    onClick={() => removeGroupMember(conversation.id, user.id)}
                    className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                    title="Remove member"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default GroupInfoPanel;