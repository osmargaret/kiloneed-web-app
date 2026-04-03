import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, AtSign, Star, UserPlus, Bell, ShoppingBag, Package,
  MessageCircle, Users, UsersRound, Shield, Coins, Wallet, CheckCircle,
  Clock, Circle
} from "lucide-react";

type NotificationType =
  | "mention" | "recommendation" | "follow"
  | "need_post" | "commodity_post"
  | "unread_message"
  | "connection_request" | "connection_accepted"
  | "group_request" | "group_accepted" | "group_role_change"
  | "special_group_invite" | "special_group_dues" | "special_group_disbursement"
  | "profile_approval";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  detail: string;
  from: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; label: string; category: string }> = {
  mention: { icon: AtSign, label: "Mention", category: "social" },
  recommendation: { icon: Star, label: "Recommendation", category: "social" },
  follow: { icon: UserPlus, label: "New Follower", category: "social" },
  need_post: { icon: Package, label: "Need Post", category: "posts" },
  commodity_post: { icon: ShoppingBag, label: "Commodity Post", category: "posts" },
  unread_message: { icon: MessageCircle, label: "Message", category: "messages" },
  connection_request: { icon: Users, label: "Connection Request", category: "connections" },
  connection_accepted: { icon: CheckCircle, label: "Connection Accepted", category: "connections" },
  group_request: { icon: UsersRound, label: "Group Join Request", category: "groups" },
  group_accepted: { icon: CheckCircle, label: "Group Accepted", category: "groups" },
  group_role_change: { icon: Shield, label: "Role Change", category: "groups" },
  special_group_invite: { icon: UsersRound, label: "Special Group Invite", category: "groups" },
  special_group_dues: { icon: Coins, label: "Dues Request", category: "groups" },
  special_group_disbursement: { icon: Wallet, label: "Disbursement", category: "groups" },
  profile_approval: { icon: CheckCircle, label: "Profile Approval", category: "account" },
};

const mockNotifications: Notification[] = [
  { id: "1", type: "mention", title: "Sarah Chen mentioned you", description: "in a conversation about 'Looking for a web developer'", detail: "Sarah Chen mentioned you in the thread for 'Looking for a web developer'. She wrote: \"@You could you share the project requirements document? I'd love to review the scope before we discuss pricing.\" You can reply directly from the Messages page to continue this conversation.", from: "Sarah Chen", time: "2m ago", read: false },
  { id: "2", type: "recommendation", title: "New recommendation received", description: "Mike Johnson recommended you as a verified seller", detail: "Mike Johnson has added a recommendation to your profile, endorsing you as a verified and trustworthy seller. This recommendation is now visible on your public profile under the Recommendations tab. Recommendations help build trust with potential buyers and connections. You currently have 24 total recommendations.", from: "Mike Johnson", time: "15m ago", read: false },
  { id: "3", type: "follow", title: "Emma Davis started following you", description: "She will receive notifications for your needs & commodities", detail: "Emma Davis has started following your profile. She opted to receive notifications for both your Needs and Commodities posts. This means whenever you publish a new need or list/update a commodity, Emma will be notified. You now have 156 followers. You can view Emma's profile from your Connections page.", from: "Emma Davis", time: "30m ago", read: false },
  { id: "4", type: "need_post", title: "Alex Turner posted a new need", description: "\"Bulk office supplies needed for new branch\"", detail: "Alex Turner, whom you follow, has posted a new need: 'Bulk office supplies needed for new branch'. The need includes desks, chairs, monitors, and stationery for 25 employees. Budget range: $15,000–$20,000. Location: Downtown Business District. This need expires on April 30, 2026. You can respond by visiting the need and starting a conversation with Alex.", from: "Alex Turner", time: "1h ago", read: true },
  { id: "5", type: "commodity_post", title: "Lisa Park updated a commodity", description: "\"Premium Wireless Headphones\" price reduced by 20%", detail: "Lisa Park, whom you follow for Commodity updates, has modified the listing for 'Premium Wireless Headphones'. The price has been reduced from $149.99 to $119.99 (20% off). Stock: 45 units remaining. This is a limited-time offer. Visit the Marketplace to view the full listing or message Lisa directly.", from: "Lisa Park", time: "2h ago", read: true },
  { id: "6", type: "unread_message", title: "3 unread messages", description: "from John Doe regarding 'Ergonomic Office Chair'", detail: "You have 3 unread messages from John Doe in the conversation thread for 'Ergonomic Office Chair'. Last message preview: \"Can you do bulk pricing for 50 units? We're furnishing a new office.\" Tap 'Go to Messages' below to read and reply.", from: "John Doe", time: "3h ago", read: false },
  { id: "7", type: "connection_request", title: "Tom Wilson wants to connect", description: "12 mutual connections · Lagos, Nigeria", detail: "Tom Wilson has sent you a connection request. Tom is a verified seller in the Electronics category based in Lagos, Nigeria. You share 12 mutual connections including Sarah Chen and Mike Johnson. Tom's profile has 18 recommendations and 3 mentions. You can accept or decline this request from the Connections page.", from: "Tom Wilson", time: "4h ago", read: false },
  { id: "8", type: "connection_accepted", title: "Grace Obi accepted your request", description: "You are now connected", detail: "Grace Obi has accepted your connection request. You are now connected and can message each other directly. Grace is a Business Consultant in the Professional Services category based in Abuja, Nigeria. Visit her profile to learn more about her services or start a conversation.", from: "Grace Obi", time: "5h ago", read: true },
  { id: "9", type: "group_request", title: "New join request for Tech Sellers Hub", description: "David Kim wants to join your group", detail: "David Kim has requested to join 'Tech Sellers Hub', a closed group where you are an Admin. David's profile: Electronics seller, 2 years on KiloNeed, 8 recommendations, based in your geofence area. The group currently has 342 members (max 1,000). As an admin, you can approve or decline this request from the Groups page.", from: "David Kim", time: "6h ago", read: false },
  { id: "10", type: "group_accepted", title: "Welcome to Lagos Entrepreneurs", description: "Your request to join has been approved", detail: "Your request to join 'Lagos Entrepreneurs' has been approved by the group admin. This is a Closed group with 567 members focused on business networking and opportunities in the Lagos area. You can now access group discussions, shared resources, and member directory. Group rules: Be respectful, no spam, business-related content only.", from: "Lagos Entrepreneurs", time: "8h ago", read: true },
  { id: "11", type: "group_role_change", title: "You are now a Moderator", description: "in 'Tech Sellers Hub' group", detail: "The admin of 'Tech Sellers Hub' has promoted you to Moderator. As a moderator, you can now: approve/decline join requests, remove members, pin important posts, and manage group content. Please review the group guidelines to ensure consistent moderation. Current group stats: 342 members, 12 posts this week.", from: "Tech Sellers Hub", time: "1d ago", read: true },
  { id: "12", type: "special_group_invite", title: "Invited to Premium Sellers Circle", description: "Special group · Monthly dues: ₦5,000", detail: "You have been invited to join 'Premium Sellers Circle', a Special (invite-only) group. Monthly dues: ₦5,000. This exclusive group provides premium networking, priority listing features, and shared marketing resources. Special group features: Multi-signature fund withdrawals (requires 3 member approvals), shared treasury for group marketing campaigns. Accept or decline from the Groups page.", from: "Premium Sellers Circle", time: "1d ago", read: false },
  { id: "13", type: "special_group_dues", title: "Dues payment reminder", description: "₦5,000 due for Premium Sellers Circle by Apr 5", detail: "Your monthly dues payment of ₦5,000 for 'Premium Sellers Circle' is due by April 5, 2026. Payment methods accepted: Card on file, bank transfer. Late payments may result in temporary suspension of group benefits. Your last payment was processed on March 5, 2026. Visit Transactions to make a payment.", from: "Premium Sellers Circle", time: "2d ago", read: true },
  { id: "14", type: "special_group_disbursement", title: "Fund disbursement approved", description: "₦150,000 from Premium Sellers Circle treasury", detail: "A fund withdrawal of ₦150,000 from the 'Premium Sellers Circle' treasury has been approved. This withdrawal received the required 3 member signatures: You, Admin Sarah Chen, and Moderator Mike Johnson. Purpose: Group marketing campaign for Q2 2026. The funds will be disbursed to the designated account within 2 business days. View details in Transactions.", from: "Premium Sellers Circle", time: "3d ago", read: true },
  { id: "15", type: "profile_approval", title: "Profile change approved", description: "Your profile name change has been approved", detail: "Your request to change your profile name from 'JohnDoe_Shop' to 'JohnDoe_Premium' has been approved after the mandatory 30-day review period. The change is now live on your public profile. Note: Further name changes will require another 30-day approval period. Other pending changes: Location update (15 days remaining), Category update (22 days remaining).", from: "KiloNeed System", time: "3d ago", read: true },
];

