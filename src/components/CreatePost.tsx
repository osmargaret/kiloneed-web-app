import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  Video,
  FileText,
  X,
  Send,
  Paperclip,
  Search,
  Clock,
  Globe,
  Users,
  UserCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NeedMedia, PrivacyOption } from "@/types/need";
import { USER_INDUSTRY } from "@/services/needsStore";

interface PostData {
  text: string;
  media: NeedMedia[];
  categories: string[];
  privacy: PrivacyOption;
  expiresInHours: number; // Default 24 hours
}

interface CreatePostProps {
  onPost: (post: PostData) => void;
}

const CATEGORIES = [
  { icon: "💻", label: "Electronics" },
  { icon: "🔧", label: "Services" },
  { icon: "🏠", label: "Housing & Real Estates" },
  { icon: "🚗", label: "Automobiles" },
  { icon: "👗", label: "Fashion & Clothing" },
  { icon: "🍔", label: "Food & Beverages" },
  { icon: "📚", label: "Education" },
  { icon: "💼", label: "Jobs" },
  { icon: "🏥", label: "Health & Medical" },
  { icon: "🎉", label: "Events" },
];

const PRIVACY_OPTIONS: { value: PrivacyOption; label: string; icon: any; desc: string }[] = [
  { value: "public", label: "Public", icon: Globe, desc: "Visible to all users in geofence" },
  { value: "connections", label: "Connections", icon: Users, desc: "Visible only to your connections" },
  { value: "groups", label: "Groups", icon: UserCheck, desc: "Visible to members of your groups" },
  { value: "only_me", label: "Only Me", icon: Lock, desc: "Private draft for your eyes only" },
];

const EXPIRY_PRESETS = [
  { label: "24 Hours (Default)", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "7 Days", hours: 168 },
  { label: "14 Days", hours: 336 },
  { label: "30 Days", hours: 720 },
];

