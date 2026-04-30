"use client";

import { useEffect, useRef, useState } from "react";
import { GitBranch, Edit2, Copy, Trash2, Check, ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoredProfileMeta } from "@/lib/profile-store/types";

type BranchSelectorProps = {
  profiles: StoredProfileMeta[];
  currentProfileId: string;
  onSelect: (profileId: string) => void;
  onDuplicate: (profileId: string, newName: string) => void;
  onRename: (profileId: string, newName: string) => void;
  onDelete: (profileId: string) => void;
};

export default function BranchSelector({
  profiles,
  currentProfileId,
  onSelect,
  onDuplicate,
  onRename,
  onDelete
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentProfile = profiles.find((p) => p.profileId === currentProfileId) || profiles[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleRenameSubmit = (profileId: string) => {
    if (editName.trim()) {
      onRename(profileId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDuplicate = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = profiles.find((p) => p.profileId === profileId);
    if (!source) return;
    onDuplicate(profileId, `${source.profileName} (Copy)`);
    setIsOpen(false);
  };

  const handleDelete = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this version?")) {
      onDelete(profileId);
    }
  };

  if (!currentProfile) return null;

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <GitBranch className="h-4 w-4" />
        <span className="max-w-[120px] truncate">{currentProfile.profileName || "Master Profile"}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-md border bg-card p-1 shadow-lg z-50">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Versions
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto p-1">
            {profiles.map((profile) => {
              const isActive = profile.profileId === currentProfileId;
              const isEditing = editingId === profile.profileId;

              return (
                <div
                  key={profile.profileId}
                  className={cn(
                    "flex items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors cursor-pointer",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    if (!isEditing) {
                      onSelect(profile.profileId);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isActive ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <div className="h-4 w-4 shrink-0" />
                    )}
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSubmit(profile.profileId);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="flex-1 h-6 px-1 text-sm bg-background border rounded"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleRenameSubmit(profile.profileId)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="truncate flex-1">{profile.profileName || "Master Profile"}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 [&:focus-within]:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditName(profile.profileName || "Master Profile");
                          setEditingId(profile.profileId);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => handleDuplicate(profile.profileId, e)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {profiles.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(profile.profileId, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
