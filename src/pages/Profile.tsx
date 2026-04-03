import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Home, ShoppingBag, Users, UsersRound, Settings, Megaphone, Receipt,
  UserPlus, ThumbsUp, AtSign, AlertTriangle, Crown, MapPin, Edit,
  ExternalLink, Star,
} from "lucide-react";

// ─── Mock user data ───
const currentUser = {
  name: "John Doe",
  avatar: "JD",
  location: "Lagos, Nigeria",
  category: "Electronics",
  subscription: "Premium",
  subscriptionExpiry: "Dec 2026",
  recommendations: 87,
  mentions: 34,
  abuseReports: 0,
  profileLink: "kiloneed.com/johndoe",
};

const mockNeeds = [
  { id: 1, text: "Looking for wholesale laptop chargers, USB-C compatible.", date: "3 hours ago", reactions: 12 },
  { id: 2, text: "Need 200 units of screen protectors for iPhone 15 series.", date: "1 day ago", reactions: 8 },
  { id: 3, text: "Searching for a reliable logistics partner within Lagos.", date: "3 days ago", reactions: 22 },
];

const mockCommodities = [
  { id: 1, name: "USB-C Charger 65W", price: "₦8,500", stock: 150 },
  { id: 2, name: "LED Panel 60x60", price: "₦12,500", stock: 45 },
  { id: 3, name: "HDMI Cable 2m", price: "₦2,200", stock: 300 },
];

const mockConnections = [
  { id: 1, name: "Adaeze Okafor", avatar: "AO", mutual: 12 },
  { id: 2, name: "Emeka Nwosu", avatar: "EN", mutual: 15 },
  { id: 3, name: "Halima Sani", avatar: "HS", mutual: 9 },
];

const mockGroups = [
  { id: 1, name: "Lagos Electronics Traders", members: 340, role: "Admin" },
  { id: 2, name: "Bulk Importers Network", members: 128, role: "Member" },
];

const mockAds = [
  { id: 1, title: "Featured: USB-C Chargers", type: "Marketplace", status: "Active", views: 1240 },
  { id: 2, title: "Profile Sidebar Ad", type: "Profile", status: "Paused", views: 580 },
];

const mockTransactions = [
  { id: 1, description: "Premium Subscription", amount: "₦15,000", date: "Jan 15, 2025", status: "Completed" },
  { id: 2, description: "Marketplace Ad — 7 days", amount: "₦5,000", date: "Feb 02, 2025", status: "Completed" },
  { id: 3, description: "Group Dues — Bulk Importers", amount: "₦2,000", date: "Mar 01, 2025", status: "Pending" },
];

const subscriptionTiers = [
  { name: "Free", price: "₦0/mo", features: ["1 Profile", "Basic needs posting", "5 groups"] },
  { name: "Premium", price: "₦5,000/mo", features: ["3 Profiles", "Priority visibility", "50 groups", "Ad discounts"] },
  { name: "Business", price: "₦15,000/mo", features: ["10 Profiles", "Featured placement", "Unlimited groups", "Analytics dashboard"] },
];

