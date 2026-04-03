import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import {
  ArrowLeft, UserPlus, Bell, ThumbsUp, AtSign, AlertTriangle,
  ShoppingBag, Home, Users, Star, UsersRound, MapPin, ChevronDown,
} from "lucide-react";

// ─── Mock profile data ───
const mockProfiles: Record<string, {
  name: string; avatar: string; location: string; category: string;
  recommendations: number; mentions: number; abuseReports: number;
  privacy: { needs: boolean; commodities: boolean; connections: boolean; groups: boolean };
  advertiseFollow: boolean;
}> = {
  "1": { name: "Adaeze Okafor", avatar: "AO", location: "Lagos", category: "Electronics", recommendations: 42, mentions: 18, abuseReports: 0, privacy: { needs: true, commodities: true, connections: true, groups: false }, advertiseFollow: true },
  "6": { name: "Emeka Nwosu", avatar: "EN", location: "Lagos", category: "Electronics", recommendations: 67, mentions: 25, abuseReports: 1, privacy: { needs: true, commodities: true, connections: false, groups: true }, advertiseFollow: true },
};

const fallbackProfile = {
  name: "Unknown User", avatar: "??", location: "—", category: "—",
  recommendations: 0, mentions: 0, abuseReports: 0,
  privacy: { needs: true, commodities: true, connections: true, groups: true },
  advertiseFollow: false,
};

const mockNeeds = [
  { id: 1, text: "Looking for a reliable supplier of LED panels in bulk.", date: "2 hours ago" },
  { id: 2, text: "Need 500 units of USB-C cables, delivery within Lagos.", date: "1 day ago" },
];

const mockCommodities = [
  { id: 1, name: "LED Panel 60x60", price: "₦12,500", image: "" },
  { id: 2, name: "USB-C Cable 1m", price: "₦1,200", image: "" },
];

const mockProfileConnections = [
  { id: 10, name: "Grace Amadi", avatar: "GA", mutualConnections: 7 },
  { id: 11, name: "Yusuf Abdullahi", avatar: "YA", mutualConnections: 3 },
];

const mockRecommendations = [
  { id: 1, from: "Tunde Bakare", text: "Excellent and trustworthy trader. Fast delivery!", date: "Jan 2025" },
];

const mockMentions = [
  { id: 1, by: "Halima Sani", context: "Mentioned you in a need post about electronics.", date: "3 days ago" },
];

const mockGroups = [
  { id: 1, name: "Lagos Electronics Traders", members: 340 },
  { id: 2, name: "Bulk Importers Network", members: 128 },
];

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = mockProfiles[id || ""] || fallbackProfile;
  const [followOpen, setFollowOpen] = useState(false);
  const [following, setFollowing] = useState<{ needs: boolean; commodities: boolean }>({ needs: false, commodities: false });

  const stats = [
    { icon: ThumbsUp, label: "Recommendations", value: profile.recommendations },
    { icon: AtSign, label: "Mentions", value: profile.mentions },
    { icon: AlertTriangle, label: "Reports", value: profile.abuseReports },
  ];

  const visibleTabs = [
    profile.privacy.needs && "needs",
    profile.privacy.commodities && "commodities",
    profile.privacy.connections && "connections",
    "recommendations",
    "mentions",
    profile.privacy.groups && "groups",
  ].filter(Boolean) as string[];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          </header>

          <main className="flex-1 overflow-y-auto">
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/30 p-6 md:p-10">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{profile.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</p>
                  <Badge variant="secondary" className="mt-2">{profile.category}</Badge>
                  <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                    {stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1"><s.icon className="h-3 w-3" />{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button><UserPlus className="h-4 w-4 mr-2" />Connect</Button>
                  {profile.advertiseFollow && (
                    <Popover open={followOpen} onOpenChange={setFollowOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline"><Bell className="h-4 w-4 mr-2" />Follow <ChevronDown className="h-3 w-3 ml-1" /></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2">
                        <button
                          className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors ${following.needs ? "text-primary font-medium" : "text-foreground"}`}
                          onClick={() => setFollowing((f) => ({ ...f, needs: !f.needs }))}
                        >
                          <Home className="h-4 w-4" />Follow Needs {following.needs && <Badge className="ml-auto text-[10px]">Following</Badge>}
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors ${following.commodities ? "text-primary font-medium" : "text-foreground"}`}
                          onClick={() => setFollowing((f) => ({ ...f, commodities: !f.commodities }))}
                        >
                          <ShoppingBag className="h-4 w-4" />Follow Commodities {following.commodities && <Badge className="ml-auto text-[10px]">Following</Badge>}
                        </button>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="max-w-4xl mx-auto p-4 md:p-6">
              <Tabs defaultValue={visibleTabs[0]} className="space-y-4">
                <div className="overflow-x-auto -mx-4 px-4"><TabsList className="flex w-max gap-1 h-auto p-1">
                  {visibleTabs.includes("needs") && <TabsTrigger value="needs"><Home className="h-3.5 w-3.5 mr-1" />Needs</TabsTrigger>}
                  {visibleTabs.includes("commodities") && <TabsTrigger value="commodities"><ShoppingBag className="h-3.5 w-3.5 mr-1" />Commodities</TabsTrigger>}
                  {visibleTabs.includes("connections") && <TabsTrigger value="connections"><Users className="h-3.5 w-3.5 mr-1" />Connections</TabsTrigger>}
                  <TabsTrigger value="recommendations"><Star className="h-3.5 w-3.5 mr-1" />Recommendations</TabsTrigger>
                  <TabsTrigger value="mentions"><AtSign className="h-3.5 w-3.5 mr-1" />Mentions</TabsTrigger>
                  {visibleTabs.includes("groups") && <TabsTrigger value="groups"><UsersRound className="h-3.5 w-3.5 mr-1" />Groups</TabsTrigger>}
                </TabsList>

                {/* Needs */}
                <TabsContent value="needs" className="space-y-3">
                  {mockNeeds.map((n) => (
                    <Card key={n.id}><CardContent className="p-4"><p className="text-sm text-foreground">{n.text}</p><p className="text-xs text-muted-foreground mt-2">{n.date}</p></CardContent></Card>
                  ))}
                </TabsContent>

                {/* Commodities */}
                <TabsContent value="commodities">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockCommodities.map((c) => (
                      <Card key={c.id}>
                        <CardContent className="p-4">
                          <div className="h-32 bg-muted rounded-md mb-3 flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-sm text-primary font-semibold">{c.price}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Connections */}
                <TabsContent value="connections" className="space-y-3">
                  {mockProfileConnections.map((c) => (
                    <Card key={c.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/20 text-primary">{c.avatar}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.mutualConnections} mutual connections</p></div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Recommendations */}
                <TabsContent value="recommendations" className="space-y-3">
                  {mockRecommendations.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <p className="text-sm text-foreground italic">"{r.text}"</p>
                        <p className="text-xs text-muted-foreground mt-2">— {r.from} · {r.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Mentions */}
                <TabsContent value="mentions" className="space-y-3">
                  {mockMentions.map((m) => (
                    <Card key={m.id}>
                      <CardContent className="p-4">
                        <p className="text-sm text-foreground">{m.context}</p>
                        <p className="text-xs text-muted-foreground mt-2">By {m.by} · {m.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Groups */}
                <TabsContent value="groups" className="space-y-3">
                  {mockGroups.map((g) => (
                    <Card key={g.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center"><UsersRound className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1"><p className="font-medium text-foreground">{g.name}</p><p className="text-xs text-muted-foreground">{g.members} members</p></div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
