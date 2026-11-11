import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  /** Render on all screen sizes (defaults to mobile-only) */
  always?: boolean;
}

/**
 * Native-app style top bar for mobile screens.
 * Shows a back chevron, the page title and an optional right action slot.
 * Hidden on md+ screens by default so desktop keeps its own header.
 */
const AppHeader = ({ title, subtitle, right, onBack, always = false }: AppHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header
      className={`${always ? "" : "md:hidden"} sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-xl px-1.5`}
    >
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-accent"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 px-1">
        <h1 className="truncate font-display text-base font-bold leading-tight text-foreground sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-1 pr-1">{right}</div>}
    </header>
  );
};

export default AppHeader;
