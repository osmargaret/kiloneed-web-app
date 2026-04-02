import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, MessageCircle, User, Home, Star } from "lucide-react";

const navItems = [
  { label: "Home", href: "#", icon: Home },
  { label: "Featured", href: "#featured", icon: Star },
  { label: "Messages", href: "#", icon: MessageCircle },
  { label: "Profile", href: "#", icon: User },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="font-display text-2xl font-bold tracking-tight text-gradient-blue">
          KILONEED
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">
            Sign In
          </button>
          <a href="/feed" className="rounded-lg gradient-blue px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 shadow-glow">
            Get Started
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-foreground"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2 border-t border-border">
                <button className="flex-1 rounded-lg bg-secondary py-2.5 text-sm font-medium text-secondary-foreground">
                  Sign In
                </button>
                <button className="flex-1 rounded-lg gradient-blue py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
