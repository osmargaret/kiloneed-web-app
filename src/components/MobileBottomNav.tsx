import { useLocation, useNavigate } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, Users, UsersRound } from "lucide-react";

const navItems = [
  { label: "Feed",     icon: Home,          path: "/feed" },
  { label: "Market",   icon: ShoppingBag,   path: "/marketplace" },
  { label: "Messages", icon: MessageCircle, path: "/messages" },
  { label: "Connect",  icon: Users,         path: "/connections" },
  { label: "Groups",   icon: UsersRound,    path: "/groups" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="mobile-bottom-nav md:hidden">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`mobile-nav-item ${active ? "active" : ""}`}
            aria-label={item.label}
          >
            <item.icon className={`mobile-nav-icon ${active ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`mobile-nav-label ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              {item.label}
            </span>
            {active && <span className="mobile-nav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
