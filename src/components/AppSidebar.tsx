import { Home, ShoppingBag, Users, UsersRound, Bookmark, Bell, MessageCircle, User, Settings, LogOut, Megaphone, Crown, Moon, Sun } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Needs", url: "/feed", icon: Home },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
  { title: "Connections", url: "/connections", icon: Users },
  { title: "Groups", url: "/groups", icon: UsersRound },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Messages", url: "/messages", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Ads", url: "/ads", icon: Megaphone },
  { title: "Subscription", url: "/subscription", icon: Crown },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Sign Out", url: "/", icon: LogOut },
];
function ThemeToggleButton({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  return (
    <SidebarMenuButton
      tooltip="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
    </SidebarMenuButton>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <a href="/feed" className="font-display text-xl font-bold tracking-tight text-gradient-blue">
          {collapsed ? "K" : "KILONEED"}
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggleButton collapsed={collapsed} />
          </SidebarMenuItem>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.title === "Sign Out" ? (
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => {
                    toast.success("Signed out successfully!");
                    window.location.href = "/";
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <NavLink
                    to={item.url}
                    end
                    className="hover:bg-muted/50"
                    activeClassName="bg-muted text-primary font-medium"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
