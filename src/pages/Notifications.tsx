import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notificationsApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  AtSign,
  Star,
  UserPlus,
  Bell,
  BellOff,
  ShoppingBag,
  Package,
  MessageCircle,
  UsersRound,
  Shield,
  Coins,
  Wallet,
  CheckCircle,
  CheckCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Users,
} from "lucide-react";

type NotificationType =
  | "mention"
  | "recommendation"
  | "follow"
  | "need_post"
  | "commodity_post"
  | "unread_message"
  | "connection_request"
  | "connection_accepted"
  | "group_request"
  | "group_accepted"
  | "group_role_change"
  | "special_group_invite"
  | "special_group_dues"
  | "special_group_disbursement"
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

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; label: string; category: string; color: string }
> = {
  mention: { icon: AtSign, label: "Mention", category: "social", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  recommendation: { icon: Star, label: "Recommendation", category: "social", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  follow: { icon: UserPlus, label: "New Follower", category: "social", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  need_post: { icon: Package, label: "Need Post", category: "posts", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  commodity_post: { icon: ShoppingBag, label: "Marketplace", category: "posts", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  unread_message: { icon: MessageCircle, label: "Message", category: "messages", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  connection_request: { icon: Users, label: "Connection Request", category: "connections", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  connection_accepted: { icon: CheckCircle, label: "Connection Accepted", category: "connections", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  group_request: { icon: UsersRound, label: "Group Request", category: "groups", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  group_accepted: { icon: CheckCircle, label: "Group Accepted", category: "groups", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  group_role_change: { icon: Shield, label: "Role Change", category: "groups", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  special_group_invite: { icon: UsersRound, label: "Special Group Invite", category: "groups", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  special_group_dues: { icon: Coins, label: "Dues Request", category: "groups", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  special_group_disbursement: { icon: Wallet, label: "Disbursement", category: "groups", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  profile_approval: { icon: CheckCircle, label: "Profile Approved", category: "account", color: "text-primary bg-primary/10 border-primary/20" },
};

const categories = [
  { value: "all", label: "All", icon: Bell },
  { value: "messages", label: "Messages", icon: MessageCircle },
  { value: "posts", label: "Needs & Posts", icon: Package },
  { value: "connections", label: "Connections", icon: UserPlus },
  { value: "groups", label: "Groups", icon: UsersRound },
  { value: "social", label: "Social", icon: Star },
  { value: "account", label: "Account", icon: Shield },
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
  const navigate = useNavigate();
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
              : rn.type === "message"
              ? "unread_message"
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

  const filtered =
    activeCategory === "all"
      ? notifications
      : notifications.filter(
          (n) => (typeConfig[n.type]?.category || "social") === activeCategory
        );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (notif: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setSelectedNotification({ ...notif, read: true });
    if (/^\d+$/.test(String(notif.id))) {
      notificationsApiService.markAsRead(notif.id).catch(() => {});
    }
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (/^\d+$/.test(id)) {
      notificationsApiService.markAsRead(id).catch(() => {});
    }
    toast.success("Notification marked as read");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApiService.markAllAsRead().catch(() => {});
    toast.success("All notifications marked as read");
  };

  const handleAction = (notif: Notification) => {
    setSelectedNotification(null);
    if (notif.type === "unread_message") {
      navigate("/messages");
    } else if (notif.type === "connection_request" || notif.type === "connection_accepted") {
      navigate("/connections");
    } else if (notif.type === "need_post") {
      navigate("/feed");
    } else if (notif.type === "commodity_post") {
      navigate("/marketplace");
    } else if (
      notif.type === "group_request" ||
      notif.type === "group_accepted" ||
      notif.type === "special_group_invite"
    ) {
      navigate("/groups");
    }
  };

  // Detail view
  if (selectedNotification) {
    const cfg = typeConfig[selectedNotification.type] || typeConfig.mention;
    const Icon = cfg.icon;

    return (
      <MobileLayout
        title="Notification Details"
        showBack
        onBack={() => setSelectedNotification(null)}
      >
        <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-xs">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${cfg.color}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {cfg.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {selectedNotification.time}
                </span>
                <span className="text-xs text-muted-foreground">· From: {selectedNotification.from}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {selectedNotification.title}
              </h2>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line">
                {selectedNotification.detail || selectedNotification.description}
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedNotification(null)}
              className="w-full sm:w-auto flex-1 h-11 rounded-xl border-border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to notifications
            </Button>

            {selectedNotification.type === "unread_message" && (
              <Button
                className="w-full sm:w-auto flex-1 h-11 rounded-xl gradient-blue text-primary-foreground shadow-md"
                onClick={() => handleAction(selectedNotification)}
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Open Conversation
              </Button>
            )}

            {selectedNotification.type === "connection_request" && (
              <Button
                className="w-full sm:w-auto flex-1 h-11 rounded-xl gradient-blue text-primary-foreground shadow-md"
                onClick={() => {
                  toast.success("Connection request accepted!");
                  handleAction(selectedNotification);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" /> View Connection
              </Button>
            )}

            {(selectedNotification.type === "group_request" ||
              selectedNotification.type === "special_group_invite") && (
              <Button
                className="w-full sm:w-auto flex-1 h-11 rounded-xl gradient-blue text-primary-foreground shadow-md"
                onClick={() => {
                  toast.success("Group invite accepted!");
                  handleAction(selectedNotification);
                }}
              >
                <UsersRound className="h-4 w-4 mr-2" /> View Group
              </Button>
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Modern Main View
  return (
    <MobileLayout title="Notifications" notificationCount={unreadCount}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
                Notifications
              </h2>
              {unreadCount > 0 ? (
                <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5 rounded-full text-xs">
                  {unreadCount} unread
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  All caught up
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Stay updated on your needs, messages, marketplace listings, and connections.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="gap-2 text-xs h-9 rounded-xl border-border hover:bg-muted self-start sm:self-auto shrink-0 shadow-xs"
            >
              <CheckCheck className="h-4 w-4 text-primary" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Categories Pill Navigation Bar (Desktop & Mobile optimized) */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-card/90 border border-border/70 rounded-2xl w-max sm:w-full min-w-full sm:min-w-0 shadow-xs">
            {categories.map((c) => {
              const Icon = c.icon;
              const count =
                c.value === "all"
                  ? notifications.length
                  : notifications.filter(
                      (n) => (typeConfig[n.type]?.category || "social") === c.value
                    ).length;
              const isSelected = activeCategory === c.value;

              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setActiveCategory(c.value)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                  <span className="whitespace-nowrap">{c.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-muted-foreground/15 text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List or Empty State */}
        <div className="space-y-3 pt-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center border border-dashed border-border/70 rounded-3xl bg-card/30">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
                <BellOff className="h-8 w-8 sm:h-10 sm:w-10 opacity-80" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                No notifications in this category
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm">
                You're completely up to date! When you receive new messages, need responses, or trade activities, they will appear right here.
              </p>
              {activeCategory !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 rounded-xl border-border"
                  onClick={() => setActiveCategory("all")}
                >
                  Show All Notifications
                </Button>
              )}
            </div>
          ) : (
            filtered.map((notif) => {
              const cfg = typeConfig[notif.type] || typeConfig.mention;
              const Icon = cfg.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleOpen(notif)}
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 sm:gap-4 ${
                    !notif.read
                      ? "bg-card border-primary/35 shadow-sm hover:border-primary/60 hover:shadow-md"
                      : "bg-card/40 border-border/60 hover:bg-card hover:border-border hover:shadow-xs"
                  }`}
                >
                  {/* Category Themed Icon */}
                  <div
                    className={`h-11 w-11 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center shrink-0 border ${cfg.color}`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>

                  {/* Main Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium py-0 px-2 rounded-md bg-muted/40"
                        >
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
                        <span className="text-xs text-muted-foreground truncate">
                          From {notif.from}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                        {!notif.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20 animate-pulse" />
                        )}
                      </div>
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-semibold leading-snug mb-1 ${
                        !notif.read ? "text-foreground" : "text-foreground/85"
                      }`}
                    >
                      {notif.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.description}
                    </p>

                    {/* Quick action footer */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/40">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2.5 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                      >
                        View details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            markSingleAsRead(notif.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Notifications;
