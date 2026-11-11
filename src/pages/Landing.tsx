import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="auth-screen">
      {/* Animated glow orb */}
      <div className="auth-glow-orb" />

      {/* Content */}
      <div className={`auth-landing-content ${loaded ? "auth-fade-in" : "auth-hidden"}`}>
        {/* Logo area */}
        <div className="auth-logo-area">
          <div className="relative">
            <img
              src="./logo.png"
              alt="Kiloneed Logo"
              className="w-28 h-28 object-contain rounded-3xl shadow-[0_16px_40px_-8px_rgba(59,130,246,0.5)] border border-white/15"
            />
          </div>
          <h1 className="auth-brand">KILONEED</h1>
        </div>

        {/* Tagline */}
        <p className="auth-tagline">
          Every need. Every solution.
          <br />
          <span className="auth-tagline-accent">Right around you.</span>
        </p>
      </div>

      {/* Bottom CTA area */}
      <div className={`auth-bottom-cta ${loaded ? "auth-slide-up" : "auth-hidden"}`}>
        <button
          className="auth-btn-primary"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>
        <button
          className="auth-btn-text"
          onClick={() => navigate("/signin")}
        >
          Already have an account? <span className="auth-link-accent">Sign In</span>
        </button>
      </div>
    </div>
  );
};

export default Landing;
