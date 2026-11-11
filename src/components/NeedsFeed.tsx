import { useState, useEffect } from "react";
import { needsApiService } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark, Share2, Repeat2, ThumbsUp, MessageCircle,
  MapPin, Clock, User, ChevronDown, ChevronUp, Send,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface Need {
  id: number;
  author: string;
  avatar: string;
  avatarUrl?: string;
  location: string;
  radius: string;
  text: string;
  image?: string;
  postedAt: string;
  expiresAt: string;
  saves: number;
  shares: number;
  reposts: number;
  recos: number;
  comments: Comment[];
}

const NeedCard = ({ need }: { need: Need }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState({
    saved: false, shared: false, reposted: false, recod: false,
  });

  const toggle = (key: keyof typeof reactions) => {
    setReactions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reactionButtons = [
    { key: "saved" as const, icon: Bookmark, label: "Save", count: need.saves },
    { key: "shared" as const, icon: Share2, label: "Share", count: need.shares },
    { key: "reposted" as const, icon: Repeat2, label: "Repost", count: need.reposts },
    { key: "recod" as const, icon: ThumbsUp, label: "Reco", count: need.recos },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 shrink-0 ring-1 ring-border shadow-xs">
            <AvatarImage src={need.avatarUrl} alt={need.author} className="object-cover" />
            <AvatarFallback className="gradient-blue text-xs font-bold text-primary-foreground">
              {need.avatar || need.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-foreground text-sm">{need.author}</span>
              <span className="text-[11px] text-muted-foreground">· {need.postedAt}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {need.location}
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Clock className="h-3 w-3" />
                {need.expiresAt}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-sm text-foreground/90 leading-relaxed">{need.text}</p>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-0 sm:gap-1 px-2 sm:px-5 py-2 sm:py-3 mt-2 border-t border-border flex-wrap">
        {reactionButtons.map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ml-auto"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>{need.comments.length}</span>
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Comments / Threads */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {need.comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Start a thread!</p>
              )}
              {need.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground shrink-0">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
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

              {/* Comment input */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button className="p-2 rounded-lg gradient-blue text-primary-foreground hover:opacity-90 transition-opacity">
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

const NeedsFeed = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    needsApiService.getFeed({ page: 1 })
      .then((res) => {
        if (Array.isArray(res?.needs)) {
          const mapped: Need[] = res.needs.map((n: any) => ({
            id: n.id,
            author: n.author || n.user?.name || "Member",
            avatar: (n.author || n.user?.name || "KN").slice(0, 2).toUpperCase(),
            avatarUrl: n.avatar || n.user?.avatar,
            location: n.location || "",
            radius: n.radius || "CSC",
            text: n.text || n.title || "",
            image: n.media?.[0]?.url || n.image,
            postedAt: n.postedAt || "Recently",
            expiresAt: n.expiresAt || "Active",
            saves: n.saves || 0,
            shares: n.shares || 0,
            reposts: n.reposts || 0,
            recos: n.recos || 0,
            comments: Array.isArray(n.comments) ? n.comments : [],
          }));
          setNeeds(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <section className="py-8 sm:py-16" id="needs">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Needs Near You</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            What People Need
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            Geo-fenced needs from people within your area. Respond to earn.
          </p>
        </motion.div>

        <div className="space-y-4">
          {needs.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeedsFeed;
