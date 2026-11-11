import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  AtSign,
  Share2,
  Bookmark,
  Repeat2,
  FileText,
  Download,
  Send,
  Sparkles,
  Globe,
  Users,
  UserCheck,
  Lock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CornerDownRight,
} from "lucide-react";
import { toast } from "sonner";
import { Need, NeedChatMessage } from "@/types/need";
import { needsStore } from "@/services/needsStore";
import { needsApiService } from "@/services/apiClient";
import { MentionModal } from "./MentionModal";

interface NeedDetailModalProps {
  need: Need | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const PRIVACY_ICONS = {
  public: { label: "Public", icon: Globe, color: "text-blue-500 bg-blue-500/10" },
  connections: { label: "Connections", icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
  groups: { label: "Groups", icon: UserCheck, color: "text-purple-500 bg-purple-500/10" },
  only_me: { label: "Only Me", icon: Lock, color: "text-muted-foreground bg-muted" },
};

export const NeedDetailModal: React.FC<NeedDetailModalProps> = ({
  need,
  open,
  onOpenChange,
  onUpdate,
}) => {
  if (!need) return null;

  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");
  const [chatMessage, setChatMessage] = useState("");
  const [chats, setChats] = useState<NeedChatMessage[]>(need.chats || []);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(need.isBookmarked));

  const [isSending, setIsSending] = useState(false);
  const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";

  // When modal opens, increment click count once & load real chats from backend
  useEffect(() => {
    if (open && need) {
      needsStore.incrementClick(need.id);
      onUpdate?.();

      // Fetch live chats from backend
      needsApiService
        .getChats(need.id)
        .then((remoteChats: any) => {
          if (Array.isArray(remoteChats) && remoteChats.length > 0) {
            const mapped: NeedChatMessage[] = remoteChats.map((c: any) => ({
              id: String(c.id),
              sender: c.sender_user?.name || c.senderUser?.name || c.sender || "Peer",
              text: c.text,
              time: c.created_at
                ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Just now",
              isMine: Boolean(c.isMine),
            }));
            setChats(mapped);
          } else {
            setChats(need.chats || []);
          }
        })
        .catch(() => {
          setChats(need.chats || []);
        });
    }
  }, [open, need?.id]);

  useEffect(() => {
    if (need && (!chats || chats.length === 0)) {
      setChats(need.chats || []);
    }
  }, [need]);

  const handleSendMessage = async (customText?: string) => {
    const msgText = (customText !== undefined ? customText : chatMessage).trim();
    if (!msgText || isSending) return;

    const optimisticMsg: NeedChatMessage = {
      id: "msg_" + Date.now(),
      sender: currentUserName,
      text: msgText,
      time: "Just now",
      isMine: true,
    };

    setChats((prev) => [...prev, optimisticMsg]);
    if (customText === undefined) {
      setChatMessage("");
    }
    setIsSending(true);

    try {
      await needsApiService.sendChat(need.id, msgText);
      needsStore.addResponse(need.id, msgText);
      onUpdate?.();
      toast.success(`Message sent in real time to ${need.author}`);
    } catch {
      // Local copy remains visible
      needsStore.addResponse(need.id, msgText);
      onUpdate?.();
      toast.success(`Message recorded for ${need.author}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await needsStore.toggleBookmark(need);
      setIsSaved(res.bookmarked);
      toast.success(res.bookmarked ? "Added to your favorites / bookmarks" : "Removed from bookmarks");
      onUpdate?.();
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  const handleRepost = async () => {
    try {
      const res = await needsStore.repostNeed(need);
      toast.success(res.reposted ? "Reposted this need to your timeline!" : "Removed repost");
      onUpdate?.();
    } catch {
      toast.error("Failed to update repost");
    }
  };

  const privacyInfo = PRIVACY_ICONS[need.privacy] || PRIVACY_ICONS.public;
  const PrivacyIcon = privacyInfo.icon;

  // Format expiry remaining
  const remainingHours = Math.max(0, Math.round((need.expiresAt - Date.now()) / (3600 * 1000)));
  const displayLocation = (need.location || "").replace(/\s*\(\d+(\.\d+)?\s*km\s*away\)/gi, "").trim();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-border bg-card flex flex-col">
          <DialogTitle className="sr-only">
            {need.author}'s Need
          </DialogTitle>
          <DialogDescription className="sr-only">
            {need.title || need.text || "Need details and author conversation"}
          </DialogDescription>
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-primary/20 shadow-xs">
                  <AvatarImage src={need.avatarUrl} alt={need.author} />
                  <AvatarFallback className="gradient-blue text-[11px] font-bold text-primary-foreground">
                    {need.avatar || need.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-display font-bold text-foreground text-xs sm:text-sm">
                      {need.author}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 font-semibold ${privacyInfo.color}`}>
                      <PrivacyIcon className="h-2 w-2" />
                      {privacyInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5 text-primary" />
                      {displayLocation}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-primary font-medium">
                      <Clock className="h-2.5 w-2.5" />
                      {remainingHours > 0 ? `Expires in ${remainingHours}h` : "Expires soon"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Compact Single-Line Analytics Strip ─── */}
            <div className="flex items-center justify-around py-1 px-2.5 mt-2 rounded-lg bg-background/80 border border-border/60 text-[10px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-3 w-3 text-blue-500" />
                <span className="font-bold text-foreground text-[11px]">{need.analytics?.clicks ?? 0}</span>
                <span>Clicks</span>
              </div>
              <span className="text-border/80">•</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-3 w-3 text-emerald-500" />
                <span className="font-bold text-foreground text-[11px]">{chats.length > 0 ? chats.length : (need.analytics?.responses ?? 0)}</span>
                <span>Replies</span>
              </div>
              <span className="text-border/80">•</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <AtSign className="h-3 w-3 text-purple-500" />
                <span className="font-bold text-foreground text-[11px]">{need.analytics?.mentions ?? 0}</span>
                <span>Mentions</span>
              </div>
            </div>

            {/* ─── Compact Segmented Tab Menu ─── */}
            <div className="flex p-0.5 bg-muted/60 rounded-lg border border-border/60 mt-2">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-1 px-2 rounded-md text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === "details"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Need Details & Specs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-1 px-2 rounded-md text-[10px] font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === "chat"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="h-2.5 w-2.5" />
                Chat with Author ({chats.length})
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {activeTab === "details" ? (
              <div className="space-y-3">
                {/* Need Title & Description */}
                <div>
                  <h3 className="font-display font-semibold text-xs sm:text-sm text-foreground leading-snug">
                    {need.title || need.text.slice(0, 60)}
                  </h3>
                  <p className="mt-1.5 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/60">
                    {need.text}
                  </p>
                </div>

                {/* Categories & Industry */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                    Industry & Categories
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {need.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold border border-primary/20"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Media Section (Images, Videos, Documents) */}
                {need.media.length > 0 && (
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">
                      Attached Media & Documents ({need.media.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {need.media.map((m, idx) => {
                        if (m.type === "image") {
                          return (
                            <div
                              key={idx}
                              className="rounded-xl overflow-hidden border border-border group relative bg-muted"
                            >
                              <img
                                src={m.url}
                                alt={m.alt || "Need media image"}
                                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {m.alt && (
                                <div className="p-1.5 text-[10px] text-muted-foreground bg-background/95 border-t border-border">
                                  <span className="font-semibold text-foreground">Alt: </span>
                                  {m.alt}
                                </div>
                              )}
                            </div>
                          );
                        } else if (m.type === "video") {
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border border-border bg-black">
                              <video src={m.url} controls className="w-full h-36 object-cover" />
                              <div className="p-1.5 text-[10px] text-white bg-black/80">
                                {m.name || "Video Attachment"}
                              </div>
                            </div>
                          );
                        } else {
                          // Document
                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-2.5"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <FileText className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {m.name || "Attached Document.pdf"}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {m.size || "1.2 MB"} · Document
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info(`Viewing ${m.name || "document"}`)}
                                className="h-7 text-[10px] px-2 rounded-lg shrink-0 gap-1"
                              >
                                <Download className="h-3 w-3" />
                                View
                              </Button>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Expiry & Location Details */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-[11px] space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-semibold text-foreground">
                      {need.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry countdown:</span>
                    <span className="font-semibold text-primary">
                      {remainingHours > 0 ? `${remainingHours} hours remaining` : "Expiring soon"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Privacy:</span>
                    <span className="font-semibold text-foreground capitalize">
                      {need.privacy.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── Requirement: User's chat with the author of the need ─── */
              <div className="flex flex-col h-full min-h-[260px]">
                {/* Chat History */}
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {chats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-1.5">
                      <MessageCircle className="h-7 w-7 mx-auto text-muted-foreground/30" />
                      <p className="text-xs font-medium text-foreground">No messages yet with @{need.author}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Send a message below to respond to this need.
                      </p>
                    </div>
                  ) : (
                    chats.map((c) => (
                      <div
                        key={c.id}
                        className={`flex flex-col ${c.isMine ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5 text-[9px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">{c.sender}</span>
                          <span>·</span>
                          <span>{c.time}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs leading-relaxed ${
                            c.isMine
                              ? "gradient-blue text-primary-foreground rounded-br-xs"
                              : "bg-secondary text-foreground rounded-bl-xs border border-border/80"
                          }`}
                        >
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto scrollbar-none">
                  {[
                    "Is your budget negotiable?",
                    "Available for delivery today",
                    "I can attend to this need",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setChatMessage(preset)}
                      className="text-[9px] sm:text-[10px] bg-muted/70 hover:bg-primary/10 hover:text-primary hover:border-primary/40 text-foreground/90 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border border-border/70 transition-all font-medium cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Message Input & Action Controls Combined in One Clean Row */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      title={isSaved ? "Saved" : "Bookmark"}
                      className={`h-7.5 w-7.5 rounded-lg flex items-center justify-center border transition-colors ${
                        isSaved ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Bookmark className={`h-3 w-3 ${isSaved ? "fill-primary" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={handleRepost}
                      title="Repost need"
                      className="h-7.5 w-7.5 rounded-lg flex items-center justify-center border bg-muted/40 border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Repeat2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMentionOpen(true)}
                      title="Mention peer"
                      className="h-7.5 w-7.5 rounded-lg flex items-center justify-center border bg-muted/40 border-border text-primary hover:bg-primary/10 transition-colors"
                    >
                      <AtSign className="h-3 w-3" />
                    </button>
                  </div>

                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message @${need.author}...`}
                    className="flex-1 h-7.5 text-xs rounded-lg bg-background border-border"
                    disabled={isSending}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage()}
                    disabled={!chatMessage.trim() || isSending}
                    className="gradient-blue text-primary-foreground h-7.5 px-2.5 rounded-lg gap-1 text-[11px] font-semibold shrink-0"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isSending ? "..." : "Send"}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons (Only shown on Details tab) */}
          {activeTab === "details" && (
            <div className="p-2 sm:p-2.5 border-t border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleBookmark}
                  title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
                  className={`h-7 w-7 rounded-lg border-border/80 ${
                    isSaved ? "bg-primary/10 text-primary border-primary/30" : "hover:bg-muted"
                  }`}
                >
                  <Bookmark className={`h-3 w-3 ${isSaved ? "fill-primary" : ""}`} />
                  <span className="sr-only">Bookmark</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRepost}
                  title="Repost need"
                  className="h-7 w-7 rounded-lg border-border/80 hover:bg-muted"
                >
                  <Repeat2 className="h-3 w-3" />
                  <span className="sr-only">Repost</span>
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMentionOpen(true)}
                  title="Mention peer"
                  className="h-7 w-7 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                >
                  <AtSign className="h-3 w-3" />
                  <span className="sr-only">Mention Peer</span>
                </Button>
              </div>

              <Button
                size="sm"
                onClick={() => setActiveTab("chat")}
                className="gradient-blue text-primary-foreground h-7 px-3 text-[10px] font-semibold rounded-lg gap-1 shadow-xs"
              >
                <MessageCircle className="h-2.5 w-2.5" />
                <span>Respond to Author</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mention Modal Popup */}
      <MentionModal
        need={need}
        open={mentionOpen}
        onOpenChange={setMentionOpen}
        onSuccess={onUpdate}
      />
    </>
  );
};