const categories = [
  { value: "all", label: "All" },
  { value: "social", label: "Social" },
  { value: "posts", label: "Posts" },
  { value: "messages", label: "Messages" },
  { value: "connections", label: "Connections" },
  { value: "groups", label: "Groups" },
  { value: "account", label: "Account" },
];

const Notifications = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const filtered = activeCategory === "all"
    ? notifications
    : notifications.filter(n => typeConfig[n.type].category === activeCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setSelectedNotification({ ...notif, read: true });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Detail view
  if (selectedNotification) {
    const cfg = typeConfig[selectedNotification.type];
    const Icon = cfg.icon;
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedNotification(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Notification</h1>
            </div>
            <ScrollArea className="flex-1">
              <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">{cfg.label}</Badge>
                    <h2 className="text-xl font-bold text-foreground">{selectedNotification.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> {selectedNotification.time}
                      <span className="text-muted-foreground/50">·</span>
                      From: {selectedNotification.from}
                    </p>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-foreground leading-relaxed whitespace-pre-line">
                      {selectedNotification.detail}
                    </p>
                  </CardContent>
                </Card>

                <Button variant="outline" onClick={() => setSelectedNotification(null)} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notifications
                </Button>
              </div>
            </ScrollArea>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // List view
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{unreadCount} new</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-muted-foreground">
                Mark all as read
              </Button>
            )}
          </div>

          <div className="p-3 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full flex overflow-x-auto">
                {categories.map(c => (
                  <TabsTrigger key={c.value} value={c.value} className="text-xs px-3">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-4">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-2">
                    {filtered.length === 0 && (
                      <p className="text-center text-muted-foreground py-12">No notifications in this category</p>
                    )}
                    {filtered.map(notif => {
                      const cfg = typeConfig[notif.type];
                      const Icon = cfg.icon;
                      return (
                        <Card
                          key={notif.id}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${!notif.read ? "border-l-4 border-l-primary" : ""}`}
                          onClick={() => handleOpen(notif)}
                        >
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm ${!notif.read ? "font-semibold text-foreground" : "text-foreground/80"} truncate`}>
                                  {notif.title}
                                </p>
                                {!notif.read && <Circle className="h-2.5 w-2.5 fill-primary text-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
