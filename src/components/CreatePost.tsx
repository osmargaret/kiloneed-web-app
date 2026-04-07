import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image, X, Send, Paperclip, Search, Clock, Globe, Users, UserCheck,
  Lock, ChevronDown, ChevronUp
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostData {
  id: number;
  text: string;
  media: { type: "image" | "video"; url: string }[];
  author: string;
  avatar: string;
  location: string;
  postedAt: string;
  categories?: string[];
  privacy?: string;
  expiresIn?: string;
}

interface CreatePostProps {
  onPost: (post: PostData) => void;
}

const CATEGORIES = [
  { icon: "💻", label: "Electronics" },
  { icon: "🏠", label: "Housing & Real Estates" },
  { icon: "🚗", label: "Automobiles" },
  { icon: "👗", label: "Fashion & Clothing" },
  { icon: "🍔", label: "Food & Beverages" },
  { icon: "🔧", label: "Services" },
  { icon: "📚", label: "Education" },
  { icon: "💼", label: "Jobs" },
  { icon: "🏥", label: "Health & Medical" },
  { icon: "🎉", label: "Events" },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe },
  { value: "connections", label: "Connections", icon: Users },
  { value: "groups", label: "Groups", icon: UserCheck },
  { value: "only_me", label: "Only Me", icon: Lock },
];

