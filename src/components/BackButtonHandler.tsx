import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Listens for the Android hardware back button and navigates back
 * through the app's history instead of exiting the app.
 * Gracefully no-ops in web browsers.
 */
export function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = App.addListener("backButton", ({ canGoBack }) => {
      // If we're on the landing page, minimise the app instead of exiting
      if (location.pathname === "/" || location.pathname === "/feed") {
        App.minimizeApp();
      } else if (canGoBack || window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback: go to feed
        navigate("/feed");
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, [navigate, location.pathname]);

  return null;
}
