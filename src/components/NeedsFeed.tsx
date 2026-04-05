import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Need {
  id: number;
  author: string;
  avatar: string;
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

const mockNeeds: Need[] = [
  {
    id: 1,
    author: "Adebayo Ogunlesi",
    avatar: "AO",
    location: "Ikeja, Lagos",
    radius: "5km",
    text: "I need a reliable electrician for a full rewiring job in a 3-bedroom flat. Must be available this weekend. Budget ₦80,000–₦120,000.",
    postedAt: "2h ago",
    expiresAt: "3 days left",
    saves: 12,
    shares: 4,
    reposts: 2,
    recos: 8,
    comments: [
      { id: 1, author: "ChiefSparks NG", text: "I can handle this. 10 years experience. DM me for my portfolio.", time: "1h ago" },
      { id: 2, author: "Emeka Voltage", text: "Available this Saturday. Licensed with NEMSA cert. ₦95k all inclusive.", time: "45m ago" },
    ],
  },
  {
    id: 2,
    author: "Fatima Bello",
    avatar: "FB",
    location: "Wuse, Abuja",
    radius: "10km",
    text: "Looking for a Samsung Galaxy S24 Ultra, 256GB, any colour. Must be brand new and sealed. Budget up to ₦750,000.",
    postedAt: "5h ago",
    expiresAt: "7 days left",
    saves: 24,
    shares: 11,
    reposts: 5,
    recos: 15,
    comments: [
      { id: 1, author: "PhoneHub Abuja", text: "We have Phantom Black in stock. ₦720k. Can deliver today.", time: "3h ago" },
    ],
  },
  {
    id: 3,
    author: "Chinedu Okoro",
    avatar: "CO",
    location: "GRA, Port Harcourt",
    radius: "3km",
    text: "Need a professional photographer for a product shoot. 50 items for an online store. Studio or on-location.",
    postedAt: "1d ago",
    expiresAt: "5 days left",
    saves: 7,
    shares: 3,
    reposts: 1,
    recos: 4,
    comments: [],
  },
];

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
          <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
            {need.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-semibold text-foreground text-sm">{need.author}</span>
              <span className="text-[11px] text-muted-foreground">· {need.postedAt}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {need.location} · {need.radius} radius
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
          {mockNeeds.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeedsFeed;
