import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { CreatePost } from "@/components/CreatePost";
import { FeedPost } from "@/components/FeedPost";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  ArrowDown,
  ArrowUp,
  Loader2,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Need } from "@/types/need";
import { needsStore } from "@/services/needsStore";
import {
  COUNTRIES,
  getStatesForCountry,
  getCitiesForState,
} from "@/config/cscData";

export const Feed = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  // CSC Location Filter: Country, State, City (Default: All)
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (location.state?.openFilters) {
      setShowFilters(true);
    }
  }, [location.state]);

  const availableStates = selectedCountry !== "All" ? getStatesForCountry(selectedCountry) : [];
  const availableCities =
    selectedCountry !== "All" && selectedState !== "All"
      ? getCitiesForState(selectedCountry, selectedState)
      : [];

  const [page, setPage] = useState(1);
  const [pageSize] = useState(4); // Load 4 items per batch for smooth infinite scrolling
  const [displayedNeeds, setDisplayedNeeds] = useState<Need[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const feedBottomRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const activeFiltersCount =
    (selectedCountry !== "All" ? 1 : 0) +
    (selectedState !== "All" ? 1 : 0) +
    (selectedCity !== "All" ? 1 : 0);

  // Load needs from store based on current criteria
  const loadNeeds = useCallback(
    (currentPage: number = 1, append: boolean = false) => {
      const result = needsStore.getNeeds({
        searchQuery,
        category: "all",
        type: "all",
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        ignoreGeofence: true,
        ignoreIndustry: true,
        page: currentPage,
        pageSize,
      });

      if (append) {
        setDisplayedNeeds(result.needs);
      } else {
        setDisplayedNeeds(result.needs);
      }
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    },
    [searchQuery, selectedCountry, selectedState, selectedCity, pageSize]
  );

  // Initial backend sync on component mount
  useEffect(() => {
    needsStore.syncWithBackend().then(() => {
      loadNeeds(1, false);
    }).catch(() => {});
  }, [loadNeeds]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setPage(1);
    loadNeeds(1, false);
  }, [searchQuery, selectedCountry, selectedState, selectedCity, loadNeeds]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setPage((prevPage) => {
              const nextPage = prevPage + 1;
              loadNeeds(nextPage, true);
              return nextPage;
            });
            setIsLoadingMore(false);
          }, 600); // Realistic network delay simulation
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadNeeds]);

  const handleNewPost = (postData: any) => {
    needsStore.addNeed(postData);
    loadNeeds(1, false);
    toast.success("Need posted! Your need is now live at the top of the feed.");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  };

  const resetFilters = () => {
    setSelectedCountry("All");
    setSelectedState("All");
    setSelectedCity("All");
    setSearchQuery("");
    toast.success("Location filter reset to All");
  };

  const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const scrollToBottom = () => {
    feedBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MobileLayout title="KILONEED">
      <div className="space-y-3 px-3 py-3 max-w-2xl mx-auto w-full pb-20">
        
        {/* ─── Search & Quick Filters Header ─── */}
        <div className="space-y-2">
          {/* Keyword Search Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search needs by keyword, title, description, or alt..."
                className="pl-10 pr-9 h-10 text-xs sm:text-sm rounded-2xl bg-card border-border shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 rounded-2xl shrink-0 relative transition-all ${
                showFilters || activeFiltersCount > 0
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border"
              }`}
              title="Filter by Distance"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Quick Filter Pills Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {/* CSC Location Filter Quick Pill */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg border text-[11px] font-medium shrink-0 transition-all ${
                  activeFiltersCount > 0
                    ? "bg-primary/10 border-primary text-primary font-semibold"
                    : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="Filter by Country, State, City"
              >
                <Globe className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate max-w-[170px]">
                  {selectedCity !== "All"
                    ? `${selectedCity}, ${selectedState}`
                    : selectedState !== "All"
                    ? `${selectedState}, ${selectedCountry}`
                    : selectedCountry !== "All"
                    ? selectedCountry
                    : "Worldwide (All)"}
                </span>
                <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
              </button>

              {/* Reset Pill */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 h-7 px-2 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-[11px] font-semibold shrink-0 hover:bg-destructive/20 transition-colors"
                  title="Reset to All"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Jump to latest (top) button */}
            <button
              onClick={scrollToTop}
              className="text-primary hover:underline font-semibold flex items-center gap-1 shrink-0 text-[11px] ml-auto cursor-pointer"
              title="Jump to latest needs at the top"
            >
              <ArrowUp className="h-3 w-3" />
              <span className="whitespace-nowrap">Latest needs</span>
            </button>
          </div>

          {/* Expandable CSC Location Filter Sheet */}
          {showFilters && (
            <div className="p-3 rounded-xl bg-card border border-border shadow-card space-y-3 animate-in fade-in duration-200">
              
              {/* Header inside filter sheet */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Location Filter (Country, State, City)</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* CSC Selectors */}
              <div className="space-y-2.5">
                {/* 1. Country Selection */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Country (Global)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        const newC = e.target.value;
                        setSelectedCountry(newC);
                        setSelectedState("All");
                        setSelectedCity("All");
                      }}
                      className="w-full h-8 px-2.5 pr-8 rounded-lg bg-secondary/80 border border-border text-xs text-foreground font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">🌐 Worldwide (All Countries)</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* 2. State & City Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                      State / Region
                    </label>
                    <div className="relative">
                      <select
                        value={selectedState}
                        disabled={selectedCountry === "All"}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedCity("All");
                        }}
                        className="w-full h-8 px-2 pr-7 rounded-lg bg-secondary/80 border border-border text-xs text-foreground font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All States</option>
                        {availableStates.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                      City
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCity}
                        disabled={selectedState === "All"}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full h-8 px-2 pr-7 rounded-lg bg-secondary/80 border border-border text-xs text-foreground font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Cities</option>
                        {availableCities.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Done button */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {totalCount} {totalCount === 1 ? "need matches" : "needs match"} this location
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="gradient-blue text-primary-foreground text-[11px] font-semibold h-7 rounded-lg px-3"
                >
                  Apply & Close
                </Button>
              </div>

            </div>
          )}
        </div>

        {/* ─── 1. Create a New Need Component ─── */}
        <CreatePost onPost={handleNewPost} />

        {/* ─── Sorting & Count Header ─── */}
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">
            Feed · Newest to Oldest
          </span>
          <span>{totalCount} needs near you</span>
        </div>

        {/* ─── Feed Posts List ─── */}
        <div className="space-y-3">
          {displayedNeeds.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-card border border-border/60">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <h4 className="text-sm font-semibold text-foreground">
                {searchQuery ? "No matching needs" : "No needs posted near you yet"}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No needs matching "${searchQuery}" with the current filters.`
                  : "Be the first to post a need! Describe what you're looking for to notify nearby merchants in real time."}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="text-xs rounded-xl"
                  >
                    Clear Search
                  </Button>
                )}
                {activeFiltersCount > 0 && (
                  <Button
                    size="sm"
                    onClick={resetFilters}
                    className="gradient-blue text-primary-foreground text-xs font-semibold rounded-xl"
                  >
                    Reset Filters
                  </Button>
                )}
                {!searchQuery && activeFiltersCount === 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="gradient-blue text-primary-foreground text-xs font-semibold rounded-xl"
                  >
                    Post a Need Above
                  </Button>
                )}
              </div>
            </div>
          ) : (
            displayedNeeds.map((need) => (
              <FeedPost
                key={need.id}
                post={need}
                onUpdate={() => loadNeeds(page, false)}
                onBlock={() => loadNeeds(page, false)}
              />
            ))
          )}
        </div>

        {/* ─── Infinite Scroll Loading Indicator ─── */}
        <div ref={observerTargetRef} className="py-4 flex justify-center">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more needs from server...</span>
            </div>
          ) : hasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoadingMore(true);
                setTimeout(() => {
                  setPage((p) => {
                    const next = p + 1;
                    loadNeeds(next, true);
                    return next;
                  });
                  setIsLoadingMore(false);
                }, 400);
              }}
              className="text-xs rounded-xl gap-1.5 border-border"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Scroll down or tap to load more ({totalCount - displayedNeeds.length} remaining)
            </Button>
          ) : displayedNeeds.length > 0 ? (
            <div className="text-center text-[11px] text-muted-foreground py-2 flex items-center justify-center gap-1">
              <span>All {totalCount} needs loaded for {selectedCountry === "All" ? "Worldwide" : selectedCountry}</span>
              <button
                onClick={scrollToTop}
                className="text-primary hover:underline font-semibold ml-2 flex items-center gap-0.5"
              >
                <ArrowUp className="h-3 w-3" /> Top
              </button>
            </div>
          ) : null}
        </div>

        {/* Bottom anchor for scrolling */}
        <div ref={feedBottomRef} />
      </div>
    </MobileLayout>
  );
};

export default Feed;
