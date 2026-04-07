import { useState } from "react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CreditCard, Plus, Sparkles, Users, Megaphone, Crown,
  Check, ArrowRight, Bot, Send, Loader2, Image, Video,
  FileText, Globe, MapPin, Clock, Star
} from "lucide-react";

const profilePlans = [
  { name: "Starter", price: "Free", profiles: 1, features: ["1 Profile", "Basic needs", "5km radius"], current: true },
  { name: "Plus", price: "₦2,500/mo", profiles: 3, features: ["3 Profiles", "Unlimited needs", "25km", "Priority feed"], popular: true },
  { name: "Pro", price: "₦6,000/mo", profiles: 10, features: ["10 Profiles", "Nationwide", "Verified badge", "Analytics"] },
  { name: "Business", price: "₦15,000/mo", profiles: "Unlimited", features: ["Unlimited Profiles", "Team mgmt", "API access", "Dedicated support"] },
];

function SubscriptionsSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Manage Profiles</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Add profiles to manage multiple businesses.</p>
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {profilePlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative transition-all hover:shadow-lg ${plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"} ${plan.current ? "bg-muted/30" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gradient-blue text-primary-foreground border-0 text-[10px]">
                Popular
              </Badge>
            )}
            <CardHeader className="p-3 sm:pb-3">
              <CardTitle className="text-xs sm:text-base">{plan.name}</CardTitle>
              <CardDescription className="text-lg sm:text-2xl font-bold text-foreground">{plan.price}</CardDescription>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {typeof plan.profiles === "number" ? `${plan.profiles} profile${plan.profiles > 1 ? "s" : ""}` : plan.profiles}
              </p>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2 sm:space-y-3">
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? "outline" : plan.popular ? "default" : "secondary"}
                className={`w-full text-[10px] sm:text-xs h-7 sm:h-9 ${plan.popular ? "gradient-blue text-primary-foreground" : ""}`}
                disabled={plan.current}
              >
                {plan.current ? "Current" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => toast.success("Upgrade your plan to add more profiles!")}>
        <CardContent className="flex items-center justify-center gap-3 py-4 sm:py-6">
          <Plus className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary text-sm">Add New Profile</span>
        </CardContent>
      </Card>
    </div>
  );
}

const adOptions = [
  { name: "Spotlight", icon: Star, price: "₦1,000/day", description: "Pin your need to top of feeds.", reach: "~5,000 views", color: "from-yellow-500/20 to-amber-500/20" },
  { name: "Banner Ad", icon: Image, price: "₦3,500/day", description: "Full-width banner between posts.", reach: "~15,000 views", color: "from-blue-500/20 to-cyan-500/20" },
  { name: "Video Ad", icon: Video, price: "₦7,000/day", description: "Auto-playing video in feed.", reach: "~30,000 views", color: "from-purple-500/20 to-pink-500/20" },
  { name: "Featured", icon: Crown, price: "₦5,000/wk", description: "Showcase in Featured carousel.", reach: "~50,000 views", color: "from-emerald-500/20 to-teal-500/20" },
];

function AdsSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Advertise on Kiloneed</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Promote to thousands of nearby users.</p>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {adOptions.map((ad) => (
          <Card key={ad.name} className="overflow-hidden hover:shadow-lg transition-all group">
            <div className={`h-1.5 w-full bg-gradient-to-r ${ad.color}`} />
            <CardHeader className="pb-2 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ad.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <CardTitle className="text-xs sm:text-base">{ad.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs">{ad.price}</Badge>
              </div>
              <CardDescription className="text-[10px] sm:text-xs">{ad.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between px-3 sm:px-6">
              <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> {ad.reach}
              </span>
              <Button size="sm" variant="outline" className="text-[10px] sm:text-xs h-7" onClick={() => toast.success(`Creating ${ad.name} ad...`)}>
                Create <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const sampleGroups = [
  { name: "Lagos Tech Buyers", members: 1240, dues: "₦500/mo", status: "active" as const },
  { name: "Abuja Auto Market", members: 890, dues: "₦1,000/mo", status: "pending" as const },
  { name: "PH Real Estate Circle", members: 560, dues: "₦2,000/mo", status: "active" as const },
];

function GroupDuesSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Group Dues</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage memberships and payments.</p>
      </div>
      <div className="space-y-3">
        {sampleGroups.map((g) => (
          <Card key={g.name} className="hover:shadow-md transition-all">
            <CardContent className="flex items-center justify-between py-3 sm:py-4 px-3 sm:px-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg gradient-blue flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{g.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{g.members.toLocaleString()} members</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-mono text-xs sm:text-sm font-medium">{g.dues}</p>
                  <Badge variant={g.status === "active" ? "default" : "secondary"} className="text-[10px]">
                    {g.status === "active" ? "Paid" : "Pending"}
                  </Badge>
                </div>
                <Button size="sm" variant={g.status === "active" ? "outline" : "default"} className={`h-7 text-xs ${g.status !== "active" ? "gradient-blue text-primary-foreground" : ""}`}
                  onClick={() => toast.success(g.status === "active" ? `Managing ${g.name}` : `Payment of ${g.dues} for ${g.name} processing...`)}
                >
                  {g.status === "active" ? "Manage" : "Pay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function KiloAISection() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "👋 Hi! I'm **KiloAI**. Paste or describe a need, and I'll help you interpret it." },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const parsed = simulateAI(userMsg.content);
      setMessages((prev) => [...prev, { role: "assistant", content: parsed }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> KiloAI
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">AI-powered need interpreter.</p>
      </div>
      <Card className="overflow-hidden">
        <div className="h-64 sm:h-80 overflow-y-auto p-3 sm:p-4 space-y-3 bg-muted/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm ${m.role === "user" ? "gradient-blue text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-xl px-4 py-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border p-2 sm:p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Paste a need…"
            className="flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground min-w-0"
          />
          <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()} className="gradient-blue text-primary-foreground shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      <div className="grid gap-2 sm:gap-3 grid-cols-3">
        {[
          { icon: FileText, label: "Details", desc: "Category, budget" },
          { icon: MapPin, label: "Location", desc: "Nearby sellers" },
          { icon: Clock, label: "Urgency", desc: "Priority rank" },
        ].map((f) => (
          <Card key={f.label} className="hover:shadow-md transition-all">
            <CardContent className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-4">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-sm font-medium">{f.label}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function simulateAI(text: string): string {
  const lower = text.toLowerCase();
  const category = lower.includes("phone") || lower.includes("samsung") || lower.includes("iphone") ? "Electronics" : lower.includes("plumb") || lower.includes("electric") ? "Services" : lower.includes("car") || lower.includes("vehicle") ? "Automotive" : "General";
  const budgetMatch = text.match(/[₦$][\d,]+/g);
  const budget = budgetMatch ? budgetMatch.join(" – ") : "Not specified";
  const urgency = lower.includes("urgent") || lower.includes("asap") ? "🔴 High" : lower.includes("weekend") ? "🟡 Medium" : "🟢 Normal";
  return `📋 **Need Analysis**\n\n🏷️ Category: ${category}\n💰 Budget: ${budget}\n⚡ Urgency: ${urgency}\n📍 Location: From your profile\n\n💡 Post this need to get responses!`;
}

const Dashboard = () => {
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
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage subscriptions, ads, groups, and AI.</p>
              </div>
              <Tabs defaultValue="subscriptions" className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 h-auto">
                  <TabsTrigger value="subscriptions" className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <CreditCard className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Subscriptions</span><span className="sm:hidden">Subs</span>
                  </TabsTrigger>
                  <TabsTrigger value="ads" className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <Megaphone className="h-3.5 w-3.5" /> Ads
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <Users className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Group Dues</span><span className="sm:hidden">Groups</span>
                  </TabsTrigger>
                  <TabsTrigger value="kiloai" className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <Sparkles className="h-3.5 w-3.5" /> KiloAI
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="subscriptions"><SubscriptionsSection /></TabsContent>
                <TabsContent value="ads"><AdsSection /></TabsContent>
                <TabsContent value="groups"><GroupDuesSection /></TabsContent>
                <TabsContent value="kiloai"><KiloAISection /></TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;