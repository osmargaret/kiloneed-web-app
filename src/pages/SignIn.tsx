import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, KeyRound } from "lucide-react";
import { authService } from "@/services/authService";
import { api } from "@/services/apiClient";

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
      const res = await api.post<{ otp_preview?: string; message?: string }>("/auth/forgot-password", {
        email: email.trim(),
      });
      setOtpSent(true);
      if (res?.otp_preview) {
        setOtpPreview(res.otp_preview);
        setOtpCode(res.otp_preview);
        toast.success(`Verification code: ${res.otp_preview}`);
      } else {
        toast.success(res?.message || `A 6-digit code has been sent to ${email.trim()}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to send the reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.error("Please enter the 6-digit code sent to your email");
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
      });
      toast.success("Password reset successfully. Please sign in with your new password.");
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
    <div className="auth-screen">
      <div className="auth-glow-orb auth-glow-top-left" />

      <div className="auth-form-page">
        {/* Header */}
        <div className="auth-form-header">
          <button className="auth-brand-small flex items-center gap-2" onClick={() => navigate("/")}>
            <img src="./logo.png" alt="Logo" className="w-6 h-6 object-contain rounded-lg" />
            <span>KILONEED</span>
          </button>
          <h2 className="auth-form-title">
            {forgotMode ? "Reset Password via OTP" : "Welcome Back"}
          </h2>
          <p className="auth-form-subtitle">
            {forgotMode
              ? "We'll send a 6-digit verification code to your registered email"
              : "Sign in to continue to your marketplace"}
          </p>
        </div>

        {!forgotMode ? (
          <>
            {/* Google button */}
            <button className="auth-google-btn" onClick={handleGoogleSignIn}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <span className="auth-divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  autoComplete="email"
                />
              </div>

              <div className="auth-input-group">
                <Lock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="auth-forgot-row">
                <button
                  type="button"
                  className="auth-link-accent text-xs"
                  onClick={() => {
                    setForgotMode(true);
                    setOtpSent(false);
                  }}
                >
                  Forgot password? Reset via Email OTP
                </button>
              </div>

              <button
                type="submit"
                className="auth-btn-primary auth-btn-full"
                disabled={loading}
              >
                {loading ? <span className="auth-spinner" /> : "Sign In"}
              </button>
            </form>
          </>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="auth-input-group">
              <Mail className="auth-input-icon" />
              <input
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary auth-btn-full"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Send 6-Digit Email OTP"}
            </button>

            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="auth-link-accent text-xs mt-2 block text-center w-full"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordWithOtp} className="auth-form">
            {otpPreview && (
              <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs text-center mb-2">
                Email OTP Preview: <strong className="font-mono text-sm">{otpPreview}</strong>
              </div>
            )}

            <div className="auth-input-group">
              <KeyRound className="auth-input-icon" />
              <input
                type="text"
                maxLength={6}
                required
                placeholder="6-Digit OTP Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="auth-input tracking-widest font-mono"
              />
            </div>

            <div className="auth-input-group">
              <Lock className="auth-input-icon" />
              <input
                type="password"
                required
                placeholder="New Password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary auth-btn-full"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Verify OTP & Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setOtpSent(false);
              }}
              className="auth-link-accent text-xs mt-2 block text-center w-full"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Footer link */}
        <p className="auth-form-footer">
          Don't have an account?{" "}
          <button className="auth-link-accent" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
