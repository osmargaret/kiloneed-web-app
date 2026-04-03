import { useState } from "react";
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

/* ───────────────────── Subscriptions & Profiles ───────────────────── */

const profilePlans = [
  {
    name: "Starter",
    price: "Free",
    profiles: 1,
    features: ["1 Profile", "Basic needs posting", "5km radius"],
    current: true,
  },
  {
    name: "Plus",
    price: "₦2,500/mo",
    profiles: 3,
    features: ["3 Profiles", "Unlimited needs", "25km radius", "Priority feed"],
    popular: true,
  },
  {
    name: "Pro",
    price: "₦6,000/mo",
    profiles: 10,
    features: ["10 Profiles", "Unlimited needs", "Nationwide reach", "Verified badge", "Analytics"],
  },
  {
    name: "Business",
    price: "₦15,000/mo",
    profiles: "Unlimited",
    features: ["Unlimited Profiles", "Team management", "API access", "Dedicated support", "Custom branding"],
  },
];

function SubscriptionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Manage Profiles</h3>
        <p className="text-sm text-muted-foreground">Add additional profiles to manage multiple businesses or identities on Kiloneed.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profilePlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative transition-all hover:shadow-lg ${
              plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
            } ${plan.current ? "bg-muted/30" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gradient-blue text-primary-foreground border-0">
                Most Popular
              </Badge>
            )}
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <CardDescription className="text-2xl font-bold text-foreground">{plan.price}</CardDescription>
              <p className="text-xs text-muted-foreground">
                {typeof plan.profiles === "number" ? `${plan.profiles} profile${plan.profiles > 1 ? "s" : ""}` : plan.profiles}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? "outline" : plan.popular ? "default" : "secondary"}
                className={`w-full text-xs ${plan.popular ? "gradient-blue text-primary-foreground" : ""}`}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
        <CardContent className="flex items-center justify-center gap-3 py-6">
          <Plus className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary">Add New Profile</span>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────── Ads / Advert Section ───────────────────── */

const adOptions = [
  {
    name: "Spotlight",
    icon: Star,
    price: "₦1,000/day",
    description: "Pin your need to the top of local feeds for 24 hours.",
    reach: "~5,000 views",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    name: "Banner Ad",
    icon: Image,
    price: "₦3,500/day",
    description: "Full-width banner displayed between feed posts.",
    reach: "~15,000 views",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Video Ad",
    icon: Video,
    price: "₦7,000/day",
    description: "Auto-playing video ad shown in feed and explore pages.",
    reach: "~30,000 views",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Featured Product",
    icon: Crown,
    price: "₦5,000/week",
    description: "Showcase your product in the Featured Products carousel.",
    reach: "~50,000 views",
    color: "from-emerald-500/20 to-teal-500/20",
  },
];

function AdsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Advertise on Kiloneed</h3>
        <p className="text-sm text-muted-foreground">Promote your products, services, or needs to thousands of nearby users.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adOptions.map((ad) => (
          <Card key={ad.name} className="overflow-hidden hover:shadow-lg transition-all group">
            <div className={`h-1.5 w-full bg-gradient-to-r ${ad.color}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ad.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{ad.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">{ad.price}</Badge>
              </div>
              <CardDescription className="text-xs">{ad.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> Est. {ad.reach}
              </span>
              <Button size="sm" variant="outline" className="text-xs group-hover:gradient-blue group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                Create Ad <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No active campaigns. Create your first ad above!</p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────── Group Dues ───────────────────── */

const sampleGroups = [
  { name: "Lagos Tech Buyers", members: 1240, dues: "₦500/mo", status: "active" as const },
  { name: "Abuja Auto Market", members: 890, dues: "₦1,000/mo", status: "pending" as const },
  { name: "PH Real Estate Circle", members: 560, dues: "₦2,000/mo", status: "active" as const },
];

function GroupDuesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Group Dues</h3>
        <p className="text-sm text-muted-foreground">
          Special groups offer exclusive perks for members who contribute dues. Manage your memberships and payments here.
        </p>
      </div>

      <div className="space-y-3">
        {sampleGroups.map((g) => (
          <Card key={g.name} className="hover:shadow-md transition-all">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg gradient-blue flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.members.toLocaleString()} members</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">{g.dues}</p>
                  <Badge variant={g.status === "active" ? "default" : "secondary"} className="text-[10px]">
                    {g.status === "active" ? "Paid" : "Pending"}
                  </Badge>
                </div>
                <Button size="sm" variant={g.status === "active" ? "outline" : "default"} className={g.status !== "active" ? "gradient-blue text-primary-foreground" : ""}>
                  {g.status === "active" ? "Manage" : "Pay Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-primary/30">
        <CardContent className="flex items-center justify-center gap-2 py-5">
          <Plus className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Browse Special Groups</span>
        </CardContent>
      </Card>
    </div>
  );
}

/* ───────────────────── KiloAI ───────────────────── */

function KiloAISection() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm **KiloAI**. Paste or describe a need, and I'll help you interpret it — extracting key details like category, budget, location, and urgency so you can find the right match faster.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate AI response (will be replaced with real AI via Lovable Cloud)
    setTimeout(() => {
      const parsed = simulateAI(userMsg.content);
      setMessages((prev) => [...prev, { role: "assistant", content: parsed }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> KiloAI
        </h3>
        <p className="text-sm text-muted-foreground">AI-powered need interpreter. Paste any need and KiloAI will extract structured details.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "gradient-blue text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing need…
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Paste a need to interpret…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()} className="gradient-blue text-primary-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: FileText, label: "Extract Details", desc: "Category, budget, timeline" },
          { icon: MapPin, label: "Location Match", desc: "Find nearby sellers" },
          { icon: Clock, label: "Urgency Score", desc: "Priority ranking" },
        ].map((f) => (
          <Card key={f.label} className="hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
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
  const category = lower.includes("phone") || lower.includes("samsung") || lower.includes("iphone")
    ? "Electronics"
    : lower.includes("plumb") || lower.includes("electric") || lower.includes("repair")
    ? "Services"
    : lower.includes("car") || lower.includes("vehicle")
    ? "Automotive"
    : "General";

  const budgetMatch = text.match(/[₦$][\d,]+/g);
  const budget = budgetMatch ? budgetMatch.join(" – ") : "Not specified";

  const urgency = lower.includes("urgent") || lower.includes("asap") || lower.includes("today")
    ? "🔴 High"
    : lower.includes("weekend") || lower.includes("this week")
    ? "🟡 Medium"
    : "🟢 Normal";

  return `📋 **Need Analysis**\n\n🏷️ Category: ${category}\n💰 Budget: ${budget}\n⚡ Urgency: ${urgency}\n📍 Location: Detected from your profile\n\n💡 Tip: I found potential matches in your area. Post this need to get responses!`;
}

/* ───────────────────── Dashboard Page ───────────────────── */

const Dashboard = () => {
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
              <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your subscriptions, ads, groups, and AI tools.</p>
              </div>

              <Tabs defaultValue="subscriptions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 h-auto">
                  <TabsTrigger value="subscriptions" className="flex items-center gap-1.5 text-xs">
                    <CreditCard className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Subscriptions</span><span className="sm:hidden">Subs</span>
                  </TabsTrigger>
                  <TabsTrigger value="ads" className="flex items-center gap-1.5 text-xs">
                    <Megaphone className="h-3.5 w-3.5" /> Ads
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="flex items-center gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Group Dues</span><span className="sm:hidden">Groups</span>
                  </TabsTrigger>
                  <TabsTrigger value="kiloai" className="flex items-center gap-1.5 text-xs">
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
