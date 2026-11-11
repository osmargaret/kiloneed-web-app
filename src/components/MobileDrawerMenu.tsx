import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Menu, X, Bookmark, Megaphone, Crown, Bell,
  Settings, LogOut, Moon, Sun, ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// User-related and account items in the burger menu (My Profile is accessible via the top card)
const userNavItems = [
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
  { title: "My Ads", url: "/ads", icon: Megaphone },
  { title: "Subscription", url: "/subscription", icon: Crown },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileDrawerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [userName, setUserName] = useState("John Doe");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    if (open) {
      setUserName(localStorage.getItem("kiloneed_user_name") || "John Doe");
      setUserAvatar(localStorage.getItem("kiloneed_avatar") || "");
    }
  }, [open]);

  // Compute initials accurately: "John Doe" -> "JD"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "JD";

  const go = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  const signOut = () => {
    toast.success("Signed out successfully!");
    window.location.href = "/";
  };

  return (
    <>
      <button
        className="mobile-icon-btn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-backdrop"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="drawer"
            >
              {/* Drawer Header */}
              <div className="drawer-header">
                <div className="flex items-center gap-2">
                  <img src="./logo.png" alt="Logo" className="w-6 h-6 object-contain rounded-md" />
                  <span className="font-display text-xl font-bold text-gradient-blue">KILONEED</span>
                </div>
                <button
                  className="mobile-icon-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User profile card */}
              <div
                onClick={() => go("/profile")}
                className="mx-3 mt-3 mb-1 p-2.5 rounded-xl bg-muted/60 hover:bg-muted cursor-pointer flex items-center justify-between transition-colors border border-border/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-11 h-11 shrink-0 ring-1 ring-primary/30 shadow-xs">
                    <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate text-foreground">{userName}</span>
                    <span className="text-xs text-muted-foreground">View profile</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>

              {/* Nav Items */}
              <nav className="drawer-nav">
                <div className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Account & Menu
                </div>
                {userNavItems.map((item) => {
                  const active = location.pathname === item.url;
                  return (
                    <button
                      key={item.url}
                      onClick={() => go(item.url)}
                      className={`drawer-nav-item ${active ? "active" : ""}`}
                    >
                      <item.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`flex-1 text-left ${active ? "text-primary font-semibold" : ""}`}>{item.title}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </nav>

              {/* Footer - Elevated comfortably above bottom navigation bar */}
              <div className="drawer-footer">
                <button
                  className="drawer-nav-item"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark"
                    ? <Sun className="h-5 w-5 text-muted-foreground" />
                    : <Moon className="h-5 w-5 text-muted-foreground" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button
                  className="drawer-nav-item text-destructive hover:bg-destructive/10"
                  onClick={signOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
