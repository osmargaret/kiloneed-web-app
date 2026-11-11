import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  Users,
  UsersRound,
  Store,
  Megaphone,
  Crown,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  LogIn,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuthToken, clearAuthToken } from "@/services/apiClient";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const primaryNav: NavItem[] = [
  { label: "Feed / Needs", path: "/feed", icon: Home },
  { label: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Connections", path: "/connections", icon: Users },
  { label: "Trade Groups", path: "/groups", icon: UsersRound },
  { label: "My Business", path: "/my-business", icon: Store },
];

const secondaryNav: NavItem[] = [
  { label: "Sponsored Ads", path: "/ads", icon: Megaphone },
  { label: "Wallet & Plans", path: "/subscription", icon: Crown },
  { label: "Saved Needs", path: "/bookmarks", icon: Bookmark },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [userName, setUserName] = useState<string>("Guest User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(Boolean(token));
    if (token) {
      setUserName(localStorage.getItem("kiloneed_user_name") || "User");
      setUserEmail(localStorage.getItem("kiloneed_user_email") || "");
      setUserAvatar(localStorage.getItem("kiloneed_avatar") || "");
    }
  }, [location.pathname]);

  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "KN";

  const handleSignOut = () => {
    clearAuthToken();
    localStorage.removeItem("kiloneed_user_name");
    localStorage.removeItem("kiloneed_user_email");
    localStorage.removeItem("kiloneed_avatar");
    setIsLoggedIn(false);
    toast.success("Signed out successfully!");
    navigate("/signin");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-border bg-card/60 backdrop-blur-xl h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border">
        <button
          onClick={() => navigate("/feed")}
          className="flex items-center gap-2.5 group text-left"
        >
          <img
            src="/logo.png"
            alt="Kiloneed Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-black tracking-tight text-gradient-blue">
                KILONEED
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Web
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-none">
              What do you need?
            </p>
          </div>
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Primary Navigation (Moved from bottom bar to sidebar) */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path === "/marketplace" && location.pathname === "/market");
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Manage & Activity
          </div>
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Account Section */}
      <div className="p-3 border-t border-border space-y-2 bg-card/40">
        {isLoggedIn ? (
          <div
            onClick={() => navigate("/profile")}
            className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted cursor-pointer flex items-center justify-between transition-colors border border-border/50 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-9 h-9 shrink-0 ring-1 ring-primary/20">
                <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs truncate text-foreground">
                    {userName}
                  </span>
                  <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
                </div>
                <span className="text-[11px] text-muted-foreground truncate">
                  {userEmail || "View profile"}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In to Kiloneed</span>
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

