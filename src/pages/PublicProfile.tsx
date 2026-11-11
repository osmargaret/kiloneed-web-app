import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import {
  ArrowLeft, UserPlus, Bell, ThumbsUp, AtSign, AlertTriangle,
  ShoppingBag, Home, Users, Star, UsersRound, MapPin, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const currentUserName = localStorage.getItem("kiloneed_user_name") || "Merchant";
  const userLocation = localStorage.getItem("kiloneed_location") || "Lagos, Nigeria";

  const profile = {
    name: id ? `Merchant #${id}` : currentUserName,
    avatar: (id ? "M" : currentUserName.slice(0, 2)).toUpperCase(),
    location: userLocation,
    category: "Electronics",
    recommendations: 0,
    mentions: 0,
    abuseReports: 0,
    privacy: { needs: true, commodities: true, connections: true, groups: true },
    advertiseFollow: true,
  };

  const [followOpen, setFollowOpen] = useState(false);
  const [following, setFollowing] = useState<{ needs: boolean; commodities: boolean }>({ needs: false, commodities: false });

  const stats = [
    { icon: ThumbsUp, label: "Recos", value: profile.recommendations },
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
    <MobileLayout title={profile.name || "Profile"} showBack>
      <div className="bg-gradient-to-r from-primary/20 to-accent/30 p-4 sm:p-6 md:p-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
              {profile.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{profile.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {profile.location}
            </p>
            <Badge variant="secondary" className="mt-2">{profile.category}</Badge>
            <div className="flex gap-4 sm:gap-6 mt-3 sm:mt-4 justify-center sm:justify-start">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-base sm:text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col shrink-0">
            <Button
              size="sm"
              onClick={() => toast.success("Connection request sent")}
              className="text-xs gradient-blue text-primary-foreground"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Connect
            </Button>
            {profile.advertiseFollow && (
              <Popover open={followOpen} onOpenChange={setFollowOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Bell className="h-3.5 w-3.5 mr-1" />
                    Follow <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <button
                    className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors ${
                      following.needs ? "text-primary font-medium" : "text-foreground"
                    }`}
                    onClick={() => {
                      setFollowing((f) => ({ ...f, needs: !f.needs }));
                      toast.success(following.needs ? "Unfollowed needs" : "Following needs");
                    }}
                  >
                    <Home className="h-3.5 w-3.5" />
                    Needs {following.needs && <Badge className="ml-auto text-[9px]">✓</Badge>}
                  </button>
                  <button
                    className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors ${
                      following.commodities ? "text-primary font-medium" : "text-foreground"
                    }`}
                    onClick={() => {
                      setFollowing((f) => ({ ...f, commodities: !f.commodities }));
                      toast.success(following.commodities ? "Unfollowed items" : "Following items");
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Commodities {following.commodities && <Badge className="ml-auto text-[9px]">✓</Badge>}
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        <Tabs defaultValue={visibleTabs[0] || "needs"} className="space-y-4">
          <div className="overflow-x-auto -mx-3 px-3">
            <TabsList className="flex w-max gap-1 h-auto p-1">
              {visibleTabs.includes("needs") && (
                <TabsTrigger value="needs" className="text-xs px-2">
                  <Home className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Needs</span>
                </TabsTrigger>
              )}
              {visibleTabs.includes("commodities") && (
                <TabsTrigger value="commodities" className="text-xs px-2">
                  <ShoppingBag className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Items</span>
                </TabsTrigger>
              )}
              {visibleTabs.includes("connections") && (
                <TabsTrigger value="connections" className="text-xs px-2">
                  <Users className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Connections</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="recommendations" className="text-xs px-2">
                <Star className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Recos</span>
              </TabsTrigger>
              <TabsTrigger value="mentions" className="text-xs px-2">
                <AtSign className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Mentions</span>
              </TabsTrigger>
              {visibleTabs.includes("groups") && (
                <TabsTrigger value="groups" className="text-xs px-2">
                  <UsersRound className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Groups</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="needs" className="space-y-3">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No active needs posted by this merchant.</p>
            </div>
          </TabsContent>

          <TabsContent value="commodities">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No inventory listings published yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-3">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No mutual connections found.</p>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No peer recommendations yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="mentions" className="space-y-3">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No mentions recorded yet.</p>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-3">
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-card/40">
              <p className="text-xs text-muted-foreground">No public groups joined.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}
