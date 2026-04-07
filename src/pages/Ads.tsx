import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Image, Video, SlidersHorizontal, ShoppingBag, Star, MessageSquare,
  Bell, User, Eye, UserPlus, BellRing, Calendar, Clock, BarChart3,
  Plus, ArrowRight, TrendingUp, MousePointerClick, Check, Pause, Play
} from "lucide-react";
import { toast } from "sonner";

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

const sampleAds = [
  { id: "ad1", title: "Samsung Galaxy S24 Sale", type: "Image & Text", placement: "Marketplace Featured", status: "active" as const, startDate: "2026-03-15", duration: "7 days", remaining: "3 days", views: 12450, follows: 89, notificationsSent: 2100, notificationsReceived: 340, clicks: 567, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=200&fit=crop" },
  { id: "ad2", title: "Plumbing Services - 20% Off", type: "Video & Text", placement: "Need Feed Sidebar", status: "active" as const, startDate: "2026-03-20", duration: "14 days", remaining: "10 days", views: 8200, follows: 45, notificationsSent: 1500, notificationsReceived: 210, clicks: 320, image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300&h=200&fit=crop" },
  { id: "ad3", title: "Fashion Store Grand Opening", type: "Image Slider", placement: "Notification Push", status: "ended" as const, startDate: "2026-02-01", duration: "30 days", remaining: "0 days", views: 45000, follows: 320, notificationsSent: 8000, notificationsReceived: 1200, clicks: 2100, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop" },
  { id: "ad4", title: "Auto Parts Clearance", type: "Image & Text", placement: "Messages Priority", status: "paused" as const, startDate: "2026-03-10", duration: "7 days", remaining: "5 days", views: 3200, follows: 18, notificationsSent: 600, notificationsReceived: 85, clicks: 140, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop" },
];

const statusColor = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  ended: "bg-muted text-muted-foreground border-border",
};

function AdDetailDialog({ ad, onTogglePause }: { ad: typeof sampleAds[0]; onTogglePause: (id: string) => void }) {
  const totalDays = parseInt(ad.duration);
  const remainingDays = parseInt(ad.remaining);
  const progress = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 100;

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-base">{ad.title}</DialogTitle>
      </DialogHeader>
      <img src={ad.image} alt={ad.title} className="w-full h-32 sm:h-40 object-cover rounded-lg" />
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Start</p>
          <p className="text-xs sm:text-sm font-medium">{ad.startDate}</p>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</p>
          <p className="text-xs sm:text-sm font-medium">{ad.duration}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{ad.remaining} left</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Analytics</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Views", value: ad.views.toLocaleString(), icon: Eye },
            { label: "Clicks", value: ad.clicks.toLocaleString(), icon: MousePointerClick },
            { label: "Follows", value: ad.follows.toLocaleString(), icon: UserPlus },
            { label: "Notifs", value: ad.notificationsSent.toLocaleString(), icon: BellRing },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <stat.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xs sm:text-sm font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {ad.status !== "ended" && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => onTogglePause(ad.id)}
        >
          {ad.status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          {ad.status === "paused" ? "Resume Ad" : "Pause Ad"}
        </Button>
      )}
    </DialogContent>
  );
}

const Ads = () => {
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">("all");
  const [ads, setAds] = useState(sampleAds);
  const [selectedAdType, setSelectedAdType] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);

  const filteredAds = filter === "all" ? ads : ads.filter((a) => a.status === filter);

  const togglePause = (id: string) => {
    setAds(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newStatus = a.status === "paused" ? "active" as const : "paused" as const;
      toast.success(`Ad ${newStatus === "paused" ? "paused" : "resumed"}: ${a.title}`);
      return { ...a, status: newStatus };
    }));
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center gap-2 sm:gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-3 sm:px-4">
            <SidebarTrigger />
            <span className="font-display text-base sm:text-lg font-bold text-gradient-blue">KILONEED</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">My Ads</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage your advertisements.</p>
                </div>
                <Button className="gradient-blue text-primary-foreground w-full sm:w-auto text-xs sm:text-sm" onClick={() => toast.success("Create Ad wizard coming soon!")}>
                  <Plus className="h-4 w-4 mr-1" /> Create Ad
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  { label: "Total Ads", value: ads.length, icon: BarChart3 },
                  { label: "Active", value: ads.filter((a) => a.status === "active").length, icon: TrendingUp },
                  { label: "Views", value: ads.reduce((s, a) => s + a.views, 0).toLocaleString(), icon: Eye },
                  { label: "Clicks", value: ads.reduce((s, a) => s + a.clicks, 0).toLocaleString(), icon: MousePointerClick },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 px-3">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-sm sm:text-lg font-bold truncate">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Tabs defaultValue="my-ads" className="space-y-4 sm:space-y-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="my-ads" className="text-xs">My Ads</TabsTrigger>
                  <TabsTrigger value="ad-types" className="text-xs">Types</TabsTrigger>
                  <TabsTrigger value="placements" className="text-xs">Placements</TabsTrigger>
                </TabsList>

                <TabsContent value="my-ads" className="space-y-3 sm:space-y-4">
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                    {(["all", "active", "paused", "ended"] as const).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? "default" : "outline"}
                        className={`text-[10px] sm:text-xs capitalize h-7 px-2 sm:px-3 shrink-0 ${filter === f ? "gradient-blue text-primary-foreground" : ""}`}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>

                  {filteredAds.map((ad) => (
                    <Dialog key={ad.id}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:shadow-lg transition-all group">
                          <CardContent className="flex items-center gap-2 sm:gap-4 py-3 sm:py-4 px-3">
                            <img src={ad.image} alt={ad.title} className="h-12 w-16 sm:h-16 sm:w-24 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 flex-wrap">
                                <p className="font-medium text-xs sm:text-sm truncate">{ad.title}</p>
                                <Badge variant="outline" className={`text-[9px] sm:text-[10px] ${statusColor[ad.status]}`}>
                                  {ad.status}
                                </Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{ad.type} • {ad.placement}</p>
                              <div className="flex gap-3 mt-0.5 sm:mt-1">
                                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> {ad.views.toLocaleString()}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                  <MousePointerClick className="h-3 w-3" /> {ad.clicks.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <AdDetailDialog ad={ad} onTogglePause={togglePause} />
                    </Dialog>
                  ))}
                </TabsContent>

                <TabsContent value="ad-types" className="space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Choose how your ad will be displayed.</p>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                    {adTypes.map((t) => {
                      const isSelected = selectedAdType === t.type;
                      return (
                        <Card key={t.type} className={`overflow-hidden hover:shadow-lg transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}>
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
                              className={`w-full text-xs ${isSelected ? "gradient-blue text-primary-foreground" : ""}`}
                              onClick={() => {
                                setSelectedAdType(isSelected ? null : t.type);
                                toast.success(isSelected ? "Ad type deselected" : `Selected: ${t.type}`);
                              }}
                            >
                              {isSelected ? <><Check className="h-3 w-3 mr-1" /> Selected</> : "Select"}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="placements" className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">Pick where your ad appears.</p>
                  <div className="space-y-2 sm:space-y-3">
                    {adPlacements.map((p) => {
                      const isChosen = selectedPlacement === p.placement;
                      return (
                        <Card key={p.placement} className={`hover:shadow-md transition-all ${isChosen ? "ring-2 ring-primary" : ""}`}>
                          <CardContent className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-6 gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <p.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">{p.placement}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{p.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">{p.price}</Badge>
                              <Button
                                size="sm"
                                variant={isChosen ? "default" : "outline"}
                                className={`text-xs h-7 ${isChosen ? "gradient-blue text-primary-foreground" : ""}`}
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Ads;
