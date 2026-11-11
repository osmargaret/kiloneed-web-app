import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Check, Send, Users, AtSign } from "lucide-react";
import { toast } from "sonner";
import { needsStore } from "@/services/needsStore";
import { connectionsApiService } from "@/services/apiClient";
import { Need } from "@/types/need";

interface MentionModalProps {
  need: Need;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newMentionsCount?: number) => void;
}

interface PeerConnection {
  id?: number | string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  mutual?: number;
}

export const MentionModal: React.FC<MentionModalProps> = ({
  need,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    connectionsApiService
      .getConnections()
      .then((res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          setConnections(
            res.map((u: any) => ({
              id: u.id,
              name: u.name,
              avatar: u.name?.slice(0, 2).toUpperCase() || "US",
              avatarUrl: u.avatar,
              role: u.company || u.industry || "Merchant",
              mutual: u.review_count || 0,
            }))
          );
        } else {
          // If no accepted connections yet, fetch suggestions/peers
          return connectionsApiService.getSuggestions().then((sugg: any) => {
            if (Array.isArray(sugg) && sugg.length > 0) {
              setConnections(
                sugg.map((u: any) => ({
                  id: u.id,
                  name: u.name,
                  avatar: u.name?.slice(0, 2).toUpperCase() || "US",
                  avatarUrl: u.avatar,
                  role: u.company || u.industry || "Merchant",
                  mutual: u.review_count || 0,
                }))
              );
            }
          });
        }
      })
      .catch(() => {
        // Offline or unauthenticated
        setConnections([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open]);

  const filteredConnections = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSendMentions = async () => {
    if (selected.length === 0 || isSubmitting) {
      toast.error("Please select at least one connection to mention.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await needsStore.mentionPeers(need.id, selected, need.text);
      toast.success(
        `Mentioned ${selected.length} peer${
          selected.length > 1 ? "s" : ""
        }! Notification sent in real time.`
      );
      setSelected([]);
      setSearch("");
      onOpenChange(false);
      onSuccess?.(res.mentions);
    } catch {
      toast.error("Failed to deliver mentions. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-0 overflow-hidden rounded-2xl border-border bg-card">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-blue flex items-center justify-center text-primary-foreground shadow-xs">
                <AtSign className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                Mention Someone to Attend
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Know someone who can fulfill this need? Type to search and select one or more connections. They will immediately receive a notification.
            </DialogDescription>
          </DialogHeader>

          {/* Need preview chip */}
          <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border/80 text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground shrink-0">Need:</span>
            <span className="truncate text-foreground/90 font-medium">
              "{need.title || need.text}"
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or industry..."
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border"
            />
          </div>
        </div>

        {/* Selected preview chips */}
        {selected.length > 0 && (
          <div className="px-4 py-2 border-b border-border bg-primary/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-semibold text-primary shrink-0">
              Selected ({selected.length}):
            </span>
            {selected.map((name) => (
              <span
                key={name}
                onClick={() => toggleSelect(name)}
                className="cursor-pointer inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                {name} ×
              </span>
            ))}
          </div>
        )}

        {/* Connections List */}
        <div className="max-h-64 overflow-y-auto p-2 sm:p-3 space-y-1 divide-y divide-border/30">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Loading peers...
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-1" />
              {search ? "No matching peers found" : "No connections found yet. Connect with peers from the Connect tab."}
            </div>
          ) : (
            filteredConnections.map((conn) => {
              const isSelected = selected.includes(conn.name);
              return (
                <div
                  key={conn.name}
                  onClick={() => toggleSelect(conn.name)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                    <AvatarImage src={conn.avatarUrl} alt={conn.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {conn.avatar || conn.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {conn.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {conn.role}
                    </p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? "gradient-blue text-primary-foreground shadow-xs"
                        : "border border-border text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-border flex items-center justify-between gap-2 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-xl"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSendMentions}
            disabled={selected.length === 0 || isSubmitting}
            className="gradient-blue text-primary-foreground rounded-xl text-xs font-bold gap-1.5 shadow-glow"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? "Sending..." : `Mention ${selected.length > 0 ? `(${selected.length})` : ""} & Notify`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default MentionModal;
