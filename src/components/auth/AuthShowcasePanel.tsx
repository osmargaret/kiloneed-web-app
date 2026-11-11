import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Package,
  ShoppingBag,
  UsersRound,
  MapPin,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuthShowcasePanelProps {
  mode?: "signup" | "signin";
}

export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({ mode = "signup" }) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-[#070b16] via-[#091024] to-[#04060c] border-r border-white/10 text-white">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Top Header: Logo + Back button */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group cursor-pointer text-left"
        >
          <img
            src="./logo.png"
            alt="Kiloneed"
            className="w-10 h-10 object-contain rounded-xl border border-white/20 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-wider text-white">
              KILONEED
            </span>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold px-1.5 py-0.5">
              WEB
            </Badge>
          </div>
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Center Body: Copy & Interactive Feature Previews */}
      <div className="my-auto py-8 space-y-8 max-w-xl relative z-10">
        {/* Sub-badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-inner">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span>The Hyperlocal Needs & Trade Network</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl xl:text-5xl font-black font-display tracking-tight leading-[1.15] text-white">
          {mode === "signup" ? (
            <>
              Join thousands of verified neighbors &amp; merchants.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                Every need has a solution.
              </span>
            </>
          ) : (
            <>
              Welcome back to your local marketplace.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
                Pick up right where you left off.
              </span>
            </>
          )}
        </h1>

        <p className="text-sm xl:text-base text-slate-300 leading-relaxed font-normal">
          Kiloneed connects you in real time with nearby service providers, buyers, sellers, and trade clusters across Nigeria.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Package className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Instant Need Broadcast</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Post what you need and get immediate responses.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Direct Marketplace</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Buy, sell, or rent with zero platform commissions.</p>
            </div>
          </div>
        </div>

        {/* Floating Preview Card: Sample Live Need */}
        <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-xs">
                CM
              </div>
              <div>
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Clement Margaret
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                </h5>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> Ikeja, Lagos · 9h left
                </p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px]">
              #Electronics
            </Badge>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            i need a fan
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <MessageCircle className="h-3 w-3" /> 1 offer received
            </span>
            <span className="text-slate-400">Verified Need</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Social Proof / Trust */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Verified Merchant Community</span>
        </div>
        <span>© {new Date().getFullYear()} Kiloneed Inc.</span>
      </div>
    </div>
  );
};

