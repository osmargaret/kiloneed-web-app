import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { MobileDrawerMenu } from "./MobileDrawerMenu";
import { MobileBottomNav } from "./MobileBottomNav";

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

  // Gesture touch tracking
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

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Don't intercept touches inside horizontally scrollable containers or inputs
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

    // Must be a quick swipe, mostly horizontal (at least 65px and 1.5x vertical)
    if (deltaTime < 500 && Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX > 0) {
        // SWIPE RIGHT
        if (currentTabIdx > 0) {
          navigate(mainTabs[currentTabIdx - 1]);
        } else if (!isRootPage) {
          handleBack();
        }
      } else {
        // SWIPE LEFT
        if (currentTabIdx >= 0 && currentTabIdx < mainTabs.length - 1) {
          navigate(mainTabs[currentTabIdx + 1]);
        }
      }
    }
  };

  return (
    <div
      className="mobile-root"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header */}
      <header className="mobile-header">
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

          {/* Top Right Notification Bell */}
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
            {/* Unread indicator dot */}
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main
        className={`mobile-main ${
          hideBottomNav
            ? "h-[calc(100dvh-56px)] overflow-hidden flex flex-col"
            : shouldShowBottomNav
            ? "pb-nav"
            : "pb-6"
        }`}
      >
        {children}
      </main>

      {/* Bottom Nav on 5 Primary Tabs */}
      {shouldShowBottomNav && <MobileBottomNav />}
    </div>
  );
}
