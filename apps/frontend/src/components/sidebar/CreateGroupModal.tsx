import { useState } from "react";
import { X, Search, Users } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

interface Props {
  onClose: () => void;
}

const CreateGroupModal = ({ onClose }: Props) => {
  const { users, createGroup } = useChatStore();
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 2) return;
    await createGroup({ name: groupName.trim(), memberIds: selectedIds });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Create Group</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Name */}
        <input
          type="text"
          placeholder="Group name..."
          className="input input-bordered w-full"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        {/* Search Members */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search members..."
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Selected Count */}
        {selectedIds.length > 0 && (
          <p className="text-sm text-primary font-medium">
            {selectedIds.length} member{selectedIds.length > 1 ? "s" : ""} selected
            {selectedIds.length < 2 && " (need at least 2)"}
          </p>
        )}

        {/* User List */}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filtered.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={selectedIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
              />
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{user.fullName}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="btn btn-primary flex-1"
            disabled={!groupName.trim() || selectedIds.length < 2}
          >
            Create Group
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateGroupModal;