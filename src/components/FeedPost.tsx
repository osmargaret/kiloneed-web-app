import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bookmark, Share2, Repeat2, ThumbsUp, MessageCircle,
  MapPin, Clock, User, ChevronDown, ChevronUp, Send,
} from "lucide-react";

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface PostMedia {
  type: "image" | "video";
  url: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  location: string;
  text: string;
  media: PostMedia[];
  postedAt: string;
  expiresAt?: string;
  radius?: string;
  saves?: number;
  shares?: number;
  reposts?: number;
  recos?: number;
  comments?: Comment[];
}

const FeedPost = ({ post }: { post: Post }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [reactions, setReactions] = useState({
    saved: false, shared: false, reposted: false, recod: false,
  });

  const toggle = (key: keyof typeof reactions) => {
    setReactions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), author: "You", text: newComment.trim(), time: "Just now" },
    ]);
    setNewComment("");
  };

  const saves = post.saves ?? 0;
  const shares = post.shares ?? 0;
  const reposts = post.reposts ?? 0;
  const recos = post.recos ?? 0;

  const reactionButtons = [
    { key: "saved" as const, icon: Bookmark, label: "Save", count: saves },
    { key: "shared" as const, icon: Share2, label: "Share", count: shares },
    { key: "reposted" as const, icon: Repeat2, label: "Repost", count: reposts },
    { key: "recod" as const, icon: ThumbsUp, label: "Reco", count: recos },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-card overflow-hidden rounded-xl border border-border shadow-card sm:rounded-2xl"
    >
      {/* Header */}
      <div className="p-4 pb-0 sm:p-5 sm:pb-0">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-blue text-xs font-bold text-primary-foreground sm:h-10 sm:w-10">
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-foreground text-sm">{post.author}</span>
              <span className="text-[11px] text-muted-foreground">· {post.postedAt}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex min-w-0 max-w-full items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {post.location}
                  {post.radius && ` · ${post.radius} radius`}
                </span>
              </span>
              {post.expiresAt && (
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="h-3 w-3" />
                  {post.expiresAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Text */}
        {post.text && (
          <p className="mt-4 text-sm text-foreground/90 leading-relaxed">{post.text}</p>
        )}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className={`mt-3 ${post.media.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
          {post.media.map((m, i) => (
            <div key={i} className="overflow-hidden">
              {m.type === "image" ? (
                <img src={m.url} alt="" className="w-full max-h-72 object-cover sm:max-h-96" />
              ) : (
                <video src={m.url} controls className="w-full max-h-72 object-cover sm:max-h-96" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-border px-2.5 py-2 sm:px-5 sm:py-3">
        {reactionButtons.map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
              reactions[key]
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{reactions[key] ? count + 1 : count}</span>
          </button>
        ))}
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-0 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground sm:ml-auto sm:w-auto sm:text-xs"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{comments.length}</span>
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="space-y-3 p-3 sm:p-4">
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Start a thread!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">{c.text}</p>
                    <button className="text-[10px] text-primary font-medium mt-1 hover:underline">
                      Open thread →
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleComment}
                  className="p-2 rounded-lg gradient-blue text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedPost;
