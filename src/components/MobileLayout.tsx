import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { MobileDrawerMenu } from "./MobileDrawerMenu";
import { MobileBottomNav } from "./MobileBottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

interface MobileLayoutProps {
  title: string;
  /** Force show back arrow instead of hamburger */
  showBack?: boolean;
  onBack?: () => void;
  /** Extra element to the right of the title (e.g. action button) */
  headerRight?: React.ReactNode;
  /** Force hide bottom nav (e.g. full-screen chat) */
  hideBottomNav?: boolean;
  children: React.ReactNode;
}

// 5 Core Primary Tabs in the Bottom Navigation Bar
const mainTabs = ["/feed", "/marketplace", "/messages", "/connections", "/groups"];

export function MobileLayout({
  title,
  showBack,
  onBack,
  headerRight,
  hideBottomNav,
  children,
}: MobileLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMainTab = mainTabs.includes(location.pathname);
  const isRootPage = location.pathname === "/feed" || location.pathname === "/";
  const currentTabIdx = mainTabs.indexOf(location.pathname);

  // Show back button on sub-pages or when explicitly requested
  const shouldShowBack = showBack !== undefined ? showBack : !isMainTab;
  // Keep bottom nav on all pages unless explicitly hidden (e.g. full-screen chat)
  const shouldShowBottomNav = !hideBottomNav;

  // Gesture touch tracking for mobile
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/feed");
    }
  };

  // Swipe gesture handlers (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".overflow-x-auto, .scroll-snap-x, input, textarea, [data-no-swipe]")) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartRef.current.x;
    const deltaY = endY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    if (deltaTime < 500 && Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX > 0) {
        if (currentTabIdx > 0) {
          navigate(mainTabs[currentTabIdx - 1]);
        } else if (!isRootPage) {
          handleBack();
        }
      } else {
        if (currentTabIdx >= 0 && currentTabIdx < mainTabs.length - 1) {
          navigate(mainTabs[currentTabIdx + 1]);
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* 1. Desktop Left Sidebar (Visible on md+ screens, hidden on mobile) */}
      <DesktopSidebar />

      {/* 2. Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Top Header (Visible only on < md screens) */}
        <header className="mobile-header md:hidden">
          <div className="mobile-header-left">
            {shouldShowBack ? (
              <button
                className="mobile-icon-btn text-foreground shrink-0 hover:bg-muted"
                onClick={handleBack}
                aria-label="Go back"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="shrink-0">
                <MobileDrawerMenu />
              </div>
            )}

            <span className="mobile-header-title">{title}</span>
          </div>

          <div className="mobile-header-right flex items-center gap-1">
            {headerRight}

            <button
              className={`mobile-icon-btn relative transition-colors ${
                location.pathname === "/notifications"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </button>
          </div>
        </header>

        {/* Desktop Top Header (Visible on md+ screens) */}
        <header className="hidden md:flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/60 backdrop-blur-xl px-6 lg:px-8 z-30">
          <div className="flex items-center gap-3">
            {shouldShowBack && (
              <button
                onClick={handleBack}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {headerRight}

            <button
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors relative ${
                location.pathname === "/notifications"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </button>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            hideBottomNav ? "overflow-hidden flex flex-col" : ""
          } md:p-6 lg:p-8`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full max-w-5xl mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Hidden completely on md+ screens) */}
        {shouldShowBottomNav && (
          <div className="md:hidden">
            <MobileBottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
