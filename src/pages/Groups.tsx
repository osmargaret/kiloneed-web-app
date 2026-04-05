import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Plus, Users, Lock, Sparkles, Globe, ChevronLeft, Settings,
  ShoppingBag, Home, UserPlus, UserCheck, UserX, Crown, Shield, User,
  Image as ImageIcon, Wallet, ArrowDownToLine, Check, X, Clock,
  AlertTriangle, ImagePlus, Send,
} from "lucide-react";
import GroupPost, { GroupPostData } from "@/components/GroupPost";
import GroupMessageModal from "@/components/GroupMessageModal";

// ─── Types ───
type GroupType = "open" | "closed" | "special";
type MemberRole = "admin" | "moderator" | "member";

interface GroupMember {
  id: number;
  name: string;
  avatar: string;
  role: MemberRole;
  joinedAt: string;
}

interface DueTransaction {
  id: number;
  member: string;
  amount: number;
  date: string;
  type: "payment" | "withdrawal";
  status: "completed" | "pending" | "approved";
}

interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  type: GroupType;
  category: string;
  membersCount: number;
  maxMembers: number;
  isMember: boolean;
  isAdmin: boolean;
  isPending: boolean;
  members: GroupMember[];
  dues?: { total: number; frequency: string; amount: number; transactions: DueTransaction[] };
}

interface Invitation {
  id: number;
  groupId: number;
  groupTitle: string;
  groupImage: string;
  groupType: GroupType;
  invitedBy: string;
}

interface JoinRequest {
  id: number;
  groupId: number;
  groupTitle: string;
  userName: string;
  userAvatar: string;
  requestedAt: string;
}

// ─── Seed Data ───
const seedMembers: GroupMember[] = [
  { id: 1, name: "Adebayo Ogunlesi", avatar: "AO", role: "admin", joinedAt: "Jan 2024" },
  { id: 2, name: "Fatima Bello", avatar: "FB", role: "moderator", joinedAt: "Feb 2024" },
  { id: 3, name: "Chinedu Okoro", avatar: "CO", role: "member", joinedAt: "Mar 2024" },
  { id: 4, name: "Amina Yusuf", avatar: "AY", role: "member", joinedAt: "Mar 2024" },
  { id: 5, name: "Tunde Bakare", avatar: "TB", role: "member", joinedAt: "Apr 2024" },
];