export const CreatePost = ({ onPost }: CreatePostProps) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState<
    (NeedMedia & { file?: File })[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Categories
  const [catOpen, setCatOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([USER_INDUSTRY]);

  // Privacy
  const [privacy, setPrivacy] = useState<PrivacyOption>("public");

  // Expiry Day & Time (DEFAULT IS 24 HOURS)
  const [expiresOpen, setExpiresOpen] = useState(false);
  const [selectedExpiryHours, setSelectedExpiryHours] = useState<number>(24);
  const [customDays, setCustomDays] = useState("1");
  const [customHours, setCustomHours] = useState("0");

  // Media alt editor modal
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null);
  const [altTextDraft, setAltTextDraft] = useState("");

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: (NeedMedia & { file?: File })[] = Array.from(files).map((file) => {
      const isVideo = file.type.startsWith("video");
      const isImage = file.type.startsWith("image");
      const type: NeedMedia["type"] = isVideo ? "video" : isImage ? "image" : "document";

      return {
        type,
        url: URL.createObjectURL(file),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        alt: isImage ? `${file.name.replace(/\.[^/.]+$/, "")} alt description` : undefined,
        file,
      };
    });

    setMediaFiles((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openAltEditor = (index: number) => {
    setEditingAltIndex(index);
    setAltTextDraft(mediaFiles[index].alt || "");
  };

  const saveAltText = () => {
    if (editingAltIndex !== null) {
      setMediaFiles((prev) =>
        prev.map((item, i) =>
          i === editingAltIndex ? { ...item, alt: altTextDraft.trim() } : item
        )
      );
      setEditingAltIndex(null);
      toast.success("Image alt description saved for keyword search!");
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const privacyConfig = PRIVACY_OPTIONS.find((p) => p.value === privacy) || PRIVACY_OPTIONS[0];
  const PrivacyIcon = privacyConfig.icon;

  const userName = localStorage.getItem("kiloneed_user_name") || "John Doe";
  const userAvatar = localStorage.getItem("kiloneed_avatar") || "";
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "JD";

  const handlePost = () => {
    if (!text.trim() && mediaFiles.length === 0) {
      toast.error("Please enter a description or attach media to post your need.");
      return;
    }

    const userCountry = localStorage.getItem("kiloneed_country") || "";
    const userState = localStorage.getItem("kiloneed_state") || "";
    const userCity = localStorage.getItem("kiloneed_city") || "";
    const userLocation = [userCity, userState, userCountry].filter(Boolean).join(", ");

    onPost({
      text: text.trim(),
      media: mediaFiles.map(({ type, url, name, size, alt }) => ({
        type,
        url,
        name,
        size,
        alt,
      })),
      categories: selectedCats.length > 0 ? selectedCats : [USER_INDUSTRY],
      privacy,
      expiresInHours: selectedExpiryHours,
      country: userCountry,
      state: userState,
      city: userCity,
      location: userLocation,
    } as any);

    toast.success("Your need was published! Added to bottom of feed.");
    setText("");
    setMediaFiles([]);
    setSelectedCats([USER_INDUSTRY]);
    setPrivacy("public");
    setSelectedExpiryHours(24); // Reset to default 24 hours
    setExpanded(false);
  };

  return (
    <>
      <div className="gradient-card rounded-xl border border-border/80 bg-card overflow-hidden">
        {/* Collapsed / Prompt header */}
        <div
          className={`flex ${expanded ? "items-start" : "items-center"} gap-2.5 p-2.5 sm:p-3 cursor-pointer`}
          onClick={() => !expanded && setExpanded(true)}
        >
          <div
            style={{ width: 32, height: 32, minWidth: 32, maxWidth: 32, minHeight: 32, maxHeight: 32 }}
            className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border shadow-xs mt-0.5"
          >
            <Avatar className="h-8 w-8 w-full h-full rounded-full" style={{ width: 32, height: 32 }}>
              <AvatarImage src={userAvatar} alt={userName} className="h-full w-full object-cover" />
              <AvatarFallback className="gradient-blue text-[10px] font-bold text-primary-foreground h-full w-full flex items-center justify-center">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {!expanded ? (
            <div className="flex-1 min-w-0 rounded-full border border-border bg-muted/40 hover:bg-muted/70 px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between transition-colors gap-2">
              <span className="truncate">What do you need? Post a request...</span>
              <div className="h-5 w-5 rounded-full gradient-blue flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                <Send className="h-2.5 w-2.5 -ml-0.5" />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 text-[10px] text-muted-foreground gap-2">
                <span className="font-semibold text-foreground text-[11px] truncate">Create a New Need</span>
                <span className="text-primary font-medium text-[9px] shrink-0 whitespace-nowrap">Default expiry: 24h</span>
              </div>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe what product, service, or assistance you need..."
                rows={2}
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
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
              {/* Media Previews (Images, Videos, Documents) */}
              {mediaFiles.length > 0 && (
                <div className="px-2.5 pb-2 sm:px-3 space-y-1.5">
                  <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    Attached Media & Docs ({mediaFiles.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mediaFiles.map((media, i) => (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-border bg-muted/40 p-1 flex items-center gap-1.5 max-w-xs"
                      >
                        {media.type === "image" ? (
                          <div className="relative">
                            <img
                              src={media.url}
                              alt={media.alt || ""}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => openAltEditor(i)}
                              title="Set Image Alt Text for Search"
                              className="absolute bottom-0.5 left-0.5 bg-black/80 text-white text-[8px] px-1 rounded hover:bg-primary transition-colors"
                            >
                              Alt
                            </button>
                          </div>
                        ) : media.type === "video" ? (
                          <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center text-white shrink-0">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 p-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-[7px] font-bold uppercase mt-0.5">DOC</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-5">
                          <p className="text-[10px] font-semibold text-foreground truncate">
                            {media.name || (media.type === "image" ? "Image attachment" : "Video")}
                          </p>
                          <p className="text-[9px] text-muted-foreground">{media.size || "1 MB"}</p>
                          {media.alt && (
                            <p className="text-[9px] text-primary truncate">Alt: {media.alt}</p>
                          )}
                        </div>

                        <button
                          onClick={() => removeMedia(i)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-background/90 text-foreground hover:bg-destructive hover:text-white transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Categories - Tiny discreet inline links (no bubbles) */}
              {selectedCats.length > 0 && (
                <div className="px-2.5 pb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                  <span className="text-[10px] font-medium text-muted-foreground/80">
                    Categories:
                  </span>
                  {selectedCats.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 transition-colors"
                    >
                      <span
                        className="underline underline-offset-2 decoration-primary/40 hover:decoration-primary cursor-pointer"
                        onClick={() => setCatOpen(true)}
                      >
                        {cat}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="text-muted-foreground hover:text-destructive text-[11px] leading-none px-0.5"
                        title={`Remove ${cat}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCatOpen(true)}
                    className="text-[10px] font-medium text-primary/80 hover:text-primary hover:underline transition-colors"
                  >
                    + Add
                  </button>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1 bg-muted/20">
                {/* 1. Add Media (Images & Videos) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted transition-colors"
                >
                  <Image className="h-3 w-3 text-primary" />
                  <span>Media</span>
                </button>

                {/* 2. Add Documents */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted transition-colors"
                >
                  <FileText className="h-3 w-3 text-emerald-500" />
                  <span>Document</span>
                </button>

                {/* 3. Categories button */}
                <button
                  type="button"
                  onClick={() => setCatOpen(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted transition-colors"
                >
                  <Tag className="h-3 w-3 text-purple-500" />
                  <span>Categories ({selectedCats.length})</span>
                </button>

                {/* 4. Privacy Dropdown (Public, Connections, Groups, Only Me) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted transition-colors"
                    >
                      <PrivacyIcon className="h-3 w-3 text-blue-500" />
                      <span>{privacyConfig.label}</span>
                      <ChevronDown className="h-2 w-2 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="w-52 p-1 rounded-xl">
                    {PRIVACY_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => setPrivacy(opt.value)}
                          className={`flex items-start gap-1.5 p-1.5 rounded-lg cursor-pointer ${
                            privacy === opt.value
                              ? "bg-primary/10 text-primary font-semibold"
                              : ""
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[11px] font-semibold">{opt.label}</div>
                            <div className="text-[9px] text-muted-foreground">{opt.desc}</div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 5. Expiry Day & Time (DEFAULT 24 HOURS) */}
                <button
                  type="button"
                  onClick={() => setExpiresOpen(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-muted transition-colors"
                >
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>
                    {selectedExpiryHours === 24
                      ? "Expires in 24h"
                      : `Expires in ${selectedExpiryHours}h`}
                  </span>
                </button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* 6. Post Button */}
                <Button
                  onClick={handlePost}
                  disabled={!text.trim() && mediaFiles.length === 0}
                  className="gradient-blue text-primary-foreground font-semibold text-xs h-7.5 px-3 rounded-lg shadow-glow gap-1"
                >
                  <Send className="h-2.5 w-2.5" />
                  Post Need
                </Button>
              </div>

              {/* Collapse bar */}
              <div className="flex justify-center py-0.5 bg-muted/10">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                >
                  <ChevronUp className="h-3 w-3" /> Collapse
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden inputs for media */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={handleMediaSelect}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          multiple
          hidden
          onChange={handleMediaSelect}
        />
      </div>

      {/* Categories Multi-Select Dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Select Need Categories</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You can select multiple industries & categories to help relevant people discover your need.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 py-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat.label);
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => toggleCategory(cat.label)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "gradient-blue text-primary-foreground border-transparent shadow-xs"
                      : "border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setCatOpen(false)}
              className="flex-1 rounded-xl h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setCatOpen(false)}
              className="flex-1 gradient-blue text-primary-foreground font-bold rounded-xl h-9 text-xs"
            >
              Done ({selectedCats.length} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expiry Day & Time Dialog (Default 24 Hours) */}
      <Dialog open={expiresOpen} onOpenChange={setExpiresOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Choose Expiry Day & Time
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Needs automatically expire and stop showing in feeds once the expiry window is reached. Default is 24 hours.
            </DialogDescription>
          </DialogHeader>

          {/* Quick presets */}
          <div className="space-y-2 py-3">
            <label className="text-xs font-bold text-foreground">Select Preset Duration</label>
            <div className="space-y-1.5">
              {EXPIRY_PRESETS.map((preset) => (
                <label
                  key={preset.hours}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedExpiryHours === preset.hours
                      ? "border-primary bg-primary/10 font-bold text-primary"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{preset.label}</span>
                  <input
                    type="radio"
                    name="expiry"
                    checked={selectedExpiryHours === preset.hours}
                    onChange={() => setSelectedExpiryHours(preset.hours)}
                    className="accent-primary"
                  />
                </label>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-border">
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Or Custom Duration
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={customDays}
                    onChange={(e) => {
                      setCustomDays(e.target.value);
                      const d = parseInt(e.target.value) || 1;
                      setSelectedExpiryHours(d * 24);
                    }}
                    placeholder="Days"
                    className="h-9 text-xs rounded-xl"
                  />
                  <span className="text-[10px] text-muted-foreground">Days</span>
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={customHours}
                    onChange={(e) => {
                      setCustomHours(e.target.value);
                      const d = parseInt(customDays) || 0;
                      const h = parseInt(e.target.value) || 0;
                      setSelectedExpiryHours(d * 24 + h);
                    }}
                    placeholder="Hours"
                    className="h-9 text-xs rounded-xl"
                  />
                  <span className="text-[10px] text-muted-foreground">Hours</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setExpiresOpen(false)}
              className="flex-1 rounded-xl h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setExpiresOpen(false)}
              className="flex-1 gradient-blue text-primary-foreground font-bold rounded-xl h-9 text-xs"
            >
              Save Expiry Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Alt Editor Modal (Enables searching by image alt!) */}
      <Dialog
        open={editingAltIndex !== null}
        onOpenChange={(op) => !op && setEditingAltIndex(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Image Alt Description</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Describe what's in the image. This text is used when users search for needs using keywords!
            </DialogDescription>
          </DialogHeader>
          <Input
            value={altTextDraft}
            onChange={(e) => setAltTextDraft(e.target.value)}
            placeholder="e.g. Brand new Dell PowerEdge server motherboard"
            className="h-10 text-xs rounded-xl mt-2"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingAltIndex(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={saveAltText}
              className="gradient-blue text-primary-foreground rounded-xl text-xs font-bold"
            >
              Save Alt Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
