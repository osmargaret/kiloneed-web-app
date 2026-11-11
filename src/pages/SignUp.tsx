import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Globe, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { authService } from "@/services/authService";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_STATE,
  DEFAULT_CITY,
  getStatesForCountry,
  getCitiesForState,
} from "@/config/cscData";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [state, setState] = useState(DEFAULT_STATE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(false);

  const availableStates = getStatesForCountry(country);
  const availableCities = getCitiesForState(country, state);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const states = getStatesForCountry(newCountry);
    if (states.length > 0) {
      setState(states[0].name);
      const cities = states[0].cities;
      setCity(cities.length > 0 ? cities[0] : "");
    } else {
      setState("");
      setCity("");
    }
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    const cities = getCitiesForState(country, newState);
    setCity(cities.length > 0 ? cities[0] : "");
  };

  const handleGoogleSignUp = () => {
    toast.info("Google sign-up is coming soon. Please register with your email.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredName = name.trim();
    const enteredEmail = email.trim();

    if (!enteredName || !enteredEmail) {
      toast.error("Enter your name and email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const formattedLoc = [city, state, country].filter(Boolean).join(", ");
      await authService.register({
        name: enteredName,
        email: enteredEmail,
        password,
        country,
        state,
        city,
        location: formattedLoc,
      });
      localStorage.setItem("kiloneed_country", country);
      localStorage.setItem("kiloneed_state", state);
      localStorage.setItem("kiloneed_city", city);
      localStorage.setItem("kiloneed_location", formattedLoc);

      toast.success(`Welcome to Kiloneed, ${enteredName}!`);
      navigate("/feed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#04060d] text-white flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* 1. Left Clean Brand Showcase (Desktop only) */}
      <AuthShowcasePanel mode="signup" />

      {/* 2. Right Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-10 lg:py-16 relative z-10 overflow-y-auto">
        <div className="w-full max-w-[420px] p-7 sm:p-9 rounded-3xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center sm:text-left mb-6">
            <button
              className="lg:hidden inline-flex items-center gap-2 mb-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img
                src="./logo.png"
                alt="Logo"
                className="w-7 h-7 object-contain rounded-lg border border-white/20"
              />
              <span className="font-display font-black text-lg tracking-wider text-white">
                KILONEED
              </span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join your local marketplace in seconds
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            onClick={handleGoogleSignUp}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Minimal Divider */}
          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">or</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="name"
              />
            </div>

            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="email"
              />
            </div>

            {/* Country Selector */}
            <div className="relative flex items-center">
              <Globe className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full h-11 pl-10 pr-8 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs sm:text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* State & City Cascading Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none z-10" />
                {availableStates.length > 0 ? (
                  <>
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full h-10 pl-8 pr-6 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      {availableStates.map((s) => (
                        <option key={s.name} value={s.name} className="bg-slate-900 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="State/Region"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 pl-8 pr-2.5 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder:text-slate-500 text-xs"
                  />
                )}
              </div>

              <div className="relative flex items-center">
                {availableCities.length > 0 ? (
                  <>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-10 px-3 pr-6 rounded-xl bg-slate-800/80 border border-white/10 text-white text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct} className="bg-slate-900 text-white">
                          {ct}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder:text-slate-500 text-xs"
                  />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 chars)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-white p-1"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl gradient-blue text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-1"
              disabled={loading}
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-slate-400 mt-5 pt-4 border-t border-white/10">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