export default function Profile() {
  const navigate = useNavigate();
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileCategory, setNewProfileCategory] = useState("");

  const stats = [
    { icon: ThumbsUp, label: "Recommendations", value: currentUser.recommendations },
    { icon: AtSign, label: "Mentions", value: currentUser.mentions },
    { icon: AlertTriangle, label: "Reports", value: currentUser.abuseReports },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">My Profile</h1>
          </header>

          <main className="flex-1 overflow-y-auto">
            {/* ── Profile Header ── */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/30 p-6 md:p-10">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">{currentUser.avatar}</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center shadow hover:bg-muted transition-colors">
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />{currentUser.location}
                  </p>
                  <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <Crown className="h-3 w-3 mr-1" />{currentUser.subscription}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Expires {currentUser.subscriptionExpiry}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3" />{currentUser.profileLink}
                  </p>
                  {/* Stats */}
                  <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                    {stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <s.icon className="h-3 w-3" />{s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="max-w-5xl mx-auto p-4 md:p-6">
              <Tabs defaultValue="needs" className="space-y-4">
                <div className="overflow-x-auto -mx-4 px-4">
                  <TabsList className="flex w-max gap-1 h-auto p-1">
                    <TabsTrigger value="needs"><Home className="h-3.5 w-3.5 mr-1" />Needs</TabsTrigger>
                    <TabsTrigger value="commodities"><ShoppingBag className="h-3.5 w-3.5 mr-1" />Commodities</TabsTrigger>
                    <TabsTrigger value="connections"><Users className="h-3.5 w-3.5 mr-1" />Connections</TabsTrigger>
                    <TabsTrigger value="groups"><UsersRound className="h-3.5 w-3.5 mr-1" />Groups</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="h-3.5 w-3.5 mr-1" />Settings</TabsTrigger>
                    <TabsTrigger value="ads"><Megaphone className="h-3.5 w-3.5 mr-1" />Ads</TabsTrigger>
                    <TabsTrigger value="transactions"><Receipt className="h-3.5 w-3.5 mr-1" />Transactions</TabsTrigger>
                    <TabsTrigger value="addprofile"><UserPlus className="h-3.5 w-3.5 mr-1" />Add Profile</TabsTrigger>
                  </TabsList>
                </div>

                {/* ─ Needs ─ */}
                <TabsContent value="needs" className="space-y-3">
                  {mockNeeds.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <p className="text-sm text-foreground">{n.text}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{n.date}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{n.reactions}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                {/* ─ Commodities ─ */}
                <TabsContent value="commodities">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockCommodities.map((c, i) => (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="h-28 bg-muted rounded-md mb-3 flex items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-primary font-semibold">{c.price}</p>
                              <Badge variant="secondary" className="text-[10px]">{c.stock} in stock</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* ─ Connections ─ */}
                <TabsContent value="connections" className="space-y-3">
                  {mockConnections.map((c) => (
                    <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${c.id}`)}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/20 text-primary">{c.avatar}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.mutual} mutual connections</p></div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/connections")}>View All Connections</Button>
                </TabsContent>

                {/* ─ Groups ─ */}
                <TabsContent value="groups" className="space-y-3">
                  {mockGroups.map((g) => (
                    <Card key={g.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center"><UsersRound className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{g.name}</p>
                          <p className="text-xs text-muted-foreground">{g.members} members</p>
                        </div>
                        <Badge variant="secondary">{g.role}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/groups")}>View All Groups</Button>
                </TabsContent>

                {/* ─ Settings ─ */}
                <TabsContent value="settings">
                  <Card>
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                      <Settings className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Manage your account settings</p>
                      <Button onClick={() => navigate("/settings")}>Go to Settings</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ─ Ads ─ */}
                <TabsContent value="ads" className="space-y-3">
                  {mockAds.map((a) => (
                    <Card key={a.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center"><Megaphone className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.type} · {a.views.toLocaleString()} views</p>
                        </div>
                        <Badge variant={a.status === "Active" ? "default" : "secondary"}>{a.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/ads")}>Manage All Ads</Button>
                </TabsContent>

                {/* ─ Transactions ─ */}
                <TabsContent value="transactions" className="space-y-3">
                  {mockTransactions.map((t) => (
                    <Card key={t.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center"><Receipt className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{t.description}</p>
                          <p className="text-xs text-muted-foreground">{t.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{t.amount}</p>
                          <Badge variant={t.status === "Completed" ? "default" : "secondary"} className="text-[10px]">{t.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/transactions")}>View All Transactions</Button>
                </TabsContent>

                {/* ─ Add New Profile ─ */}
                <TabsContent value="addprofile">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Subscription Plans</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Each additional profile requires an active subscription.</p>
                        <div className="grid gap-4 sm:grid-cols-3">
                          {subscriptionTiers.map((tier) => (
                            <Card key={tier.name} className={`border-2 ${tier.name === currentUser.subscription ? "border-primary" : "border-border"}`}>
                              <CardContent className="p-4 text-center">
                                <p className="font-bold text-foreground">{tier.name}</p>
                                <p className="text-lg font-semibold text-primary mt-1">{tier.price}</p>
                                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                                  {tier.features.map((f) => (
                                    <li key={f} className="flex items-center gap-1 justify-center"><Star className="h-3 w-3 text-primary" />{f}</li>
                                  ))}
                                </ul>
                                {tier.name === currentUser.subscription && <Badge className="mt-3">Current Plan</Badge>}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">Create New Profile</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Profile Name</Label>
                          <Input placeholder="e.g. My Fashion Store" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newProfileCategory} onValueChange={setNewProfileCategory}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="fashion">Fashion</SelectItem>
                              <SelectItem value="food">Food & Beverages</SelectItem>
                              <SelectItem value="auto">Auto Parts</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="construction">Construction</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" disabled={!newProfileName || !newProfileCategory}>
                          <UserPlus className="h-4 w-4 mr-2" />Create Profile (Annual Subscription Required)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
