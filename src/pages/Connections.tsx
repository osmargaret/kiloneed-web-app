import { useState, useEffect } from "react";
import { connectionsApiService } from "@/services/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Clock,
  X,
  MapPin,
  Sparkles,
  Send,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConnectionRequest {
  id: number;
  name: string;
  avatar: string;
  avatarUrl?: string;
  mutualConnections: number;
  location?: string;
  requestAge?: string;
}

interface ConnectionSuggestion {
  id: number;
  name: string;
  avatar: string;
  avatarUrl?: string;
  mutualConnections: number;
  location: string;
  category: string;
}

interface Connection {
  id: number;
  name: string;
  avatar: string;
  avatarUrl?: string;
  mutualConnections: number;
  location: string;
  connectedSince: string;
}

type TabType = "my" | "received" | "suggestions" | "sent";

const cardVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.25 } }),
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export default function Connections() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [received, setReceived] = useState<ConnectionRequest[]>([]);
  const [sent, setSent] = useState<ConnectionRequest[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    connectionsApiService
      .getConnections()
      .then((remoteConns) => {
        if (Array.isArray(remoteConns) && remoteConns.length > 0) {
          const mapped = remoteConns.map((u: any) => ({
            id: u.id,
            name: u.name,
            avatar: (u.name || "KN").slice(0, 2).toUpperCase(),
            avatarUrl: u.avatar,
            mutualConnections: 8,
            location: u.location || "Lagos",
            connectedSince: "Verified Partner",
          }));
          setConnections(mapped);
        }
      })
      .catch(() => {});

        connectionsApiService
      .getPending()
      .then((remotePending) => {
        if (Array.isArray(remotePending)) {
          const mapped = remotePending.map((u: any) => ({
            id: u.id,
            name: u.name,
            avatar: (u.name || "KN").slice(0, 2).toUpperCase(),
            avatarUrl: u.avatar,
            mutualConnections: 0,
          }));
          setReceived(mapped);
        }
      })
      .catch(() => {});

    connectionsApiService
      .getSuggestions()
      .then((remoteSugs) => {
        if (Array.isArray(remoteSugs) && remoteSugs.length > 0) {
          const mapped = remoteSugs.map((u: any) => ({
            id: u.id,
            name: u.name,
            avatar: (u.name || "KN").slice(0, 2).toUpperCase(),
            avatarUrl: u.avatar,
            mutualConnections: 6,
            location: u.location || "Lagos",
            category: u.industry || "Electronics",
          }));
          setSuggestions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const accept = (id: number) => {
    const item = received.find((r) => r.id === id);
    if (item) {
      setReceived((r) => r.filter((x) => x.id !== id));
      setConnections((prev) => [
        {
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          avatarUrl: item.avatarUrl,
          mutualConnections: item.mutualConnections,
          location: "Lagos",
          connectedSince: "Just now",
        },
        ...prev,
      ]);
      connectionsApiService.acceptRequest(id).catch(() => {});
      toast.success(`Connected with ${item.name}!`);
    }
  };

  const decline = (id: number) => {
    setReceived((r) => r.filter((x) => x.id !== id));
    connectionsApiService.declineRequest(id).catch(() => {});
    toast.info("Request declined");
  };

  const cancelSent = (id: number) => {
    setSent((s) => s.filter((x) => x.id !== id));
    toast.info("Request cancelled");
  };

  const connect = (id: number) => {
    const sug = suggestions.find((s) => s.id === id);
    if (sug) {
      setSuggestions((s) => s.filter((x) => x.id !== id));
      setSent((prev) => [
        {
          id: sug.id,
          name: sug.name,
          avatar: sug.avatar,
          avatarUrl: sug.avatarUrl,
          mutualConnections: sug.mutualConnections,
          requestAge: "Just now",
        },
        ...prev,
      ]);
      connectionsApiService.sendRequest(id).catch(() => {});
      toast.success(`Connection request sent to ${sug.name}!`);
    }
  };

  const removeSuggestion = (id: number) => {
    setSuggestions((s) => s.filter((x) => x.id !== id));
  };

  const filteredConnections = connections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goToProfile = (id: number) => navigate(`/profile/${id}`);

  const tabItems: { id: TabType; label: string; icon: any; count?: number; badgeVariant?: "destructive" | "primary" | "muted" }[] = [
    {
      id: "my",
      label: "My List",
      icon: Users,
      count: connections.length,
    },
    {
      id: "received",
      label: "Received",
      icon: UserCheck,
      count: received.length,
      badgeVariant: "destructive",
    },
    {
      id: "suggestions",
      label: "Suggest",
      icon: Sparkles,
      count: suggestions.length,
    },
    {
      id: "sent",
      label: "Sent",
      icon: Clock,
      count: sent.length,
    },
  ];

  return (
    <MobileLayout title="Connections">
      <div className="p-3 sm:p-4 max-w-2xl mx-auto w-full space-y-3 pb-24">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search connections by name or city..."
            className="pl-8.5 h-8 text-xs rounded-lg bg-card border-border/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ─── Compact 4-Tab Control Bar ─── */}
        <div className="flex items-center gap-0.5 p-0.5 bg-muted/60 dark:bg-card/70 rounded-lg border border-border/60 backdrop-blur-sm overflow-x-auto scrollbar-none">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 min-w-max py-1 px-2 rounded-md text-[10px] font-medium flex items-center justify-center gap-1 transition-all select-none whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <tab.icon className="w-2.5 h-2.5 shrink-0" />
                <span className="whitespace-nowrap font-medium text-[10px]">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1 py-0.2 rounded-full text-[9px] font-bold shrink-0 leading-none",
                      isActive
                        ? "bg-white text-primary dark:bg-black dark:text-primary-foreground"
                        : tab.badgeVariant === "destructive"
                        ? "bg-red-500 text-white"
                        : "bg-muted-foreground/20 text-foreground border border-border/50"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="pt-0.5">
          {/* 1. My List / Connections */}
          {activeTab === "my" && (
            <div className="space-y-2">
              {filteredConnections.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl bg-card border border-border/50">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1.5" />
                  <p className="text-xs font-semibold text-foreground">No connections found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Connect with merchants and peers in your area to grow your trade network.
                  </p>
                </div>
              ) : (
                filteredConnections.map((c, i) => (
                  <motion.div key={c.id} custom={i} variants={cardVariant} initial="hidden" animate="visible">
                    <Card className="hover:border-primary/40 transition-colors shadow-xs">
                      <CardContent className="flex items-center gap-2.5 p-2.5">
                        <Avatar
                          className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer shrink-0 ring-1 ring-border shadow-xs"
                          onClick={() => goToProfile(c.id)}
                        >
                          <AvatarImage src={c.avatarUrl} alt={c.name} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                            {c.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-foreground text-xs sm:text-sm cursor-pointer hover:underline truncate"
                            onClick={() => goToProfile(c.id)}
                          >
                            {c.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 truncate">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {c.location}
                            </span>
                            <span>•</span>
                            <span>{c.mutualConnections} mutual</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6.5 text-[10px] px-2.5 rounded-lg border-border shrink-0 hover:bg-muted font-medium"
                          onClick={() => goToProfile(c.id)}
                        >
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* 2. Received Requests */}
          {activeTab === "received" && (
            <div className="space-y-2">
              <AnimatePresence>
                {received.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-xl bg-card border border-border/50">
                    <UserCheck className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">No pending requests</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      When other merchants want to link with you, requests will appear here.
                    </p>
                  </div>
                ) : (
                  received.map((r, i) => (
                    <motion.div key={r.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:border-primary/40 transition-colors shadow-xs">
                        <CardContent className="flex items-center gap-2.5 p-2.5">
                          <Avatar
                            className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer shrink-0 ring-1 ring-border shadow-xs"
                            onClick={() => goToProfile(r.id)}
                          >
                            <AvatarImage src={r.avatarUrl} alt={r.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                              {r.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-foreground text-xs sm:text-sm cursor-pointer hover:underline truncate"
                              onClick={() => goToProfile(r.id)}
                            >
                              {r.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Users className="h-2.5 w-2.5 shrink-0" />
                              {r.mutualConnections} mutual connections
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              className="h-6.5 px-2.5 text-[10px] rounded-lg gradient-blue text-primary-foreground font-medium shadow-xs"
                              onClick={() => accept(r.id)}
                            >
                              <Check className="h-3 w-3 mr-0.5" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6.5 w-6.5 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => decline(r.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 3. Suggestions */}
          {activeTab === "suggestions" && (
            <div className="grid gap-2 grid-cols-2">
              <AnimatePresence>
                {suggestions.length === 0 ? (
                  <div className="col-span-2 text-center py-10 px-4 rounded-xl bg-card border border-border/50">
                    <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">All caught up!</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Check back later for new peer recommendations.</p>
                  </div>
                ) : (
                  suggestions.map((s, i) => (
                    <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:border-primary/40 transition-colors shadow-xs h-full">
                        <CardContent className="flex flex-col items-center text-center p-2.5 sm:p-3 h-full justify-between gap-2">
                          <Avatar
                            className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer ring-1 ring-primary/20 shadow-xs"
                            onClick={() => goToProfile(s.id)}
                          >
                            <AvatarImage src={s.avatarUrl} alt={s.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {s.avatar}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 w-full space-y-0.5">
                            <p
                              className="font-semibold text-foreground text-xs cursor-pointer hover:underline truncate"
                              onClick={() => goToProfile(s.id)}
                            >
                              {s.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {s.location}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {s.mutualConnections} mutual
                            </p>
                            <Badge variant="secondary" className="mt-0.5 text-[8px] px-1 py-0">
                              {s.category}
                            </Badge>
                          </div>

                          <div className="flex gap-1 w-full pt-0.5">
                            <Button
                              size="sm"
                              className="flex-1 h-6 text-[10px] rounded-lg gradient-blue text-primary-foreground font-medium"
                              onClick={() => connect(s.id)}
                            >
                              <UserPlus className="h-2.5 w-2.5 mr-0.5" />
                              Connect
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:bg-muted"
                              onClick={() => removeSuggestion(s.id)}
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 4. Sent Requests */}
          {activeTab === "sent" && (
            <div className="space-y-2">
              <AnimatePresence>
                {sent.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-xl bg-card border border-border/50">
                    <Send className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">No outgoing requests</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Invitations you send to peers will appear here until they accept.
                    </p>
                  </div>
                ) : (
                  sent.map((s, i) => (
                    <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:border-primary/40 transition-colors shadow-xs">
                        <CardContent className="flex items-center gap-2.5 p-2.5">
                          <Avatar
                            className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer shrink-0 ring-1 ring-border shadow-xs"
                            onClick={() => goToProfile(s.id)}
                          >
                            <AvatarImage src={s.avatarUrl} alt={s.name} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                              {s.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-foreground text-xs sm:text-sm cursor-pointer hover:underline truncate"
                              onClick={() => goToProfile(s.id)}
                            >
                              {s.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                              <span>{s.mutualConnections} mutual</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                {s.requestAge}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6.5 text-[10px] px-2 rounded-lg text-destructive hover:bg-destructive/10 shrink-0 font-medium"
                            onClick={() => cancelSent(s.id)}
                          >
                            <UserX className="h-3 w-3 sm:mr-0.5" />
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>
    </MobileLayout>
  );
}