import { useState, useEffect } from "react";
import { adsApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
import { CreateAdModal } from "@/components/CreateAdModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from "@/components/ui/dialog";
import {
  Image, Video, SlidersHorizontal, ShoppingBag, Star, MessageSquare,
  Bell, User, Eye, UserPlus, BellRing, Calendar, Clock, BarChart3,
  Plus, ArrowRight, TrendingUp, MousePointerClick, Check, Pause, Play,
  Sparkles, X
} from "lucide-react";
import { toast } from "sonner";

export interface AdItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  placement: string;
  status: "active" | "paused" | "ended";
  startDate: string;
  duration: string;
  remaining: string;
  views: number;
  clicks: number;
  ctr: string;
  budget: number;
  spent: number;
  image: string;
  targetUrl?: string;
}

const adTypes = [
  { type: "Image & Text", icon: Image, description: "Static image with compelling copy", color: "from-blue-500/20 to-cyan-500/20" },
  { type: "Video & Text", icon: Video, description: "Auto-playing video with text overlay", color: "from-purple-500/20 to-pink-500/20" },
  { type: "Image Slider", icon: SlidersHorizontal, description: "Carousel of up to 5 images", color: "from-amber-500/20 to-orange-500/20" },
];

const adPlacements = [
  { placement: "Marketplace Featured", icon: ShoppingBag, description: "Featured on Marketplace", price: "₦5,000/wk" },
  { placement: "Need Feed Sidebar", icon: Star, description: "Need page right sidebar", price: "₦3,000/day" },
  { placement: "Messages Priority", icon: MessageSquare, description: "Top of messages", price: "₦1,500/day" },
  { placement: "Notification Push", icon: Bell, description: "Push to target audience", price: "₦2,000/blast" },
  { placement: "Profile Sidebar", icon: User, description: "Profile sidebar with CTAs", price: "₦4,000/wk" },
];

const statusColor = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  ended: "bg-muted text-muted-foreground border-border",
};

