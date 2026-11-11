import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { needsStore } from "@/services/needsStore";
import { productsApiService, connectionsApiService, groupsApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Users, UsersRound, Settings as SettingsIcon, Megaphone, Receipt,
  UserPlus, ThumbsUp, AtSign, Crown, MapPin, Edit,
  ExternalLink, Star, Camera, Share2, Copy, CheckCircle2, MessageCircle,
  Plus, Sparkles, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";

// User profile data fetched fresh from localStorage
const getInitialUserData = () => ({
  name: localStorage.getItem("kiloneed_user_name") || "Your Store",
  initials: (localStorage.getItem("kiloneed_user_name") || "YS").slice(0, 2).toUpperCase(),
  headline: localStorage.getItem("kiloneed_headline") || "Electronics & Tech Merchant",
  location: localStorage.getItem("kiloneed_location") || "Lagos, Nigeria",
  category: "Electronics",
  subscription: "Free",
  subscriptionExpiry: "Active",
  recommendations: 0,
  mentions: 0,
  connectionsCount: 0,
  profileLink: "kiloneed.com/profile",
});

const subscriptionTiers = [
  { name: "Free", price: "₦0/mo", features: ["1 Profile", "Basic needs posting", "5 groups"] },
  { name: "Premium", price: "₦5,000/mo", features: ["3 Profiles", "Priority visibility", "50 groups", "Ad discounts"] },
  { name: "Business", price: "₦15,000/mo", features: ["10 Profiles", "Featured placement", "Unlimited groups", "Analytics"] },
];

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);

  // User profile state
  const [user, setUser] = useState(getInitialUserData);
  const [activeTab, setActiveTab] = useState("needs");
  const tabKeys = ["needs", "commodities", "connections", "groups", "plans"];

  // Real user data collections
  const [userNeeds, setUserNeeds] = useState<any[]>([]);
  const [userCommodities, setUserCommodities] = useState<any[]>([]);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);

  const [avatarImage, setAvatarImage] = useState<string>(() => {
    return localStorage.getItem("kiloneed_avatar") || "";
  });
  const [coverImage, setCoverImage] = useState<string>(() => {
    return localStorage.getItem("kiloneed_cover_image") || "";
  });

  // Sync state whenever page becomes visible or focused (e.g. returning from Settings)
  useEffect(() => {
    const syncUserData = () => {
      setUser(getInitialUserData());
      setAvatarImage(localStorage.getItem("kiloneed_avatar") || "");
      setCoverImage(localStorage.getItem("kiloneed_cover_image") || "");
      authService.getMe()
        .then((res) => { const remoteUser = res?.user;
          if (remoteUser?.name) {
            setUser((prev) => ({
              ...prev,
              name: remoteUser.name,
              location: remoteUser.location || prev.location,
              category: remoteUser.industry || prev.category,
            }));
          }
        })
        .catch(() => {});
    };
    syncUserData();
    window.addEventListener("focus", syncUserData);
    window.addEventListener("storage", syncUserData);
    return () => {
      window.removeEventListener("focus", syncUserData);
      window.removeEventListener("storage", syncUserData);
    };
  }, []);

  // Fetch real user needs, commodities, connections, and groups
  useEffect(() => {
    const rawNeeds = needsStore.getRawNeeds();
    const myNeeds = rawNeeds.filter((n) => n.author === user.name || n.distanceKm === 0);
    setUserNeeds(myNeeds);

    productsApiService.getProducts()
      .then((res: any) => {
        if (Array.isArray(res)) setUserCommodities(res);
      })
      .catch(() => {});

    connectionsApiService.getConnections()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setUserConnections(res);
          setUser((prev) => ({ ...prev, connectionsCount: res.length }));
        }
      })
      .catch(() => {});

    groupsApiService.getMyGroups()
      .then((res: any) => {
        if (Array.isArray(res)) setUserGroups(res);
      })
      .catch(() => {});
  }, [user.name]);

  const tabItems = [
    { id: "needs", label: `Needs (${userNeeds.length})`, icon: null },
    { id: "commodities", label: `Items (${userCommodities.length})`, icon: ShoppingBag },
    { id: "connections", label: `Connections (${userConnections.length})`, icon: Users },
    { id: "groups", label: `Groups (${userGroups.length})`, icon: UsersRound },
    { id: "plans", label: `Plans`, icon: Crown },
  ];

  // Smoothly scroll active tab pill into view when tab changes
  useEffect(() => {
    const el = document.getElementById(`profile-tab-${activeTab}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

  // Swipe gesture handler
  const handleSwipe = (direction: "left" | "right") => {
    const currentIndex = tabKeys.indexOf(activeTab);
    if (direction === "left" && currentIndex < tabKeys.length - 1) {
      setActiveTab(tabKeys[currentIndex + 1]);
    } else if (direction === "right" && currentIndex > 0) {
      setActiveTab(tabKeys[currentIndex - 1]);
    }
  };

  // Drag-to-scroll support for the horizontal tabs menu
  const isDraggingTabs = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!tabsListRef.current) return;
    isDraggingTabs.current = true;
    startX.current = e.pageX - tabsListRef.current.offsetLeft;
    scrollLeft.current = tabsListRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTabs.current || !tabsListRef.current) return;
    const x = e.pageX - tabsListRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    tabsListRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = () => {
    isDraggingTabs.current = false;
  };

  // Helper to compress and resize images so they never exceed browser localStorage limits
  const compressImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.82
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Handle avatar upload from file picker
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setAvatarImage(compressed);
      try {
        localStorage.setItem("kiloneed_avatar", compressed);
      } catch (err) {
        console.warn("Could not save avatar to localStorage:", err);
      }
      authService.updateProfile({ avatar: compressed }).catch(() => {});
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Error processing profile picture");
    } finally {
      e.target.value = "";
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    try {
      toast.loading("Processing cover image...", { id: "cover-upload" });
      const compressed = await compressImage(file, 1200, 600, 0.82);
      setCoverImage(compressed);
      try {
        localStorage.setItem("kiloneed_cover_image", compressed);
      } catch (err) {
        console.warn("Could not save cover to localStorage:", err);
      }
      toast.success("Cover image updated!", { id: "cover-upload" });
    } catch {
      toast.error("Failed to upload cover image", { id: "cover-upload" });
    } finally {
      e.target.value = "";
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`https://${user.profileLink}`);
    toast.success("Profile link copied to clipboard!");
  };

  return (
    <MobileLayout title="My Profile">
      <div className="max-w-2xl sm:max-w-3xl mx-auto w-full pb-8">
        {/* Hidden file input for avatar picker */}
        <input
          id="avatar-file-input"
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Hidden file input for cover photo picker */}
        <input
          id="cover-file-input"
          type="file"
          ref={coverFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />

        {/* ── Profile Header with Cover Image ── */}
        <div className="relative">
          {/* Cover image or gradient banner */}
          <label
            htmlFor="cover-file-input"
            className="block h-32 sm:h-36 w-full relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-blue-900/50 to-teal-900/40 cursor-pointer group"
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt="Profile Cover"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            )}

            {/* Gradient shadow for text & button contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

            {/* Cover photo action button without redundant X */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              <label
                htmlFor="cover-file-input"
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md border border-white/20 transition-transform active:scale-95"
                title="Upload cover image"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{coverImage ? "Edit Cover" : "Add Cover"}</span>
              </label>
            </div>
          </label>

          {/* Profile Details Container */}
          <div className="px-4 -mt-12">
            <div className="flex items-end justify-between">
              {/* Clickable Avatar with Camera Badge */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-20 w-20 rounded-2xl border-3 border-background shadow-xl ring-2 ring-primary/40 bg-card">
                  {avatarImage ? (
                    <AvatarImage src={avatarImage} alt={user.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-xl font-bold rounded-2xl">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {/* Camera icon button */}
                <div
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-2 ring-background transition-transform active:scale-90"
                  title="Upload profile picture"
                >
                  <Camera className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Subscription Pill */}
              <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs px-2.5 py-1 flex items-center gap-1 shadow-sm mb-1">
                <Crown className="h-3 w-3" />
                {user.subscription}
              </Badge>
            </div>

            {/* Name & Headline */}
            <div className="mt-2.5 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold font-display text-foreground tracking-tight">{user.name}</h2>
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20 shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">{user.headline}</p>
            </div>

            {/* Meta Row: Location & Profile link */}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                {user.location}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-primary/90 hover:underline transition-colors"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span>{user.profileLink}</span>
              </button>
            </div>

            {/* Clean Action Buttons: Edit Profile takes users directly to Settings */}
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => navigate("/settings", { state: { editProfile: true } })}
                className="flex-1 h-8 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border/70 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                title="Edit profile in settings"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="h-8 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border/70 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                title="Share profile link"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Share</span>
              </button>
            </div>

            {/* ── Compact Segmented Stats Card ── */}
            <div className="grid grid-cols-3 gap-2 mt-2.5 p-2.5 bg-card/70 border border-border/60 rounded-xl backdrop-blur-sm">
              <div className="text-center py-0.5">
                <p className="text-base font-bold text-foreground leading-none">{user.recommendations}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <ThumbsUp className="h-2.5 w-2.5 text-primary" /> Recos
                </p>
              </div>
              <div className="text-center py-0.5 border-x border-border/60">
                <p className="text-base font-bold text-foreground leading-none">{user.mentions}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <AtSign className="h-2.5 w-2.5 text-blue-400" /> Mentions
                </p>
              </div>
              <div className="text-center py-0.5">
                <p className="text-base font-bold text-foreground leading-none">{user.connectionsCount}</p>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Users className="h-2.5 w-2.5 text-teal-400" /> Network
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sleek Horizontal Scrollable & Swipeable Tabs ── */}
        <div className="px-4 mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            
            {/* Horizontal pill navigation with full labels, touch-scroll & swipe support */}
            <div className="relative -mx-4 px-4">
              <div
                ref={tabsListRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="overflow-x-auto touch-pan-x no-scrollbar flex items-center gap-1.5 pb-1 select-none cursor-grab active:cursor-grabbing scroll-smooth"
              >
                <TabsList className="inline-flex h-7 items-center gap-1 bg-transparent p-0 shrink-0">
                  {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        id={`profile-tab-${tab.id}`}
                        value={tab.id}
                        className="rounded-full text-[11px] px-2.5 py-1 h-7 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted/60 text-muted-foreground border border-border/40 gap-1 transition-all shrink-0 cursor-pointer"
                      >
                        {Icon && <Icon className="h-3 w-3 shrink-0" />}
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </div>

            {/* Swipeable Tab Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.16 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={(_e, { offset, velocity }) => {
                const threshold = 40;
                if (offset.x < -threshold || velocity.x < -300) {
                  handleSwipe("left");
                } else if (offset.x > threshold || velocity.x > 300) {
                  handleSwipe("right");
                }
              }}
              className="touch-pan-y"
            >
              {/* ─ Needs Tab ─ */}
              <TabsContent value="needs" className="space-y-2.5 mt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Requests</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-full gap-1 border-primary/40 text-primary"
                    onClick={() => navigate("/feed")}
                  >
                    <Plus className="h-3 w-3" /> Post Need
                  </Button>
                </div>
                {userNeeds.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
                    <p className="text-xs text-muted-foreground">You haven't posted any needs yet.</p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/feed")}
                      className="mt-2.5 text-xs rounded-lg gradient-blue text-primary-foreground"
                    >
                      Post your first need
                    </Button>
                  </div>
                ) : (
                  userNeeds.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className="hover:border-primary/40 transition-colors bg-card/80 border-border/70">
                        <CardContent className="p-3">
                          <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed">{n.text}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                            <span>{n.postedAt || "Recently"}</span>
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <ThumbsUp className="h-3 w-3 text-primary" /> {n.saves || 0}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* ─ Commodities / Items Tab ─ */}
              <TabsContent value="commodities" className="space-y-2.5 mt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Inventory</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs rounded-full gap-1 border-primary/40 text-primary"
                    onClick={() => navigate("/marketplace?action=sell", { state: { openSell: true } })}
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
                {userCommodities.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
                    <p className="text-xs text-muted-foreground">No marketplace items listed yet.</p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/marketplace?action=sell", { state: { openSell: true } })}
                      className="mt-2.5 text-xs rounded-lg gradient-blue text-primary-foreground"
                    >
                      List an item for sale
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
                    {userCommodities.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Card className="hover:border-primary/40 transition-colors bg-card/80 border-border/70">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                              {c.image ? <img src={c.image} alt={c.title} className="h-full w-full object-cover" /> : "📦"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-xs line-clamp-1">{c.title || c.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-bold text-primary">₦{Number(c.price || 0).toLocaleString()}</span>
                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{c.condition || "Available"}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ─ Connections Tab ─ */}
              <TabsContent value="connections" className="space-y-2 mt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mutual Contacts</span>
                  <button
                    onClick={() => navigate("/connections")}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                {userConnections.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
                    <p className="text-xs text-muted-foreground">No peer connections yet.</p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/connections")}
                      className="mt-2.5 text-xs rounded-lg gradient-blue text-primary-foreground"
                    >
                      Find connections
                    </Button>
                  </div>
                ) : (
                  userConnections.map((c) => (
                    <Card key={c.id} className="bg-card/80 border-border/70 hover:border-primary/30 transition-colors">
                      <CardContent className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-9 w-9 rounded-full">
                            <AvatarImage src={c.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                              {c.name?.slice(0, 2).toUpperCase() || "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-xs">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.company || c.industry || "Merchant"}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 rounded-full"
                          onClick={() => navigate("/messages")}
                          title="Message"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* ─ Groups Tab ─ */}
              <TabsContent value="groups" className="space-y-2 mt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined Communities</span>
                  <button
                    onClick={() => navigate("/groups")}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Explore
                  </button>
                </div>
                {userGroups.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
                    <p className="text-xs text-muted-foreground">You haven't joined any trade groups yet.</p>
                    <Button
                      size="sm"
                      onClick={() => navigate("/groups")}
                      className="mt-2.5 text-xs rounded-lg gradient-blue text-primary-foreground"
                    >
                      Explore trade groups
                    </Button>
                  </div>
                ) : (
                  userGroups.map((g) => (
                    <Card key={g.id} className="bg-card/80 border-border/70 hover:border-primary/30 transition-colors">
                      <CardContent className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                            <UsersRound className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs truncate">{g.name}</p>
                            <p className="text-[10px] text-muted-foreground">{g.category || "General"} · {g.members_count || 1} members</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">Member</Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* ─ Plans / Subscription Tab ─ */}
              <TabsContent value="plans" className="space-y-3 mt-0">
                <div className="p-3 bg-gradient-to-br from-primary/15 to-blue-500/10 border border-primary/25 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="font-bold text-xs text-foreground">Current: {user.subscription} Plan</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Expires {user.subscriptionExpiry}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">Enjoy priority matching, 3 active business profiles, and verified merchant perks.</p>
                </div>

                <div className="grid gap-2">
                  {subscriptionTiers.map((tier) => (
                    <Card key={tier.name} className={`bg-card/80 border ${tier.name === user.subscription ? "border-primary ring-1 ring-primary/30" : "border-border/70"}`}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-foreground">{tier.name}</p>
                            {tier.name === user.subscription && (
                              <Badge className="text-[9px] h-4 px-1.5 bg-primary text-primary-foreground">Active</Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-primary font-semibold">{tier.price}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={tier.name === user.subscription ? "outline" : "default"}
                          className="h-6.5 text-[11px] px-2.5 rounded-lg"
                          onClick={() => navigate("/subscription")}
                        >
                          {tier.name === user.subscription ? "Current" : "Upgrade"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
}