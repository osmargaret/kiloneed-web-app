import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackButtonHandler } from "@/components/BackButtonHandler";
import Landing from "./pages/Landing.tsx";
import SignUp from "./pages/SignUp.tsx";
import SignIn from "./pages/SignIn.tsx";
import Index from "./pages/Index.tsx";
import Feed from "./pages/Feed.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Groups from "./pages/Groups.tsx";
import Settings from "./pages/Settings.tsx";
import Ads from "./pages/Ads.tsx";
import Subscription from "./pages/Subscription.tsx";
import Connections from "./pages/Connections.tsx";
import PublicProfile from "./pages/PublicProfile.tsx";
import Profile from "./pages/Profile.tsx";
import Messages from "./pages/Messages.tsx";
import Notifications from "./pages/Notifications.tsx";
import Bookmarks from "./pages/Bookmarks.tsx";
import NotFound from "./pages/NotFound.tsx";
import RequireAuth from "./components/RequireAuth.tsx";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route element={<RequireAuth />}>
            <Route path="/settings" element={<Settings />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/transactions" element={<Subscription />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/connect" element={<Connections />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
