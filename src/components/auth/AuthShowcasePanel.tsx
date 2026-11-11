import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface AuthShowcasePanelProps {
  mode?: "signup" | "signin";
}

export const AuthShowcasePanel: React.FC<AuthShowcasePanelProps> = ({ mode = "signup" }) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#050814] text-white">
      {/* Soft Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Top Header: Minimal Brand */}
      <div className="flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img
            src="./logo.png"
            alt="Kiloneed"
            className="w-10 h-10 object-contain rounded-xl border border-white/15 shadow-md group-hover:scale-105 transition-transform"
          />
          <span className="font-display font-black text-xl tracking-wider text-white">
            KILONEED
          </span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Center Body: Clean, High-Impact Typography (Not Busy) */}
      <div className="my-auto py-12 max-w-lg space-y-6 relative z-10">
        <h1 className="text-4xl xl:text-5xl font-black font-display tracking-tight leading-[1.15] text-white">
          Every need.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
            Every solution.
          </span>
          <br />
          Right around you.
        </h1>

        <p className="text-base text-slate-400 leading-relaxed font-normal max-w-md">
          {mode === "signup"
            ? "Connect directly with local buyers, sellers, and verified service specialists across your community."
            : "Welcome back. Access your needs feed, messages, and trade marketplace in seconds."}
        </p>
      </div>

      {/* Bottom Minimal Trust Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-6 relative z-10">
        <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
        <span>Verified local trade network &middot; &copy; {new Date().getFullYear()} Kiloneed Inc.</span>
      </div>
    </div>
  );
};
