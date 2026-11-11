import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowRight } from "lucide-react";
import { authService } from "@/services/authService";
import { api } from "@/services/apiClient";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password / Email OTP State
  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in is coming soon. Please use your email and password.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);

    try {
      await authService.login({ email: email.trim(), password });
      toast.success("Welcome back!");
      navigate("/feed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email address of your account");
      return;
    }
    setLoading(true);

    try {
      const res: any = await api.post("/auth/forgot-password", { email: email.trim() });
      setOtpSent(true);
      if (res?.otp_preview) {
        setOtpPreview(res.otp_preview);
        toast.success(`Verification code sent! (Dev preview: ${res.otp_preview})`);
      } else {
        toast.success("6-digit verification code sent to your email!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      toast.error("Enter the complete 6-digit code");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        otp: otpCode.trim(),
        password: newPassword,
        password_confirmation: newPassword,
      });
      toast.success("Password reset successfully! You can now sign in.");
      setForgotMode(false);
      setOtpSent(false);
      setOtpCode("");
      setNewPassword("");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#04060d] text-white flex flex-col lg:flex-row relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT SHOWCASE PANEL (Desktop only, 55% width)
          ───────────────────────────────────────────────────────────── */}
      <AuthShowcasePanel mode="signin" />

      {/* ─────────────────────────────────────────────────────────────
          2. RIGHT AUTH FORM PANE (Desktop 45% / Mobile 100%)
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-center items-center px-4 sm:px-8 py-8 sm:py-12 relative z-10 overflow-y-auto">
        {/* Ambient glow behind right form */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-0" />

        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
          {/* Header */}
          <div className="text-center sm:text-left mb-6">
            <button
              className="inline-flex items-center gap-2 mb-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img
                src="./logo.png"
                alt="Logo"
                className="w-7 h-7 object-contain rounded-lg border border-white/20 group-hover:scale-105 transition-transform"
              />
              <span className="font-display font-black text-lg tracking-wider text-white">
                KILONEED
              </span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {forgotMode ? "Reset Password via OTP" : "Welcome Back"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {forgotMode
                ? "We'll send a 6-digit verification code to your email"
                : "Sign in to continue to your local needs and marketplace"}
            </p>
          </div>

          {!forgotMode ? (
            <>
              {/* Google button */}
              <button
                type="button"
                className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                onClick={handleGoogleSignIn}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">or with email</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-800/70 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="email"
                  />
                </div>

                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-800/70 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    autoComplete="current-password"
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

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      setForgotMode(true);
                      setOtpSent(false);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl gradient-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-800/70 border border-white/10 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl gradient-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send 6-Digit Verification Code"
                )}
              </button>

              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-xs text-slate-400 hover:text-white block text-center w-full pt-2"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordWithOtp} className="space-y-4">
              {otpPreview && (
                <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-center text-blue-200">
                  Verification Code Preview: <strong className="font-mono text-sm text-white">{otpPreview}</strong>
                </div>
              )}

              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6-Digit OTP Code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-800/70 border border-white/10 text-white text-xs sm:text-sm tracking-widest font-mono text-center focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="New Password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-800/70 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 text-slate-400 hover:text-white p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl gradient-blue text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Reset Password & Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setOtpSent(false);
                }}
                className="text-xs text-slate-400 hover:text-white block text-center w-full pt-2"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* Footer link */}
          <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-white/10">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1 cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
