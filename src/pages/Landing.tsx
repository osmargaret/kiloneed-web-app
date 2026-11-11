import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  UsersRound,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Sparkles,
  MessageCircle,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    const token = localStorage.getItem("kiloneed_token");
    if (token) {
      setIsLoggedIn(true);
    }
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#04060d] text-white relative overflow-x-hidden flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Background Radiant Orbs & Grid Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/15 blur-[100px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-cyan-500/15 blur-[100px] pointer-events-none -z-0" />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (Desktop & Mobile)
          ───────────────────────────────────────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-20">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <img
              src="./logo.png"
              alt="Kiloneed"
              className="w-10 h-10 object-contain rounded-xl border border-white/20 shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-wider text-white">
              KILONEED
            </span>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold px-1.5 py-0.5 hidden sm:inline-flex">
              WEB
            </Badge>
          </div>
        </div>

        {/* Center navigation links (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => navigate("/feed")}
            className="hover:text-white transition-colors"
          >
            Needs Feed
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className="hover:text-white transition-colors"
          >
            Marketplace
          </button>
          <button
            onClick={() => navigate("/groups")}
            className="hover:text-white transition-colors"
          >
            Trade Groups
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              onClick={() => navigate("/feed")}
              className="gradient-blue text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold px-5"
            >
              Go to App <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/signin")}
                className="text-slate-200 hover:text-white hover:bg-white/10 rounded-xl text-sm"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="gradient-blue text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold px-5 text-sm"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div
            className={`lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span>The Hyperlocal Needs & Trade Network</span>
            </div>

            {/* Mobile Logo Display (< md screens) */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <img
                src="./logo.png"
                alt="Kiloneed Logo"
                className="w-24 h-24 object-contain rounded-3xl shadow-[0_12px_32px_-8px_rgba(59,130,246,0.6)] border border-white/20 mb-3"
              />
              <h2 className="font-display font-black text-2xl tracking-wider text-white">
                KILONEED
              </h2>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-[1.1] mb-6 text-white">
              Every Need.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                Every Solution.
              </span>
              <br />
              <span className="text-slate-100 font-extrabold">
                Right Around You.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
              Post what you need in seconds and let verified local suppliers, neighbors, and service providers respond directly. Buy, sell, trade commodities, and join local trade circles without middlemen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <Button
                size="lg"
                onClick={() => navigate(isLoggedIn ? "/feed" : "/signup")}
                className="w-full sm:w-auto gradient-blue text-white rounded-2xl shadow-xl shadow-blue-500/25 font-bold px-8 h-13 text-base flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isLoggedIn ? "Open Dashboard" : "Get Started Free"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/marketplace")}
                className="w-full sm:w-auto rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-7 h-13 text-base cursor-pointer backdrop-blur-sm"
              >
                <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                Explore Marketplace
              </Button>
            </div>

            {/* Value Trust Bullets */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full max-w-lg">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-black text-white font-display">
                  100%
                </span>
                <span className="text-xs text-slate-400 mt-0.5">Free to join</span>
              </div>
              <div className="flex flex-col items-center lg:items-start border-x border-white/10 px-3">
                <span className="text-xl sm:text-2xl font-black text-blue-400 font-display">
                  Real-Time
                </span>
                <span className="text-xs text-slate-400 mt-0.5">Instant Chat</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
                  Verified
                </span>
                <span className="text-xs text-slate-400 mt-0.5">Trade Community</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Preview (Visible on Desktop & Tablet) */}
          <div
            className={`hidden lg:flex lg:col-span-5 relative justify-center transition-all duration-700 delay-200 ${
              loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            {/* Glow backdrop behind cards */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />

            <div className="w-full max-w-md space-y-4">
              {/* Card 1: Sample Need Post */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-sm">
                      CM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Clement Margaret
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Ikeja, Lagos · 9h left
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px]">
                    #Electronics
                  </Badge>
                </div>
                <p className="text-sm text-slate-200 font-medium mb-4">
                  i need a fan
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-blue-400" /> 1 offer received
                  </span>
                  <button
                    onClick={() => navigate("/feed")}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Respond →
                  </button>
                </div>
              </div>

              {/* Card 2: Sample Marketplace Item */}
              <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl shadow-2xl flex items-center gap-4 transform hover:-translate-y-1 transition-all duration-300">
                <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-slate-500">
                  👗
                </div>
                <div className="flex-1 min-w-0">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-[10px] mb-1">
                    For Rent
                  </Badge>
                  <h4 className="text-sm font-bold text-white truncate">
                    nice dress for sale
                  </h4>
                  <p className="text-sm font-extrabold text-blue-400">
                    ₦500
                  </p>
                </div>
                <button
                  onClick={() => navigate("/marketplace")}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  View
                </button>
              </div>

              {/* Card 3: Trade Group Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 backdrop-blur-xl shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Lagos Trade Network
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      1,240 active merchants
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. FEATURE PILLARS (Desktop Showcase)
          ───────────────────────────────────────────────────────────── */}
      <section className="hidden md:block w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Post What You Need
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Broadcast your exact request to nearby community members and receive instant solutions without endless searching.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Direct Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Discover trusted local products, items for rent, and verified sellers right in your immediate geographic radius.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
            <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <UsersRound className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Collaborative Trade Groups
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Join specialized commercial groups, pool cooperative dues, and unlock peer-to-peer business opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kiloneed Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/feed")} className="hover:text-slate-300">
              Needs Feed
            </button>
            <button onClick={() => navigate("/marketplace")} className="hover:text-slate-300">
              Marketplace
            </button>
            <button onClick={() => navigate("/signin")} className="hover:text-slate-300">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
