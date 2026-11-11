import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Camera, Video, Filter, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "electronics", label: "Electronics" },
    { id: "fashion", label: "Fashion" },
    { id: "home", label: "Home" },
    { id: "auto", label: "Auto" },
    { id: "services", label: "Services" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-40" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-gradient mb-4">
            KILONEED
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
            What do you need? Post it. Sellers find you. Connect locally.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
            <div className="relative flex items-center gradient-card rounded-2xl border border-border shadow-card p-1.5">
              <Search className="ml-3 sm:ml-4 h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Type what you need..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent px-2 sm:px-4 py-3 sm:py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base min-w-0"
              />
              <div className="flex items-center gap-1 sm:gap-1.5 pr-1 shrink-0">
                <button
                  onClick={() => navigate("/feed", { state: { openCreate: true, mediaType: "image" } })}
                  className="p-2 sm:p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Post Need with Image"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate("/feed", { state: { openCreate: true, mediaType: "video" } })}
                  className="hidden sm:block p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Post Need with Video"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button onClick={() => { if (query.trim()) { toast.success(`Searching for "${query}" in ${activeFilter === 'all' ? 'all categories' : activeFilter}...`); navigate("/feed"); } else { toast.info("Type what you need first!"); } }} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl gradient-blue text-primary-foreground font-semibold text-xs sm:text-sm shadow-glow hover:opacity-90 transition-opacity">
                  Search
                </button>
              </div>
            </div>

          <div className="flex items-center justify-start sm:justify-center gap-1.5 mt-3.5 overflow-x-auto scrollbar-hide py-1 px-1 -mx-2 sm:mx-auto max-w-xl">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 shrink-0 pl-1 mr-0.5">
              <Filter className="h-3 w-3" />
              <span>Filter:</span>
            </div>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-2.5 py-0.5 h-[26px] rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                  activeFilter === f.id
                    ? "gradient-blue text-primary-foreground border-transparent shadow-sm shadow-primary/20"
                    : "bg-secondary/70 text-muted-foreground border-border/50 hover:text-foreground hover:bg-secondary hover:border-border/80"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/feed", { state: { openFilters: true } })}
              className="flex items-center gap-1 px-2.5 py-0.5 h-[26px] rounded-full text-[11px] font-medium bg-secondary/70 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-secondary hover:border-border/80 transition-colors shrink-0"
            >
              <MapPin className="h-2.5 w-2.5" />
              <span>Location</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
