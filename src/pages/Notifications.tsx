import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notificationsApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
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

const categories = [
  { value: "all", label: "All" },
  { value: "social", label: "Social" },
  { value: "posts", label: "Posts" },
  { value: "messages", label: "Messages" },
  { value: "connections", label: "Connections" },
  { value: "groups", label: "Groups" },
  { value: "account", label: "Account" },
];

const getInitialNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem("kiloneed_notifications");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
};

const Notifications = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(getInitialNotifications);

  useEffect(() => {
    notificationsApiService
      .getNotifications()
      .then((remoteNotifs) => {
        if (Array.isArray(remoteNotifs)) {
          const mapped: Notification[] = remoteNotifs.map((rn: any) => ({
            id: String(rn.id),
            type: (typeConfig[rn.type as NotificationType]
              ? rn.type
              : rn.type === "connection"
              ? "connection_accepted"
              : "mention") as NotificationType,
            title: rn.title,
            description: rn.description || rn.message || "",
            detail: rn.detail || rn.message || rn.description || "",
            from: rn.from || "Kiloneed",
            time: rn.time || "Just now",
            read: Boolean(rn.read),
          }));
          setNotifications((prev) => {
            const existingIds = new Set(mapped.map((m) => m.id));
            return [...mapped, ...prev.filter((p) => !existingIds.has(p.id))];
          });
        }
      })
      .catch(() => {});
  }, []);

  const filtered = activeCategory === "all"
    ? notifications
    : notifications.filter(n => (typeConfig[n.type]?.category || "social") === activeCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setSelectedNotification({ ...notif, read: true });
    if (/^\d+$/.test(String(notif.id))) {
      notificationsApiService.markAsRead(notif.id).catch(() => {});
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationsApiService.markAllAsRead().catch(() => {});
  };

  // Detail view
  if (selectedNotification) {
    const cfg = typeConfig[selectedNotification.type];
    const Icon = cfg.icon;
    return (
      <MobileLayout
        title="Notification"
        showBack
        onBack={() => setSelectedNotification(null)}
      >
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto p-4 space-y-6">
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedNotification(null)} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              {selectedNotification.type === "connection_request" && (
                <Button className="flex-1 gradient-blue text-primary-foreground" onClick={() => { toast.success("Connection accepted!"); setSelectedNotification(null); }}>
                  Accept
                </Button>
              )}
              {selectedNotification.type === "unread_message" && (
                <Button className="flex-1 gradient-blue text-primary-foreground" onClick={() => { toast.info("Opening messages..."); setSelectedNotification(null); }}>
                  Go to Messages
                </Button>
              )}
              {selectedNotification.type === "special_group_invite" && (
                <Button className="flex-1 gradient-blue text-primary-foreground" onClick={() => { toast.success("Group invite accepted!"); setSelectedNotification(null); }}>
                  Join Group
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </MobileLayout>
    );
  }

  // List view
  return (
    <MobileLayout
      title="Notifications"
      headerRight={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="text-xs text-muted-foreground px-2"
          >
            All read
          </button>
        ) : undefined
      }
    >
      <div className="p-3 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground">{unreadCount} new</Badge>
        )}
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="flex overflow-x-auto h-8 p-0.5 rounded-lg bg-muted/60 border border-border/50 gap-1 flex-nowrap scrollbar-hide w-max max-w-full">
                {categories.map(c => (
                  <TabsTrigger key={c.value} value={c.value} className="text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeCategory} className="mt-4">
                <ScrollArea className="h-[calc(100dvh-220px)]">
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
    </MobileLayout>
  );
};

export default Notifications;
