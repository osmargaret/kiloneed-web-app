import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bookmark,
  Share2,
  Repeat2,
  MessageCircle,
  MapPin,
  Clock,
  MoreHorizontal,
  AtSign,
  FileText,
  Eye,
  ShieldAlert,
  Ban,
  Download,
  Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Need } from "@/types/need";
import { needsStore } from "@/services/needsStore";
import { MentionModal } from "./MentionModal";
import { ReportModal } from "./ReportModal";
import { NeedDetailModal } from "./NeedDetailModal";

interface FeedPostProps {
  post: Need;
  onUpdate?: () => void;
  onBlock?: (author: string) => void;
}

export const FeedPost = ({ post, onUpdate, onBlock }: FeedPostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [savesCount, setSavesCount] = useState(post.saves ?? 0);
  const [repostsCount, setRepostsCount] = useState(post.reposts ?? 0);
  const [sharesCount, setSharesCount] = useState(post.shares ?? 0);
  const [mentionsCount, setMentionsCount] = useState(post.analytics?.mentions ?? 0);

  const [reactions, setReactions] = useState({
    saved: Boolean(post.isBookmarked),
    shared: false,
    reposted: Boolean(post.isReposted),
  });

  const handleToggleBookmark = async () => {
    try {
      const res = await needsStore.toggleBookmark(post);
      setReactions((prev) => ({ ...prev, saved: res.bookmarked }));
      setSavesCount(res.saves);
      toast.success(res.bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
      onUpdate?.();
    } catch {
      toast.error("Unable to update bookmark");
    }
  };

  const handleRepost = async () => {
    try {
      const res = await needsStore.repostNeed(post);
      setReactions((prev) => ({ ...prev, reposted: res.reposted }));
      setRepostsCount(res.reposts);
      toast.success(res.reposted ? "Reposted to your timeline" : "Removed repost");
      onUpdate?.();
    } catch {
      toast.error("Unable to update repost");
    }
  };

  const handleShare = async () => {
    try {
      const newShares = await needsStore.shareNeed(post.id);
      setSharesCount(newShares);
    } catch {
      // ignore
    }

    const shareUrl = `${window.location.origin}/feed?need=${post.id}`;
    const shareText = `Check out this need by ${post.author} on KiloNeed: "${post.text.slice(0, 80)}..."`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "KiloNeed",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Need shared");
        return;
      } catch (e: any) {
        if (e.name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Link copied to clipboard");
    } else {
      toast.info("Need shared");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    const commentText = newComment.trim();
    setNewComment("");

    try {
      const created = await needsStore.addComment(post.id, commentText);
      setComments((prev) => {
        const exists = prev.some((c) => c.id === created.id);
        return exists ? prev : [...prev, created];
      });
      toast.success("Response sent");
      onUpdate?.();
    } catch {
      toast.error("Failed to post response. Please check your connection.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleBlockUser = () => {
    needsStore.blockAuthor(post.author);
    toast.success(`Blocked @${post.author}`);
    onBlock?.(post.author);
    onUpdate?.();
  };

  const totalResponses = Math.max(post.analytics?.responses || 0, comments.length);

  const remainingHours = Math.max(
    0,
    Math.round((post.expiresAt - Date.now()) / (3600 * 1000))
  );

  const isDuplicateTitle =
    !post.title ||
    post.title.trim() === post.text.trim() ||
    post.text.startsWith(post.title.replace(/\.\.\.$/, "").trim());

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/70 bg-card hover:border-border transition-colors overflow-hidden shadow-xs"
      >
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                className="h-10 w-10 shrink-0 ring-1 ring-border cursor-pointer"
                onClick={() => setDetailOpen(true)}
              >
                <AvatarImage src={post.avatarUrl} alt={post.author} className="object-cover" />
                <AvatarFallback className="gradient-blue text-xs font-bold text-primary-foreground">
                  {post.avatar || post.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    onClick={() => setDetailOpen(true)}
                    className="font-semibold text-foreground text-sm hover:underline cursor-pointer truncate"
                  >
                    {post.author}
                  </span>
                  <span className="text-xs text-muted-foreground">· {post.postedAt}</span>
                  {post.privacy && post.privacy !== "public" && (
                    <span className="text-[10px] text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded capitalize">
                      {post.privacy.replace("_", " ")}
                    </span>
                  )}
                </div>

                {/* Subtitle: Location & Expiry */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                    <span>{(post.location || "").replace(/\s*\(\d+(\.\d+)?\s*km\s*away\)/gi, "").trim()}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-primary shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{remainingHours > 0 ? `${remainingHours}h left` : "Expires soon"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  aria-label="Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                <DropdownMenuItem
                  onClick={() => setDetailOpen(true)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details & Stats
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setMentionOpen(true)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <AtSign className="h-3.5 w-3.5" />
                  Mention Someone
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleRepost}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Repeat2 className="h-3.5 w-3.5" />
                  Repost to Timeline
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleToggleBookmark}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {reactions.saved ? "Remove Bookmark" : "Save Bookmark"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleBlockUser}
                  className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Block @{post.author}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setReportOpen(true)}
                  className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Report Need
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Categories tag pills */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                >
                  #{cat}
                </span>
              ))}
            </div>
          )}

          {/* Post Content */}
          <div
            onClick={() => setDetailOpen(true)}
            className="cursor-pointer mt-2.5 space-y-1"
          >
            {!isDuplicateTitle && (
              <h4 className="font-semibold text-sm text-foreground leading-snug">
                {post.title}
              </h4>
            )}
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {post.text}
            </p>
          </div>
        </div>

        {/* Media Attachments */}
        {post.media && post.media.length > 0 && (
          <div className="px-4 pb-2">
            {post.media.map((m, i) => {
              if (m.type === "image") {
                return (
                  <div
                    key={i}
                    onClick={() => setDetailOpen(true)}
                    className="rounded-xl overflow-hidden border border-border/80 cursor-pointer mb-2 bg-muted/40"
                  >
                    <img
                      src={m.url}
                      alt={m.alt || "Need media"}
                      className="w-full max-h-80 object-cover hover:opacity-95 transition-opacity"
                    />
                  </div>
                );
              } else if (m.type === "video") {
                return (
                  <div key={i} className="rounded-xl overflow-hidden border border-border/80 bg-black mb-2">
                    <video src={m.url} controls className="w-full max-h-80 object-cover" />
                  </div>
                );
              } else {
                return (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between gap-3 mb-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {m.name || "Specification.pdf"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{m.size || "Document"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.info(`Viewing ${m.name || "file"}`)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Download className="h-3 w-3" /> View
                    </button>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* ─── Simple & Clean Action Bar (Unified Single Row, Functional in Real Time) ─── */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 text-xs text-muted-foreground">
          {/* 1. Comments / Responses button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${
              showComments ? "text-primary font-semibold" : ""
            }`}
            title="View responses & comment in real time"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">{totalResponses > 0 ? totalResponses : ""}</span>
          </button>

          {/* 2. Mention button */}
          <button
            onClick={() => setMentionOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Mention peers in real time"
          >
            <AtSign className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">{mentionsCount > 0 ? mentionsCount : ""}</span>
          </button>

          {/* 3. Repost button */}
          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${
              reactions.reposted ? "text-primary font-semibold" : ""
            }`}
            title="Repost need to timeline in real time"
          >
            <Repeat2 className="h-4 w-4 shrink-0" />
            <span className="text-xs font-medium">{repostsCount > 0 ? repostsCount : ""}</span>
          </button>

          {/* 4. Bookmark button */}
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              reactions.saved
                ? "bg-muted text-primary font-semibold border border-primary/20 shadow-xs"
                : "hover:text-foreground hover:bg-muted"
            }`}
            title="Bookmark need in real time"
          >
            <Bookmark className={`h-4 w-4 shrink-0 ${reactions.saved ? "fill-primary" : ""}`} />
            <span className="text-xs font-medium">{savesCount > 0 ? savesCount : ""}</span>
          </button>

          {/* 5. Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Share need"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            {sharesCount > 0 && <span className="text-xs font-medium">{sharesCount}</span>}
          </button>
        </div>

        {/* Inline Comments & Quick Response Drawer */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/60 bg-muted/20"
            >
              <div className="p-3.5 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    No responses yet. Send the first response to @{post.author}!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full gradient-blue flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0 mt-0.5">
                        {c.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 bg-background p-2 rounded-xl border border-border/70 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-foreground">{c.author}</span>
                          <span className="text-[10px] text-muted-foreground">{c.time}</span>
                        </div>
                        <p className="text-foreground/90 mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* Input row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={`Respond to @${post.author}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 bg-background rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary border border-border"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="p-2 rounded-xl gradient-blue text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Details Modal */}
      <NeedDetailModal
        need={post}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={onUpdate}
      />

      {/* Mention Modal */}
      <MentionModal
        need={post}
        open={mentionOpen}
        onOpenChange={setMentionOpen}
        onSuccess={(count) => {
          if (typeof count === "number") {
            setMentionsCount(count);
          } else {
            setMentionsCount((prev) => prev + 1);
          }
          onUpdate?.();
        }}
      />

      {/* Report Modal */}
      <ReportModal
        need={post}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  );
};

export default FeedPost;