const CreatePost = ({ onPost }: CreatePostProps) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState<{ type: "image" | "video"; url: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [catOpen, setCatOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // Privacy / Connections
  const [privacy, setPrivacy] = useState("public");

  // Choose Connections modal
  const [connModalOpen, setConnModalOpen] = useState(false);
  const [connOption, setConnOption] = useState<"all" | "except" | "only">("all");
  const [connExcept, setConnExcept] = useState("");
  const [connOnly, setConnOnly] = useState("");

  // Expires in
  const [expiresOpen, setExpiresOpen] = useState(false);
  const [expiresValue, setExpiresValue] = useState("1");
  const [expiresUnit, setExpiresUnit] = useState("Hour");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia = Array.from(files).map((file) => ({
      type: file.type.startsWith("video") ? "video" as const : "image" as const,
      url: URL.createObjectURL(file),
      file,
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const privacyLabel = PRIVACY_OPTIONS.find((p) => p.value === privacy);
  const PrivacyIcon = privacyLabel?.icon || Globe;

  const handleSubmit = () => {
    if (!text.trim() && mediaFiles.length === 0) return;
    const expiresStr = expiresValue && expiresUnit ? `${expiresValue} ${expiresUnit}` : undefined;
    onPost({
      id: Date.now(),
      text: text.trim(),
      media: mediaFiles.map(({ type, url }) => ({ type, url })),
      author: "You",
      avatar: "YO",
      location: "Your Location",
      postedAt: "Just now",
      categories: selectedCats.length > 0 ? selectedCats : undefined,
      privacy,
      expiresIn: expiresStr,
    });
    setText("");
    setMediaFiles([]);
    setSelectedCats([]);
    setPrivacy("public");
    setExpiresValue("1");
    setExpiresUnit("Hour");
    setExpanded(false);
  };

  return (
    <>
      <div className="gradient-card rounded-xl border border-border shadow-card sm:rounded-2xl">
        {/* Collapsed / Expand trigger */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer sm:p-4"
          onClick={() => !expanded && setExpanded(true)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-blue text-xs font-bold text-primary-foreground sm:h-10 sm:w-10">
            YO
          </div>
          {!expanded ? (
            <div className="flex-1 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
              What do you need...
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What do you need..."
                rows={3}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Media previews */}
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2 sm:px-4">
                  {mediaFiles.map((media, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                      {media.type === "image" ? (
                        <img src={media.url} alt="" className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                      ) : (
                        <video src={media.url} className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                      )}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected categories chips */}
              {selectedCats.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2 sm:px-4">
                  {selectedCats.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                    >
                      {cat}
                      <button onClick={() => toggleCategory(cat)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-2 sm:px-3 sm:gap-0">
                {/* Add Media */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-secondary sm:px-3 sm:text-xs"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Add Media
                </button>

                {/* Categories */}
                <button
                  onClick={() => setCatOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-secondary sm:px-3 sm:text-xs"
                >
                  <Search className="h-3.5 w-3.5" />
                  Categories
                </button>

                {/* Connections / Privacy dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-secondary sm:px-3 sm:text-xs"
                    >
                      <PrivacyIcon className="h-3.5 w-3.5" />
                      {privacyLabel?.label || "Connections"}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="min-w-[150px]">
                    {PRIVACY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => {
                            setPrivacy(opt.value);
                            if (opt.value === "connections") {
                              setTimeout(() => setConnModalOpen(true), 150);
                            }
                          }}
                          className={`flex items-center gap-2 text-xs ${
                            privacy === opt.value ? "bg-primary/10 text-primary font-semibold" : ""
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {opt.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Expires in */}
                <button
                  onClick={() => setExpiresOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary sm:px-3 sm:text-xs"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Expires in
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Post button */}
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() && mediaFiles.length === 0}
                  className="flex items-center justify-center gap-1.5 rounded-lg gradient-blue px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  Post
                </button>
              </div>

              {/* Collapse button */}
              <div className="flex justify-center pb-1">
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />
      </div>

      {/* Categories Modal */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Select Categories</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-3">
            {selectedCats.map((cat) => {
              const c = CATEGORIES.find((cc) => cc.label === cat);
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {c?.icon} {cat}
                  <button onClick={() => toggleCategory(cat)}>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.filter((c) => !selectedCats.includes(c.label)).map((cat) => (
              <button
                key={cat.label}
                onClick={() => toggleCategory(cat.label)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCatOpen(false)}
            className="mt-3 w-full rounded-lg gradient-blue py-2.5 text-sm font-bold text-primary-foreground"
          >
            Set Category
          </button>
        </DialogContent>
      </Dialog>

      {/* Choose Connections Modal */}
      <Dialog open={connModalOpen} onOpenChange={setConnModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Connections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="conn"
                checked={connOption === "all"}
                onChange={() => setConnOption("all")}
                className="accent-primary h-4 w-4"
              />
              <span className="text-sm font-medium text-foreground">All Connections</span>
            </label>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="conn"
                  checked={connOption === "except"}
                  onChange={() => setConnOption("except")}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-sm font-medium text-foreground">All Connections Except</span>
              </label>
              {connOption === "except" && (
                <input
                  value={connExcept}
                  onChange={(e) => setConnExcept(e.target.value)}
                  placeholder="Type names to exclude..."
                  className="mt-2 ml-7 w-[calc(100%-1.75rem)] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="conn"
                  checked={connOption === "only"}
                  onChange={() => setConnOption("only")}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-sm font-medium text-foreground">Only these Connections</span>
              </label>
              {connOption === "only" && (
                <input
                  value={connOnly}
                  onChange={(e) => setConnOnly(e.target.value)}
                  placeholder="Type names to include..."
                  className="mt-2 ml-7 w-[calc(100%-1.75rem)] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setConnModalOpen(false)}
              className="rounded-lg gradient-blue px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Set Privacy
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expires In Modal */}
      <Dialog open={expiresOpen} onOpenChange={setExpiresOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
          <DialogHeader>
            <DialogTitle>Expire in</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3 py-4">
            <input
              type="number"
              min="1"
              value={expiresValue}
              onChange={(e) => setExpiresValue(e.target.value)}
              className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <select
              value={expiresUnit}
              onChange={(e) => setExpiresUnit(e.target.value)}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option>Hour</option>
              <option>Day</option>
              <option>Week</option>
              <option>Month</option>
            </select>
          </div>
          <button
            onClick={() => setExpiresOpen(false)}
            className="w-full rounded-lg gradient-blue py-2.5 text-sm font-bold text-primary-foreground"
          >
            Save
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