const seedGroups: Group[] = [
  { id: 1, title: "Lagos Tech Traders", description: "Buy and sell electronics, gadgets and tech services across Lagos. Trusted community of verified sellers.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=300&fit=crop", type: "open", category: "Electronics", membersCount: 342, maxMembers: 1000, isMember: true, isAdmin: true, isPending: false, members: seedMembers, dues: undefined },
  { id: 2, title: "Abuja Auto Connect", description: "Vehicle buyers and sellers in Abuja. Verified listings, fair prices, trusted community.", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=300&fit=crop", type: "closed", category: "Vehicles", membersCount: 187, maxMembers: 1000, isMember: false, isAdmin: false, isPending: false, members: seedMembers.slice(0, 3), dues: undefined },
  { id: 3, title: "Nigerian Fashion Hub", description: "Fashion designers, tailors, and style enthusiasts. Share trends, buy fabrics, find tailors.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop", type: "open", category: "Fashion", membersCount: 523, maxMembers: 1000, isMember: true, isAdmin: false, isPending: false, members: seedMembers.slice(0, 4), dues: undefined },
  { id: 4, title: "PH Real Estate Circle", description: "Exclusive real estate investment group in Port Harcourt. Monthly dues, verified deals only.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop", type: "special", category: "Real Estate", membersCount: 45, maxMembers: 1000, isMember: true, isAdmin: false, isPending: false, members: seedMembers, dues: { total: 2350000, frequency: "monthly", amount: 25000, transactions: [
    { id: 1, member: "Adebayo Ogunlesi", amount: 25000, date: "Mar 2024", type: "payment", status: "completed" },
    { id: 2, member: "Fatima Bello", amount: 25000, date: "Mar 2024", type: "payment", status: "completed" },
    { id: 3, member: "Admin", amount: 500000, date: "Feb 2024", type: "withdrawal", status: "approved" },
    { id: 4, member: "Chinedu Okoro", amount: 25000, date: "Apr 2024", type: "payment", status: "pending" },
  ] } },
  { id: 5, title: "Kano Agribusiness Network", description: "Connecting farmers, distributors and food vendors across Northern Nigeria.", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=300&fit=crop", type: "open", category: "Food", membersCount: 678, maxMembers: 1000, isMember: false, isAdmin: false, isPending: true, members: seedMembers.slice(0, 2), dues: undefined },
  { id: 6, title: "Ibadan Services Hub", description: "Find and offer professional services — plumbing, electrical, cleaning, tutoring and more.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=300&fit=crop", type: "closed", category: "Services", membersCount: 156, maxMembers: 1000, isMember: false, isAdmin: false, isPending: false, members: seedMembers.slice(0, 3), dues: undefined },
];

const seedInvitations: Invitation[] = [
  { id: 1, groupId: 10, groupTitle: "Exclusive Gadget Deals", groupImage: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=200&h=200&fit=crop", groupType: "special", invitedBy: "Emeka Johnson" },
  { id: 2, groupId: 11, groupTitle: "Lekki Homeowners", groupImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop", groupType: "closed", invitedBy: "Ngozi Adichie" },
];

const seedJoinRequests: JoinRequest[] = [
  { id: 1, groupId: 1, groupTitle: "Lagos Tech Traders", userName: "Bola Tinubu Jr.", userAvatar: "BT", requestedAt: "2h ago" },
  { id: 2, groupId: 1, groupTitle: "Lagos Tech Traders", userName: "Adeola Williams", userAvatar: "AW", requestedAt: "5h ago" },
];

const seedGroupPosts: GroupPostData[] = [
  {
    id: "gp1", author: "Adebayo Ogunlesi", avatar: "AO",
    text: "Just got a bulk shipment of Samsung Galaxy S24 cases. Anyone interested? ₦3,500 each, minimum order 10 pieces. DM me!",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=300&fit=crop",
    time: "2h ago", likes: 12, liked: false, saved: false, shared: false,
    comments: [
      { id: "gc1", author: "Fatima Bello", avatar: "FB", text: "I'll take 20! Please reserve for me", time: "1h ago" },
      { id: "gc2", author: "Chinedu Okoro", avatar: "CO", text: "Great price! Are there other colors?", time: "45m ago" },
    ],
  },
  {
    id: "gp2", author: "Amina Yusuf", avatar: "AY",
    text: "Looking for a reliable laptop repair technician in Ikeja area. My MacBook Pro screen needs replacement. Any recommendations?",
    time: "5h ago", likes: 4, liked: false, saved: false, shared: false,
    comments: [
      { id: "gc3", author: "Tunde Bakare", avatar: "TB", text: "Try TechFix on Allen Avenue, they're good", time: "4h ago" },
    ],
  },
  {
    id: "gp3", author: "Chinedu Okoro", avatar: "CO",
    text: "PSA: Beware of fake iPhone 15 chargers flooding the market. I tested 5 from Computer Village — only 1 was genuine. Always buy from verified sellers!",
    time: "1d ago", likes: 28, liked: true, saved: true, shared: false,
    comments: [],
  },
];

const categories = ["All", "Electronics", "Fashion", "Vehicles", "Real Estate", "Food", "Services", "Health", "Sports"];

const typeIcon = (type: GroupType) => {
  if (type === "open") return <Globe className="h-3.5 w-3.5" />;
  if (type === "closed") return <Lock className="h-3.5 w-3.5" />;
  return <Sparkles className="h-3.5 w-3.5" />;
};

const typeColor = (type: GroupType) => {
  if (type === "open") return "text-green-400";
  if (type === "closed") return "text-yellow-400";
  return "text-primary";
};

const roleIcon = (role: MemberRole) => {
  if (role === "admin") return <Crown className="h-3.5 w-3.5 text-yellow-400" />;
  if (role === "moderator") return <Shield className="h-3.5 w-3.5 text-primary" />;
  return <User className="h-3.5 w-3.5 text-muted-foreground" />;
};

const formatCurrency = (n: number) => "₦" + n.toLocaleString("en-NG");

const Groups = () => {
  const [groups, setGroups] = useState(seedGroups);
  const [invitations, setInvitations] = useState(seedInvitations);
  const [joinRequests, setJoinRequests] = useState(seedJoinRequests);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [viewGroup, setViewGroup] = useState<Group | null>(null);
  const [groupTab, setGroupTab] = useState("needs");
  const [showCreate, setShowCreate] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<GroupType>("open");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newDuesAmount, setNewDuesAmount] = useState("");
  const [newDuesFreq, setNewDuesFreq] = useState("monthly");

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Group posts state
  const [groupPosts, setGroupPosts] = useState<GroupPostData[]>(seedGroupPosts);
  const [newPostText, setNewPostText] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTargetUser, setMessageTargetUser] = useState("");

  const filtered = groups.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || g.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleJoin = (id: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        if (g.type === "open") return { ...g, isMember: true, membersCount: g.membersCount + 1 };
        return { ...g, isPending: true };
      })
    );
  };

  const handleLeave = (id: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isMember: false, isPending: false, membersCount: Math.max(0, g.membersCount - 1) } : g))
    );
    if (viewGroup?.id === id) setViewGroup(null);
  };

  const handleAcceptRequest = (reqId: number) => setJoinRequests((prev) => prev.filter((r) => r.id !== reqId));
  const handleDeclineRequest = (reqId: number) => setJoinRequests((prev) => prev.filter((r) => r.id !== reqId));
  const handleAcceptInvite = (invId: number) => setInvitations((prev) => prev.filter((i) => i.id !== invId));
  const handleDeclineInvite = (invId: number) => setInvitations((prev) => prev.filter((i) => i.id !== invId));

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const g: Group = {
      id: Date.now(), title: newTitle, description: newDesc, image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop",
      type: newType, category: newCategory, membersCount: 1, maxMembers: 1000, isMember: true, isAdmin: true, isPending: false,
      members: [{ id: 1, name: "You", avatar: "YO", role: "admin", joinedAt: "Now" }],
      dues: newType === "special" ? { total: 0, frequency: newDuesFreq, amount: Number(newDuesAmount) || 0, transactions: [] } : undefined,
    };
    setGroups((prev) => [g, ...prev]);
    setNewTitle(""); setNewDesc(""); setNewType("open"); setShowCreate(false);
  };

  const handleChangeRole = (groupId: number, memberId: number, newRole: MemberRole) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)) }
          : g
      )
    );
    if (viewGroup?.id === groupId) {
      setViewGroup((prev) => prev ? { ...prev, members: prev.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)) } : prev);
    }
  };

  // ─── Post handlers ───
  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    const post: GroupPostData = {
      id: `gp-${Date.now()}`, author: "You", avatar: "YO", text: newPostText,
      time: "Just now", likes: 0, liked: false, saved: false, shared: false, comments: [],
    };
    setGroupPosts((prev) => [post, ...prev]);
    setNewPostText("");
    toast.success("Post published!");
  };

  const handleLikePost = (id: string) => {
    setGroupPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleSavePost = (id: string) => {
    setGroupPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, saved: !p.saved } : p
    ));
    const post = groupPosts.find((p) => p.id === id);
    toast.success(post?.saved ? "Post unsaved" : "Post saved!");
  };

  const handleSharePost = (id: string) => {
    setGroupPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, shared: true } : p
    ));
    toast.success("Post shared!");
  };

  const handleCommentPost = (id: string, text: string) => {
    setGroupPosts((prev) => prev.map((p) =>
      p.id === id ? {
        ...p, comments: [...p.comments, {
          id: `gc-${Date.now()}`, author: "You", avatar: "YO", text, time: "Just now",
        }],
      } : p
    ));
  };

  const handleUsernameClick = (name: string) => {
    if (name === "You") return;
    setMessageTargetUser(name);
    setMessageModalOpen(true);
  };


  if (viewGroup) {
    const g = groups.find((gr) => gr.id === viewGroup.id) || viewGroup;
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-40 h-14 flex items-center gap-2 sm:gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-3 sm:px-4">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" onClick={() => setViewGroup(null)} className="shrink-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-display text-sm font-bold text-foreground truncate">{g.title}</span>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="relative h-36 sm:h-56 overflow-hidden">
                <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline" className={`${typeColor(g.type)} border-current text-[10px] gap-1 capitalize`}>
                      {typeIcon(g.type)} {g.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
                  </div>
                  <h1 className="font-display text-lg sm:text-2xl font-bold text-foreground">{g.title}</h1>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
                  <div className="flex items-center gap-3 mt-1 sm:mt-2 text-[11px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />{g.membersCount.toLocaleString()} / {g.maxMembers.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                <Tabs value={groupTab} onValueChange={setGroupTab}>
                  <div className="overflow-x-auto -mx-3 px-3">
                    <TabsList className="bg-secondary flex w-max gap-1">
                      <TabsTrigger value="needs" className="gap-1 text-xs"><Home className="h-3.5 w-3.5" /> Needs</TabsTrigger>
                      <TabsTrigger value="commodities" className="gap-1 text-xs"><ShoppingBag className="h-3.5 w-3.5" /> Items</TabsTrigger>
                      <TabsTrigger value="members" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" /> Members</TabsTrigger>
                      {g.isMember && g.dues && (
                        <TabsTrigger value="dues" className="gap-1 text-xs"><Wallet className="h-3.5 w-3.5" /> Dues</TabsTrigger>
                      )}
                      {g.isAdmin && (
                        <TabsTrigger value="settings" className="gap-1 text-xs"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
                      )}
                    </TabsList>
                  </div>

                  <TabsContent value="needs" className="mt-4 space-y-3">
                    <Card className="gradient-card border-border p-4 sm:p-6 text-center">
                      <Home className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Group needs will appear here.</p>
                    </Card>
                  </TabsContent>

                  <TabsContent value="commodities" className="mt-4 space-y-3">
                    <Card className="gradient-card border-border p-4 sm:p-6 text-center">
                      <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Group commodities will appear here.</p>
                    </Card>
                  </TabsContent>

                  <TabsContent value="members" className="mt-4 space-y-2">
                    {g.members.map((m) => (
                      <Card key={m.id} className="gradient-card border-border">
                        <CardContent className="p-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{m.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs sm:text-sm font-medium text-foreground truncate">{m.name}</span>
                                {roleIcon(m.role)}
                              </div>
                              <span className="text-[10px] sm:text-[11px] text-muted-foreground capitalize">{m.role} · {m.joinedAt}</span>
                            </div>
                          </div>
                          {g.isAdmin && m.role !== "admin" && (
                            <Select value={m.role} onValueChange={(val) => handleChangeRole(g.id, m.id, val as MemberRole)}>
                              <SelectTrigger className="w-[90px] sm:w-[120px] h-7 sm:h-8 text-[10px] sm:text-xs bg-secondary border-border shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {g.dues && (
                    <TabsContent value="dues" className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Card className="gradient-card border-border">
                          <CardContent className="p-3 sm:p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                            <p className="text-lg sm:text-xl font-bold text-gradient-blue">{formatCurrency(g.dues.total)}</p>
                          </CardContent>
                        </Card>
                        <Card className="gradient-card border-border">
                          <CardContent className="p-3 sm:p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Dues Amount</p>
                            <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(g.dues.amount)}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{g.dues.frequency}</p>
                          </CardContent>
                        </Card>
                        <Card className="gradient-card border-border">
                          <CardContent className="p-3 sm:p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Actions</p>
                            {g.isAdmin ? (
                              <Button size="sm" className="gradient-blue text-primary-foreground gap-1 text-xs" onClick={() => setShowWithdraw(true)}>
                                <ArrowDownToLine className="h-3.5 w-3.5" /> Withdraw
                              </Button>
                            ) : (
                              <Button size="sm" className="gradient-blue text-primary-foreground gap-1 text-xs">
                                <Wallet className="h-3.5 w-3.5" /> Pay Dues
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
                      <div className="space-y-2">
                        {g.dues.transactions.map((t) => (
                          <Card key={t.id} className="gradient-card border-border">
                            <CardContent className="p-3 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 ${t.type === "payment" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                                  {t.type === "payment" ? <Wallet className="h-3.5 w-3.5" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm text-foreground truncate">{t.member}</p>
                                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">{t.date} · <span className="capitalize">{t.status}</span></p>
                                </div>
                              </div>
                              <span className={`text-xs sm:text-sm font-bold shrink-0 ${t.type === "payment" ? "text-green-400" : "text-yellow-400"}`}>
                                {t.type === "payment" ? "+" : "-"}{formatCurrency(t.amount)}
                              </span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {g.isAdmin && (
                    <TabsContent value="settings" className="mt-4 space-y-4">
                      <Card className="gradient-card border-border">
                        <CardContent className="p-3 sm:p-4 space-y-4">
                          <h3 className="text-sm font-semibold text-foreground">Group Settings</h3>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Group Title</label>
                            <Input defaultValue={g.title} className="bg-secondary border-border" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                            <Textarea defaultValue={g.description} className="bg-secondary border-border resize-none" rows={3} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                            <Badge variant="outline" className={`${typeColor(g.type)} border-current capitalize gap-1`}>
                              {typeIcon(g.type)} {g.type}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button className="gradient-blue text-primary-foreground">Save Changes</Button>
                            <Button variant="destructive" size="sm" className="gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" /> Delete Group
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </Tabs>

                {g.isMember && !g.isAdmin && (
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleLeave(g.id)}>
                      Leave Group
                    </Button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

        <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
          <DialogContent className="gradient-card border-border max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle className="font-display">Request Withdrawal</DialogTitle>
              <DialogDescription>Requires approval from 3 other members.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (₦)</label>
                <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destination Account</label>
                <Input placeholder="Bank — Account number" className="bg-secondary border-border" />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-400" /> 3 members must approve.</p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
              <Button className="gradient-blue text-primary-foreground" onClick={() => setShowWithdraw(false)}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    );
  }

  // ─── Main Groups List View ───
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 flex items-center gap-2 sm:gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-3 sm:px-4">
            <SidebarTrigger />
            <span className="font-display text-base sm:text-lg font-bold text-gradient-blue">KILONEED</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">/ Groups</span>
            <div className="ml-auto">
              <Button size="sm" onClick={() => setShowCreate(true)} className="gradient-blue text-primary-foreground gap-1 text-xs sm:text-sm">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant={filterCat === c ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap text-xs ${filterCat === c ? "gradient-blue text-primary-foreground border-transparent" : "hover:bg-muted"}`}
                    onClick={() => setFilterCat(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>

              <Tabs defaultValue="suggested">
                <div className="overflow-x-auto -mx-3 px-3">
                  <TabsList className="bg-secondary flex w-max gap-1">
                    <TabsTrigger value="suggested" className="text-xs">Groups</TabsTrigger>
                    <TabsTrigger value="invitations" className="gap-1 text-xs">
                      Invites {invitations.length > 0 && <Badge className="gradient-blue text-primary-foreground h-5 px-1.5 text-[10px] border-transparent">{invitations.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="gap-1 text-xs">
                      Requests {joinRequests.length > 0 && <Badge className="gradient-blue text-primary-foreground h-5 px-1.5 text-[10px] border-transparent">{joinRequests.length}</Badge>}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="suggested" className="mt-4 space-y-3">
                  {filtered.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="gradient-card border-border overflow-hidden hover:shadow-glow transition-shadow">
                        <div className="flex">
                          <div
                            className="w-20 sm:w-40 shrink-0 overflow-hidden cursor-pointer"
                            onClick={() => { setViewGroup(g); setGroupTab("needs"); }}
                          >
                            <img src={g.image} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <CardContent className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <h3
                                  className="font-display font-semibold text-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors truncate"
                                  onClick={() => { setViewGroup(g); setGroupTab("needs"); }}
                                >
                                  {g.title}
                                </h3>
                                <Badge variant="outline" className={`${typeColor(g.type)} border-current text-[8px] sm:text-[9px] gap-0.5 capitalize shrink-0`}>
                                  {typeIcon(g.type)} {g.type}
                                </Badge>
                              </div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{g.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                              <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" /> {g.membersCount.toLocaleString()}
                              </span>
                              {g.isMember ? (
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] text-green-400 border-green-400/30 gap-0.5">
                                  <UserCheck className="h-3 w-3" /> Joined
                                </Badge>
                              ) : g.isPending ? (
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] text-yellow-400 border-yellow-400/30 gap-0.5">
                                  <Clock className="h-3 w-3" /> Pending
                                </Badge>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10 px-2" onClick={() => handleJoin(g.id)}>
                                  <UserPlus className="h-3 w-3" /> Join
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No groups found.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invitations" className="mt-4 space-y-3">
                  {invitations.length === 0 ? (
                    <div className="text-center py-16">
                      <UserPlus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No pending invitations.</p>
                    </div>
                  ) : invitations.map((inv) => (
                    <Card key={inv.id} className="gradient-card border-border">
                      <CardContent className="p-3 flex items-center gap-2 sm:gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden shrink-0">
                          <img src={inv.groupImage} alt={inv.groupTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{inv.groupTitle}</p>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground">By {inv.invitedBy}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 border-green-400/30 text-green-400 hover:bg-green-400/10" onClick={() => handleAcceptInvite(inv.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleDeclineInvite(inv.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="requests" className="mt-4 space-y-3">
                  {joinRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <UserCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No pending requests.</p>
                    </div>
                  ) : joinRequests.map((req) => (
                    <Card key={req.id} className="gradient-card border-border">
                      <CardContent className="p-3 flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{req.userAvatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{req.userName}</p>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{req.groupTitle} · {req.requestedAt}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="h-6 sm:h-7 text-[10px] sm:text-xs border-green-400/30 text-green-400 hover:bg-green-400/10 gap-0.5 px-2" onClick={() => handleAcceptRequest(req.id)}>
                            <Check className="h-3 w-3" /> <span className="hidden sm:inline">Accept</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 sm:h-7 text-[10px] sm:text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-0.5 px-2" onClick={() => handleDeclineRequest(req.id)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="gradient-card border-border max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="font-display">Create Group</DialogTitle>
            <DialogDescription>Start a new community. Max 1,000 members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Group Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Lagos Tech Traders" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What is this group about?" className="bg-secondary border-border resize-none" rows={3} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select value={newType} onValueChange={(v) => setNewType(v as GroupType)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="special">Special (with dues)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newType === "special" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Dues Amount (₦)</label>
                  <Input type="number" value={newDuesAmount} onChange={(e) => setNewDuesAmount(e.target.value)} placeholder="0" className="bg-secondary border-border" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Frequency</label>
                  <Select value={newDuesFreq} onValueChange={setNewDuesFreq}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="gradient-blue text-primary-foreground">Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Groups;