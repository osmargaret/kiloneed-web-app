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
  Plus, ArrowRight, TrendingUp, MousePointerClick
} from "lucide-react";

/* ─── Ad Types ─── */
const adTypes = [
  {
    type: "Image & Text",
    icon: Image,
    description: "Static image with compelling copy",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    type: "Video & Text",
    icon: Video,
    description: "Auto-playing video with text overlay",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    type: "Image Slider",
    icon: SlidersHorizontal,
    description: "Carousel of up to 5 images",
    color: "from-amber-500/20 to-orange-500/20",
  },
];

const adPlacements = [
  {
    placement: "Marketplace Featured",
    icon: ShoppingBag,
    description: "Featured on Marketplace landing page",
    price: "₦5,000/week",
  },
  {
    placement: "Need Feed Sidebar",
    icon: Star,
    description: "Featured on Need page right sidebar",
    price: "₦3,000/day",
  },
  {
    placement: "Messages Priority",
    icon: MessageSquare,
    description: "Response featured to the top of messages",
    price: "₦1,500/day",
  },
  {
    placement: "Notification Push",
    icon: Bell,
    description: "Send push notifications to target audience",
    price: "₦2,000/blast",
  },
  {
    placement: "Profile Sidebar",
    icon: User,
    description: "Profile shown on right sidebar with Visit & Follow CTAs",
    price: "₦4,000/week",
  },
];

/* ─── Sample Ads ─── */
const sampleAds = [
  {
    id: "ad1",
    title: "Samsung Galaxy S24 Sale",
    type: "Image & Text",
    placement: "Marketplace Featured",
    status: "active" as const,
    startDate: "2026-03-15",
    duration: "7 days",
    remaining: "3 days",
    views: 12450,
    follows: 89,
    notificationsSent: 2100,
    notificationsReceived: 340,
    clicks: 567,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=200&fit=crop",
  },
  {
    id: "ad2",
    title: "Plumbing Services - 20% Off",
    type: "Video & Text",
    placement: "Need Feed Sidebar",
    status: "active" as const,
    startDate: "2026-03-20",
    duration: "14 days",
    remaining: "10 days",
    views: 8200,
    follows: 45,
    notificationsSent: 1500,
    notificationsReceived: 210,
    clicks: 320,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300&h=200&fit=crop",
  },
  {
    id: "ad3",
    title: "Fashion Store Grand Opening",
    type: "Image Slider",
    placement: "Notification Push",
    status: "ended" as const,
    startDate: "2026-02-01",
    duration: "30 days",
    remaining: "0 days",
    views: 45000,
    follows: 320,
    notificationsSent: 8000,
    notificationsReceived: 1200,
    clicks: 2100,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
  },
  {
    id: "ad4",
    title: "Auto Parts Clearance",
    type: "Image & Text",
    placement: "Messages Priority",
    status: "paused" as const,
    startDate: "2026-03-10",
    duration: "7 days",
    remaining: "5 days",
    views: 3200,
    follows: 18,
    notificationsSent: 600,
    notificationsReceived: 85,
    clicks: 140,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop",
  },
];

const statusColor = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  ended: "bg-muted text-muted-foreground border-border",
};

/* ─── Ad Detail Dialog ─── */
function AdDetailDialog({ ad }: { ad: typeof sampleAds[0] }) {
  const totalDays = parseInt(ad.duration);
  const remainingDays = parseInt(ad.remaining);
  const progress = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 100;

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-base">{ad.title}</DialogTitle>
      </DialogHeader>

      <img src={ad.image} alt={ad.title} className="w-full h-40 object-cover rounded-lg" />

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Start Date</p>
          <p className="text-sm font-medium">{ad.startDate}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</p>
          <p className="text-sm font-medium">{ad.duration}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{ad.remaining} remaining</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analytics</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Views", value: ad.views.toLocaleString(), icon: Eye },
            { label: "Clicks", value: ad.clicks.toLocaleString(), icon: MousePointerClick },
            { label: "Follows", value: ad.follows.toLocaleString(), icon: UserPlus },
            { label: "Notifs Sent", value: ad.notificationsSent.toLocaleString(), icon: BellRing },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <stat.icon className="h-3.5 w-3.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  );
}

/* ─── Ads Page ─── */
const Ads = () => {
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "ended">("all");

  const filteredAds = filter === "all" ? sampleAds : sampleAds.filter((a) => a.status === filter);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger />
            <span className="font-display text-lg font-bold text-gradient-blue">KILONEED</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold font-display text-foreground">My Ads</h1>
                  <p className="text-sm text-muted-foreground">Manage all your advertisements and campaigns.</p>
                </div>
                <Button className="gradient-blue text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" /> Create Ad
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Ads", value: sampleAds.length, icon: BarChart3 },
                  { label: "Active", value: sampleAds.filter((a) => a.status === "active").length, icon: TrendingUp },
                  { label: "Total Views", value: sampleAds.reduce((s, a) => s + a.views, 0).toLocaleString(), icon: Eye },
                  { label: "Total Clicks", value: sampleAds.reduce((s, a) => s + a.clicks, 0).toLocaleString(), icon: MousePointerClick },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-bold">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Tabs defaultValue="my-ads" className="space-y-6">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="my-ads" className="text-xs">My Ads</TabsTrigger>
                  <TabsTrigger value="ad-types" className="text-xs">Ad Types</TabsTrigger>
                  <TabsTrigger value="placements" className="text-xs">Placements</TabsTrigger>
                </TabsList>

                <TabsContent value="my-ads" className="space-y-4">
                  {/* Filter bar */}
                  <div className="flex gap-2">
                    {(["all", "active", "paused", "ended"] as const).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? "default" : "outline"}
                        className={`text-xs capitalize ${filter === f ? "gradient-blue text-primary-foreground" : ""}`}
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
                          <CardContent className="flex items-center gap-4 py-4">
                            <img src={ad.image} alt={ad.title} className="h-16 w-24 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm truncate">{ad.title}</p>
                                <Badge variant="outline" className={`text-[10px] ${statusColor[ad.status]}`}>
                                  {ad.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{ad.type} • {ad.placement}</p>
                              <div className="flex gap-4 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> {ad.views.toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MousePointerClick className="h-3 w-3" /> {ad.clicks.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <AdDetailDialog ad={ad} />
                    </Dialog>
                  ))}
                </TabsContent>

                <TabsContent value="ad-types" className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose how your ad will be displayed.</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {adTypes.map((t) => (
                      <Card key={t.type} className="overflow-hidden hover:shadow-lg transition-all">
                        <div className={`h-1.5 w-full bg-gradient-to-r ${t.color}`} />
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <t.icon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-sm">{t.type}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-3">{t.description}</p>
                          <Button size="sm" variant="outline" className="w-full text-xs">Select</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="placements" className="space-y-4">
                  <p className="text-sm text-muted-foreground">Pick where your ad appears on Kiloneed.</p>
                  <div className="space-y-3">
                    {adPlacements.map((p) => (
                      <Card key={p.placement} className="hover:shadow-md transition-all">
                        <CardContent className="flex items-center justify-between py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <p.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{p.placement}</p>
                              <p className="text-xs text-muted-foreground">{p.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-xs">{p.price}</Badge>
                            <Button size="sm" variant="outline" className="text-xs">Choose</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