function AdDetailDialog({
  ad,
  onTogglePause,
  onDelete,
}: {
  ad: AdItem;
  onTogglePause: (id: string, newStatus: "active" | "paused") => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}) {
  const [currentStatus, setCurrentStatus] = useState<"active" | "paused" | "ended">(ad.status);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentStatus(ad.status);
  }, [ad.status]);

  const handleToggle = async () => {
    if (isToggling || currentStatus === "ended") return;
    const targetStatus = currentStatus === "paused" ? "active" : "paused";
    setIsToggling(true);
    try {
      await onTogglePause(ad.id, targetStatus);
      setCurrentStatus(targetStatus);
    } catch {
      setCurrentStatus(ad.status);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this ad campaign?")) return;
    setIsDeleting(true);
    try {
      await onDelete(ad.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalDays = parseInt(ad.duration) || 14;
  const remainingDays = parseInt(ad.remaining) || 0;
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, ((totalDays - remainingDays) / totalDays) * 100)) : 100;

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-border bg-card p-4 sm:p-5">
      <DialogHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-sm sm:text-base font-bold text-foreground leading-snug">
              {ad.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {ad.type} • {ad.placement}
            </DialogDescription>
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 font-medium ${statusColor[currentStatus]}`}>
            {currentStatus}
          </Badge>
        </div>
      </DialogHeader>

      <div className="rounded-xl overflow-hidden border border-border/80 bg-muted/40 my-1">
        <img src={ad.image} alt={ad.title} className="w-full h-36 sm:h-44 object-cover" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3 text-primary" /> Start Date
          </p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{ad.startDate}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" /> Duration
          </p>
          <p className="text-xs font-semibold text-foreground mt-0.5">{ad.duration}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Campaign Progress</span>
          <span className="font-medium text-foreground">{ad.remaining} left</span>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full" />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Real-Time Analytics
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Views (Impressions)", value: ad.views.toLocaleString(), icon: Eye },
            { label: "Clicks", value: ad.clicks.toLocaleString(), icon: MousePointerClick },
            { label: "Click-Through Rate", value: ad.ctr, icon: TrendingUp },
            { label: "Budget Allocated", value: `₦${(ad.budget || 0).toLocaleString()}`, icon: ShoppingBag },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 border border-border/60">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                <p className="text-xs sm:text-sm font-bold text-foreground leading-tight truncate">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2">
        {currentStatus !== "ended" && (
          <Button
            variant="outline"
            className={`w-full gap-2 rounded-xl text-xs font-semibold py-2.5 h-auto transition-all ${
              currentStatus === "paused"
                ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                : "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
            }`}
            disabled={isToggling}
            onClick={handleToggle}
          >
            {currentStatus === "paused" ? (
              <>
                <Play className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                <span>{isToggling ? "Resuming in real time..." : "Resume Ad"}</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{isToggling ? "Pausing in real time..." : "Pause Ad"}</span>
              </>
            )}
          </Button>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 rounded-lg"
          >
            {isDeleting ? "Deleting..." : "Delete Campaign"}
          </Button>
        )}
      </div>
    </DialogContent>
  );
}

const Ads = () => {
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">("all");
  const [ads, setAds] = useState<AdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);

  const loadAds = () => {
    setIsLoading(true);
    adsApiService
      .getMyAds()
      .then((remoteAds) => {
        if (Array.isArray(remoteAds)) {
          processAndSetAds(remoteAds);
        } else {
          setAds([]);
        }
      })
      .catch(() => {
        setAds([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const processAndSetAds = (list: any[]) => {
    const mapped: AdItem[] = list.map((ra: any) => {
      const createdDate = ra.created_at ? new Date(ra.created_at) : new Date();
      const formattedStart = createdDate.toISOString().slice(0, 10);
      const totalDays = 14;
      const elapsedDays = Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 3600 * 24)));
      const remainingDays = Math.max(0, totalDays - elapsedDays);
      const views = Number(ra.impressions || 0);
      const clicks = Number(ra.clicks || 0);
      const budget = Number(ra.budget || 0);
      const spent = Number(ra.spent || 0);
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) + "%" : "0.0%";

      return {
        id: String(ra.id),
        title: ra.title,
        description: ra.description || "",
        type: ra.ad_type || "Image & Text",
        placement: ra.placement || "Marketplace Featured",
        status: (ra.status === "completed" ? "ended" : ra.status || "active") as
          | "active"
          | "paused"
          | "ended",
        startDate: formattedStart,
        duration: `${totalDays} days`,
        remaining: `${remainingDays} days`,
        views,
        clicks,
        ctr,
        budget,
        spent,
        image:
          ra.media_url ||
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&fit=crop",
        targetUrl: ra.target_url,
      };
    });
    setAds(mapped);
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleQuickCreateAd = async () => {
    const newTitle = `Promoted ${selectedPlacement || "Marketplace"} Campaign`;
    const image = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&fit=crop";

    try {
      const res = await adsApiService.createAd({
        title: newTitle,
        description: `${selectedAdType || "Image & Text"} campaign running on ${selectedPlacement || "Marketplace Featured"}`,
        ad_type: selectedAdType || "Image & Text",
        placement: selectedPlacement || "Marketplace Featured",
        budget: 25000,
        media_url: image,
      });

      const serverAd = res?.ad;
      const newAdObj: AdItem = {
        id: serverAd?.id ? String(serverAd.id) : "ad_" + Date.now(),
        title: serverAd?.title || newTitle,
        description: serverAd?.description || "",
        type: serverAd?.ad_type || selectedAdType || "Image & Text",
        placement: serverAd?.placement || selectedPlacement || "Marketplace Featured",
        status: "active",
        startDate: new Date().toISOString().slice(0, 10),
        duration: "14 days",
        remaining: "14 days",
        views: 0,
        clicks: 0,
        ctr: "0.0%",
        budget: Number(serverAd?.budget || 25000),
        spent: 0,
        image: serverAd?.media_url || image,
      };

      setAds((prev) => [newAdObj, ...prev]);
      toast.success("Ad campaign launched & synced live with backend!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create ad campaign");
    }
  };

  const filteredAds = filter === "all" ? ads : ads.filter((a) => a.status === filter);

  const togglePause = async (id: string, newStatus: "active" | "paused") => {
    // 1. Optimistic UI update
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    try {
      await adsApiService.updateAdStatus(id, newStatus);
      toast.success(`Ad campaign ${newStatus === "paused" ? "paused" : "resumed"} in real time!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update ad status on server");
      // Revert if server rejected
      setAds((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus === "paused" ? "active" : "paused" } : a))
      );
      throw err;
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await adsApiService.deleteAd(id);
      setAds((prev) => prev.filter((a) => a.id !== id));
      toast.success("Ad campaign deleted successfully in real time!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete ad campaign on server");
      throw err;
    }
  };

  return (
    <MobileLayout title="My Ads">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">My Ads</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your advertisements and live campaigns.</p>
          </div>
          <Button
            className="gradient-blue text-primary-foreground w-full sm:w-auto text-xs sm:text-sm font-semibold rounded-xl shadow-glow"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Create Ad Campaign
          </Button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { label: "Total Ads", value: ads.length, icon: BarChart3 },
            { label: "Active", value: ads.filter((a) => a.status === "active").length, icon: TrendingUp },
            { label: "Views", value: ads.reduce((s, a) => s + a.views, 0).toLocaleString(), icon: Eye },
            { label: "Clicks", value: ads.reduce((s, a) => s + a.clicks, 0).toLocaleString(), icon: MousePointerClick },
          ].map((s) => (
            <Card key={s.label} className="bg-card/80 border-border/70">
              <CardContent className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground truncate">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="campaigns" className="text-xs rounded-lg">My Campaigns ({ads.length})</TabsTrigger>
            <TabsTrigger value="ad-types" className="text-xs rounded-lg">Ad Formats</TabsTrigger>
            <TabsTrigger value="placements" className="text-xs rounded-lg">Placements</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(["all", "active", "paused", "ended"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  className={`text-[10px] sm:text-xs capitalize h-7 px-2.5 sm:px-3 rounded-lg shrink-0 ${
                    filter === f ? "gradient-blue text-primary-foreground font-semibold" : "border-border/80"
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Loading ad campaigns in real time...
              </div>
            ) : filteredAds.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-card border border-dashed border-border/80">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                <h4 className="text-sm font-semibold text-foreground">No ad campaigns found</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {filter !== "all"
                    ? `No campaigns with status "${filter}".`
                    : "You don't have any active advertisements running. Create a sponsored campaign to boost your reach across the marketplace."}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gradient-blue text-primary-foreground text-xs font-semibold rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Launch Campaign
                  </Button>
                </div>
              </div>
            ) : (
              filteredAds.map((ad) => (
                <Dialog key={ad.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group bg-card/80 border-border/70">
                      <CardContent className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 px-3">
                        <img src={ad.image} alt={ad.title} className="h-14 w-20 sm:h-16 sm:w-24 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 flex-wrap">
                            <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{ad.title}</p>
                            <Badge variant="outline" className={`text-[9px] sm:text-[10px] ${statusColor[ad.status]}`}>
                              {ad.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{ad.type} • {ad.placement}</p>
                          <div className="flex gap-3 mt-1 text-muted-foreground">
                            <span className="text-[10px] sm:text-xs flex items-center gap-1">
                              <Eye className="h-3 w-3 text-primary" /> {ad.views.toLocaleString()}
                            </span>
                            <span className="text-[10px] sm:text-xs flex items-center gap-1">
                              <MousePointerClick className="h-3 w-3 text-blue-400" /> {ad.clicks.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <AdDetailDialog ad={ad} onTogglePause={togglePause} onDelete={handleDeleteAd} />
                </Dialog>
              ))
            )}
          </TabsContent>

          <TabsContent value="ad-types" className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Choose how your ad will be formatted across Kiloneed.</p>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              {adTypes.map((t) => {
                const isSelected = selectedAdType === t.type;
                return (
                  <Card key={t.type} className={`overflow-hidden hover:shadow-md transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${t.color}`} />
                    <CardHeader className="pb-2 px-3 sm:px-6">
                      <div className="flex items-center gap-2">
                        <t.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <CardTitle className="text-xs sm:text-sm">{t.type}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-3">{t.description}</p>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full text-xs rounded-xl ${isSelected ? "gradient-blue text-primary-foreground font-semibold" : ""}`}
                        onClick={() => {
                          setSelectedAdType(isSelected ? null : t.type);
                          toast.success(isSelected ? "Ad type deselected" : `Selected: ${t.type}`);
                        }}
                      >
                        {isSelected ? <><Check className="h-3 w-3 mr-1" /> Selected</> : "Select Format"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="placements" className="space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Pick high-traffic zones where your ad campaign appears.</p>
            <div className="space-y-2 sm:space-y-3">
              {adPlacements.map((p) => {
                const isChosen = selectedPlacement === p.placement;
                return (
                  <Card key={p.placement} className={`hover:shadow-sm transition-all ${isChosen ? "ring-2 ring-primary" : ""}`}>
                    <CardContent className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-6 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <p.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{p.placement}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{p.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">{p.price}</Badge>
                        <Button
                          size="sm"
                          variant={isChosen ? "default" : "outline"}
                          className={`text-xs h-7 rounded-lg ${isChosen ? "gradient-blue text-primary-foreground font-semibold" : ""}`}
                          onClick={() => {
                            setSelectedPlacement(isChosen ? null : p.placement);
                            toast.success(isChosen ? "Placement deselected" : `Chosen: ${p.placement} — ${p.price}`);
                          }}
                        >
                          {isChosen ? <><Check className="h-3 w-3 mr-1" /> Chosen</> : "Choose"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Ad Details Modal */}
      <CreateAdModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onAdCreated={(newAd) => setAds((prev) => [newAd, ...prev])}
      />
    </MobileLayout>
  );
};

export default Ads;
