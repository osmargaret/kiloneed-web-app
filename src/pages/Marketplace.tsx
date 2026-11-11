import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, Plus, Star, MapPin, Heart, MessageCircle,
  ShoppingCart, X, Image as ImageIcon, Tag, Grid3X3, List, Sparkles,
  ChevronDown, Check, ShieldCheck, Clock, RotateCcw,
  Sliders, DollarSign, Eye, ArrowUpDown, UserCheck, Crown, Compass,
  Loader2, Upload, Globe,
} from "lucide-react";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_STATE,
  DEFAULT_CITY,
  getStatesForCountry,
  getCitiesForState,
} from "@/config/cscData";
import {
  getActiveMarketplaceConfig,
  marketplaceCategories,
  type TenantCountryConfig,
} from "@/config/marketplaceConfig";
import { HeaderActionButton } from "@/components/HeaderActionButton";
import { productsApiService, api } from "@/services/apiClient";

export type ProductCondition = "Brand New" | "Like New" | "Used" | "Fairly Used" | "Refurbished" | "Damaged";
export type AvailabilityStatus = "Available" | "Out of Stock";
export type SellerType = "Individual" | "Dealer" | "Business";
export type ListingType = "For Sale" | "For Rent" | "Wanted";
export type NegotiationType = "All" | "Negotiable" | "Fixed Price";
export type DatePostedFilter = "All Time" | "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days";
export type SellerVerificationFilter = "All Sellers" | "Verified Only";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  seller: string;
  sellerAvatar: string;
  sellerType: SellerType;
  sellerVerified: boolean;
  rating: number;
  reviews: number;
  country?: string;
  state: string;
  city: string;
  distanceKm: number;
  category: string;
  subcategory: string;
  image: string;
  featured: boolean;
  condition: ProductCondition;
  availability: AvailabilityStatus;
  listingType: ListingType;
  datePosted: string; // ISO date
  negotiable: boolean;
  saved: boolean;
}

const PAGE_SIZE = 8;

type FilterSectionTab = "all" | "proximity" | "category" | "price" | "condition" | "seller" | "more";

const filterTitleInfo: Record<FilterSectionTab, { title: string; icon: any }> = {
  all: { title: "All Filters", icon: SlidersHorizontal },
  proximity: { title: "Location (Country, State, City)", icon: Globe },
  category: { title: "Category", icon: Tag },
  price: { title: "Price Range", icon: DollarSign },
  condition: { title: "Condition", icon: Eye },
  seller: { title: "Seller & Trust", icon: UserCheck },
  more: { title: "Sort & Options", icon: Sliders },
};

const CONDITION_DESCRIPTIONS: Record<ProductCondition, string> = {
  "Brand New": "Sealed in box / Never used",
  "Like New": "Flawless, barely used",
  "Used": "Good condition, fully functional",
  "Fairly Used": "Signs of wear, normal usage",
  "Refurbished": "Tested & restored to work",
  "Damaged": "Needs repairs or for parts",
};

export default function Marketplace() {
  const tenantConfig: TenantCountryConfig = useMemo(() => getActiveMarketplaceConfig(), []);
  const formatPrice = tenantConfig.currency.format;

  // Check user subscription
  const userSubscription = (localStorage.getItem("kiloneed_subscription") || "Premium").toLowerCase();
  const isPremium = userSubscription === "premium" || userSubscription === "enterprise";

  // Base state
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<FilterSectionTab>("proximity");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showListDialog, setShowListDialog] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Marketplace Location Filters (Country, State, City - CSC)
  // ─────────────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");

  const availableStates = selectedCountry !== "All" ? getStatesForCountry(selectedCountry) : [];
  const availableCities =
    selectedCountry !== "All" && selectedState !== "All"
      ? getCitiesForState(selectedCountry, selectedState)
      : [];

  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string>("");
  const [negotiation, setNegotiation] = useState<NegotiationType>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("All");
  const [selectedListingType, setSelectedListingType] = useState<string>("All");
  const [selectedSellerType, setSelectedSellerType] = useState<string>("All");
  const [sellerVerification, setSellerVerification] = useState<SellerVerificationFilter>("All Sellers");
  const [datePosted, setDatePosted] = useState<DatePostedFilter>("All Time");

  const activeCategoryData = useMemo(() => {
    return marketplaceCategories.find((c) => c.name === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory("All");
      setSelectedSubcategory("All");
    } else {
      setSelectedCategory(catName);
      setSelectedSubcategory("All");
    }
  };

  const handlePriceRangeClick = (rangeId: string) => {
    if (selectedPriceRangeId === rangeId) {
      setSelectedPriceRangeId("");
      setMinPrice("");
      setMaxPrice("");
      return;
    }
    const range = tenantConfig.priceRanges.find((r) => r.id === rangeId);
    if (range) {
      setSelectedPriceRangeId(range.id);
      setMinPrice(range.min !== undefined ? range.min.toString() : "");
      setMaxPrice(range.max !== undefined ? range.max.toString() : "");
    }
  };

  // Section dot indicator flags
  const hasLocationActive = selectedCountry !== "All" || selectedState !== "All" || selectedCity !== "All";
  const hasCategoryActive = selectedCategory !== "All" || selectedSubcategory !== "All";
  const hasPriceActive = Boolean(minPrice || maxPrice || selectedPriceRangeId || negotiation !== "All");
  const hasConditionActive = selectedCondition !== "All";
  const hasSellerActive = selectedSellerType !== "All" || sellerVerification !== "All Sellers";
  const hasMoreActive =
    selectedAvailability !== "All" ||
    selectedListingType !== "All" ||
    datePosted !== "All Time" ||
    sortBy !== "newest";

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== "All") count++;
    if (selectedState !== "All") count++;
    if (selectedCity !== "All") count++;
    if (selectedCategory !== "All") count++;
    if (selectedSubcategory !== "All") count++;
    if (minPrice || maxPrice || selectedPriceRangeId) count++;
    if (negotiation !== "All") count++;
    if (selectedCondition !== "All") count++;
    if (selectedAvailability !== "All") count++;
    if (selectedListingType !== "All") count++;
    if (selectedSellerType !== "All") count++;
    if (sellerVerification !== "All Sellers") count++;
    if (datePosted !== "All Time") count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [
    selectedCountry, selectedState, selectedCity, selectedCategory, selectedSubcategory,
    minPrice, maxPrice, selectedPriceRangeId, negotiation, selectedCondition,
    selectedAvailability, selectedListingType, selectedSellerType,
    sellerVerification, datePosted, sortBy,
  ]);

  const resetAllFilters = () => {
    setSelectedCountry("All");
    setSelectedState("All");
    setSelectedCity("All");
    setSortBy("newest");
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSelectedPriceRangeId("");
    setNegotiation("All");
    setSelectedCondition("All");
    setSelectedAvailability("All");
    setSelectedListingType("All");
    setSelectedSellerType("All");
    setSellerVerification("All Sellers");
    setDatePosted("All Time");
    setSearch("");
    toast.success("Filters reset to default");
  };

  const toggleQuickVerified = () => {
    const next = sellerVerification === "Verified Only" ? "All Sellers" : "Verified Only";
    setSellerVerification(next);
    toast.info(next === "Verified Only" ? "Showing Verified Sellers only" : "Showing all sellers");
  };

  const openFiltersOnTab = (tab: FilterSectionTab) => {
    setActiveFilterTab(tab);
    setShowFiltersSheet(true);
  };

  // Search parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    productsApiService
      .getProducts()
      .then((remoteProducts) => {
        if (Array.isArray(remoteProducts)) {
          setProducts(remoteProducts);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "sell" || locationState.state?.openSell) {
      setShowListDialog(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, locationState, setSearchParams]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    search, selectedCountry, selectedState, selectedCity, selectedCategory, selectedSubcategory,
    minPrice, maxPrice, selectedCondition, selectedAvailability, selectedSellerType,
    selectedListingType, datePosted, negotiation, sellerVerification, sortBy,
  ]);

  const matchesDatePosted = (isoDate: string, filter: DatePostedFilter) => {
    if (filter === "All Time") return true;
    const itemDate = new Date(isoDate).getTime();
    const diffHours = (Date.now() - itemDate) / (1000 * 3600);
    const diffDays = diffHours / 24;

    if (filter === "Today") return diffHours <= 24;
    if (filter === "Yesterday") return diffHours > 24 && diffHours <= 48;
    if (filter === "Last 7 Days") return diffDays <= 7;
    if (filter === "Last 30 Days") return diffDays <= 30;
    return true;
  };

  const filtered = useMemo(() => {
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;

    return products
      .filter((p) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSeller = p.seller.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchState = p.state.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSeller && !matchCity && !matchState) {
            return false;
          }
        }

        // CSC Location Filter (Country, State, City)
        if (selectedCountry !== "All" && (p as any).country && (p as any).country.toLowerCase() !== selectedCountry.toLowerCase()) {
          return false;
        }
        if (selectedState !== "All" && p.state && p.state.toLowerCase() !== selectedState.toLowerCase()) {
          return false;
        }
        if (selectedCity !== "All" && p.city && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }

        if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
        if (selectedSubcategory !== "All" && p.subcategory !== selectedSubcategory) return false;
        if (min !== null && !isNaN(min) && p.price < min) return false;
        if (max !== null && !isNaN(max) && p.price > max) return false;
        if (negotiation === "Negotiable" && !p.negotiable) return false;
        if (negotiation === "Fixed Price" && p.negotiable) return false;
        if (selectedCondition !== "All" && p.condition !== selectedCondition) return false;
        if (selectedAvailability !== "All" && p.availability !== selectedAvailability) return false;
        if (selectedListingType !== "All" && p.listingType !== selectedListingType) return false;
        if (selectedSellerType !== "All" && p.sellerType !== selectedSellerType) return false;
        if (sellerVerification === "Verified Only" && !p.sellerVerified) return false;
        if (!matchesDatePosted(p.datePosted, datePosted)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "proximity") return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
        if (sortBy === "lowest-price" || sortBy === "price-low") return a.price - b.price;
        if (sortBy === "highest-price" || sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "oldest") return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      });
  }, [
    products, search, selectedCountry, selectedState, selectedCity, selectedCategory,
    selectedSubcategory, minPrice, maxPrice, negotiation, selectedCondition,
    selectedAvailability, selectedListingType, selectedSellerType,
    sellerVerification, datePosted, sortBy,
  ]);

  const paginatedProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  };

  const toggleSave = (id: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  const handleContactSeller = (product: Product) => {
    const sellerId = (product as any).user_id || (product as any).userId || (product as any).seller_id;
    const initialText = `Hi ${product.seller}, I'm interested in "${product.title}" (${tenantConfig.currency.symbol}${product.price.toLocaleString()}). Is it still available?`;

    setSelectedProduct(null);
    navigate("/messages", {
      state: {
        recipient: product.seller,
        recipientId: sellerId,
        productTitle: product.title,
        productPrice: product.price,
        productId: product.id,
        productImage: product.image,
        initialText,
        threadType: "commodity",
      },
    });
  };

  // Sell Listing state
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newSubcategory, setNewSubcategory] = useState("Phones & Tablets");
  const [newCountry, setNewCountry] = useState(localStorage.getItem("kiloneed_country") || "");
  const [newState, setNewState] = useState(localStorage.getItem("kiloneed_state") || "");
  const [newCity, setNewCity] = useState(localStorage.getItem("kiloneed_city") || "");
  const [newCondition, setNewCondition] = useState<ProductCondition>("Brand New");
  const [newListingType, setNewListingType] = useState<ListingType>("For Sale");
  const [newSellerType, setNewSellerType] = useState<SellerType>("Individual");
  const [newNegotiable, setNewNegotiable] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const newListingAvailableStates = getStatesForCountry(newCountry);
  const newListingAvailableCities = getCitiesForState(newCountry, newState);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview immediately
    const localPreview = URL.createObjectURL(file);
    setNewImage(localPreview);
    setIsUploadingImage(true);

    try {
      const res = await api.upload(file);
      if (res?.url) {
        setNewImage(res.url);
        toast.success("Product photo uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo to server. Local preview retained.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleNewListingCountryChange = (countryName: string) => {
    setNewCountry(countryName);
    const states = getStatesForCountry(countryName);
    if (states.length > 0) {
      setNewState(states[0].name);
      const cities = states[0].cities;
      setNewCity(cities.length > 0 ? cities[0] : "");
    } else {
      setNewState("");
      setNewCity("");
    }
  };

  const handleNewListingStateChange = (stateName: string) => {
    setNewState(stateName);
    const cities = getCitiesForState(newCountry, stateName);
    if (cities.length > 0) {
      setNewCity(cities[0]);
    } else {
      setNewCity("");
    }
  };

  const handleNewListingCategoryChange = (categoryName: string) => {
    setNewCategory(categoryName);
    const catObj = marketplaceCategories.find((c) => c.name === categoryName);
    if (catObj && catObj.subcategories.length > 0) {
      setNewSubcategory(catObj.subcategories[0]);
    }
  };

  const handleListProduct = async () => {
    if (!newTitle.trim() || !newPrice.trim()) {
      toast.error("Please enter a title and price for your listing");
      return;
    }
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const initialLetters = currentUserName.slice(0, 2).toUpperCase();

    const finalImage =
      newImage.trim() ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop";

    setIsPublishing(true);
    try {
      const res = await productsApiService.createProduct({
        title: newTitle.trim(),
        price: Number(newPrice),
        description: newDesc.trim() || "No description provided.",
        country: newCountry,
        seller_type: newSellerType,
        state: newState,
        city: newCity,
        category: newCategory,
        subcategory: newSubcategory,
        image: finalImage,
        featured: false,
        condition: newCondition,
        availability: "Available",
        listing_type: newListingType,
        negotiable: newNegotiable,
      });

      const serverProduct = res?.product;
      const createdItem: Product = {
        id: serverProduct?.id || Date.now(),
        title: serverProduct?.title || newTitle.trim(),
        price: Number(serverProduct?.price || newPrice),
        description: serverProduct?.description || newDesc.trim() || "No description provided.",
        seller: serverProduct?.user?.name || currentUserName,
        sellerAvatar: initialLetters,
        sellerType: newSellerType,
        sellerVerified: true,
        rating: 0.0,
        reviews: 0,
        country: newCountry,
        state: newState,
        city: newCity,
        distanceKm: 0.1,
        category: newCategory,
        subcategory: newSubcategory,
        image: serverProduct?.image || finalImage,
        featured: false,
        condition: newCondition,
        availability: "Available",
        listingType: newListingType,
        datePosted: new Date().toISOString(),
        negotiable: newNegotiable,
        saved: false,
      };

      setProducts((prev) => [createdItem, ...prev]);
      toast.success("Listing published and live on marketplace!");
      setNewTitle("");
      setNewPrice("");
      setNewDesc("");
      setNewImage("");
      setShowListDialog(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish listing on server");
    } finally {
      setIsPublishing(false);
    }
  };

  const featuredProducts = filtered.filter((p) => p.featured);

  return (
    <MobileLayout
      title="Marketplace"
      headerRight={
        <HeaderActionButton
          label="Sell"
          onClick={() => setShowListDialog(true)}
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-3 px-3 py-3 sm:max-w-6xl sm:px-4 sm:py-5 sm:space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, brands, sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-9 bg-secondary/70 border-border/80 h-11 rounded-xl text-sm focus-visible:ring-primary shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE-FIRST QUICK FILTER CAROUSEL (Delivery Removed)
            ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs -mx-1 px-1">
          {/* Main Filter Drawer Trigger */}
          <button
            onClick={() => openFiltersOnTab("all")}
            className={`flex items-center gap-1.5 h-7.5 px-2.5 rounded-xl border text-[11px] font-semibold shrink-0 transition-all ${
              activeFiltersCount > 0
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border hover:bg-muted text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="h-3.5 min-w-[14px] px-1 rounded-full bg-white text-primary text-[9px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Quick Location (CSC) Pill */}
          <button
            onClick={() => openFiltersOnTab("proximity")}
            className={`flex items-center gap-1.5 h-7.5 px-2.5 rounded-xl border text-[11px] shrink-0 transition-all ${
              hasLocationActive
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate max-w-[150px]">
              {selectedCity !== "All"
                ? `${selectedCity}, ${selectedState}`
                : selectedState !== "All"
                ? selectedState
                : selectedCountry !== "All"
                ? selectedCountry
                : "All Locations"}
            </span>
            <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
          </button>

          {/* Quick Category Pill */}
          <button
            onClick={() => openFiltersOnTab("category")}
            className={`flex items-center gap-1 h-7.5 px-2.5 rounded-xl border text-[11px] shrink-0 transition-all ${
              hasCategoryActive
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-3 w-3 text-primary" />
            <span className="truncate max-w-[110px]">
              {selectedCategory === "All" ? "Category" : selectedCategory}
            </span>
            <ChevronDown className="h-2.5 w-2.5 opacity-60" />
          </button>

          {/* Quick Price Pill */}
          <button
            onClick={() => openFiltersOnTab("price")}
            className={`flex items-center gap-1 h-7.5 px-2.5 rounded-xl border text-[11px] shrink-0 transition-all ${
              hasPriceActive
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-3 w-3 text-primary" />
            <span>
              {selectedPriceRangeId
                ? tenantConfig.priceRanges.find((r) => r.id === selectedPriceRangeId)?.label
                : minPrice || maxPrice
                ? "Price set"
                : "Price"}
            </span>
            <ChevronDown className="h-2.5 w-2.5 opacity-60" />
          </button>

          {/* Quick Condition Pill */}
          <button
            onClick={() => openFiltersOnTab("condition")}
            className={`flex items-center gap-1 h-7.5 px-2.5 rounded-xl border text-[11px] shrink-0 transition-all ${
              hasConditionActive
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3 w-3 text-primary" />
            <span>{selectedCondition === "All" ? "Condition" : selectedCondition}</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-60" />
          </button>

          {/* Quick Seller Type Pill */}
          <button
            onClick={() => openFiltersOnTab("seller")}
            className={`flex items-center gap-1 h-7.5 px-2.5 rounded-xl border text-[11px] shrink-0 transition-all ${
              hasSellerActive
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-3 w-3 text-primary" />
            <span>{selectedSellerType === "All" ? "Seller Type" : selectedSellerType}</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-60" />
          </button>

          {/* One-Tap Verified Toggle */}
          <button
            onClick={toggleQuickVerified}
            className={`flex items-center gap-1 h-9 px-3 rounded-xl border text-xs shrink-0 transition-all ${
              sellerVerification === "Verified Only"
                ? "bg-primary/15 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Verified</span>
          </button>

          {/* Quick Sort Pill */}
          <button
            onClick={() => openFiltersOnTab("more")}
            className={`flex items-center gap-1 h-9 px-3 rounded-xl border text-xs shrink-0 transition-all ${
              sortBy === "proximity"
                ? "bg-primary/10 border-primary text-primary font-semibold"
                : "bg-card border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="capitalize">{sortBy === "proximity" ? "Nearest Proximity" : sortBy.replace("-", " ")}</span>
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className="flex items-center justify-center h-9 w-9 rounded-xl border bg-card border-border hover:bg-muted text-muted-foreground shrink-0 ml-auto"
            aria-label="Toggle view"
          >
            {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </button>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-secondary/30 border border-border/40 text-[11px]">
            <span className="text-muted-foreground font-medium pl-1">Filtered by:</span>
            
            {hasLocationActive && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-primary/10 text-primary border-primary/20">
                <Globe className="h-3 w-3" />
                {selectedCity !== "All"
                  ? `${selectedCity}, ${selectedState}`
                  : selectedState !== "All"
                  ? `${selectedState}, ${selectedCountry}`
                  : selectedCountry}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setSelectedCountry("All");
                    setSelectedState("All");
                    setSelectedCity("All");
                  }}
                />
              </Badge>
            )}

            {sortBy === "proximity" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-primary/10 text-primary border-primary/20">
                Nearest First
              </Badge>
            )}

            {selectedCategory !== "All" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-card text-foreground border-border">
                {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("All")} />
              </Badge>
            )}

            {selectedSubcategory !== "All" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-card text-foreground border-border">
                Sub: {selectedSubcategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubcategory("All")} />
              </Badge>
            )}

            {selectedCondition !== "All" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-card text-foreground border-border">
                {selectedCondition}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition("All")} />
              </Badge>
            )}

            {(minPrice || maxPrice || selectedPriceRangeId) && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-card text-foreground border-border">
                {minPrice && maxPrice
                  ? `${formatPrice(Number(minPrice))} - ${formatPrice(Number(maxPrice))}`
                  : minPrice
                  ? `Min ${formatPrice(Number(minPrice))}`
                  : `Max ${formatPrice(Number(maxPrice))}`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedPriceRangeId("");
                  }}
                />
              </Badge>
            )}

            {selectedSellerType !== "All" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-card text-foreground border-border">
                {selectedSellerType}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSellerType("All")} />
              </Badge>
            )}

            {sellerVerification === "Verified Only" && (
              <Badge variant="secondary" className="gap-1 py-0.5 px-2 bg-primary/10 text-primary border-primary/20">
                Verified Only
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSellerVerification("All Sellers")} />
              </Badge>
            )}

            <button
              onClick={resetAllFilters}
              className="text-destructive font-semibold hover:underline ml-auto pr-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Featured Products Carousel */}
        {featuredProducts.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Featured Items</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((p) => (
                <motion.div
                  key={p.id}
                  whileTap={{ scale: 0.98 }}
                  className="min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-border/80 gradient-card shadow-sm hover:shadow-glow transition-all"
                  onClick={() => setSelectedProduct(p)}
                >
                  <div className="relative h-28 overflow-hidden sm:h-32 bg-muted/40">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                    <Badge className="absolute top-2 left-2 gradient-blue text-primary-foreground border-transparent text-[10px] font-semibold shadow-sm">
                      <Sparkles className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                    <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/85 text-[10px] backdrop-blur-md flex items-center gap-1">
                      <Compass className="h-3 w-3 text-primary" />
                      {p.city}, {p.state}
                    </Badge>
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{p.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-gradient-blue sm:text-base">{formatPrice(p.price)}</p>
                      <span className="text-[11px] text-muted-foreground">{p.condition}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <p>
            <span className="font-semibold text-foreground">{filtered.length}</span> item{filtered.length !== 1 && "s"} found
            {selectedCountry !== "All" && (
              <span> in <strong className="text-foreground">{selectedCity !== "All" ? `${selectedCity}, ` : ""}{selectedState !== "All" ? `${selectedState}, ` : ""}{selectedCountry}</strong></span>
            )}
            {sortBy === "proximity" && (
              <span className="text-primary font-medium"> · sorted by nearest</span>
            )}
          </p>
        </div>

        {/* Products Grid / List */}
        <div className={view === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
          {paginatedProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % PAGE_SIZE) * 0.03 }}
            >
              {view === "grid" ? (
                <Card
                  className="gradient-card border-border/70 overflow-hidden cursor-pointer group hover:shadow-glow transition-all rounded-2xl active:scale-[0.99]"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 gradient-blue text-primary-foreground border-transparent text-[10px]">
                        <Sparkles className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                    {product.listingType !== "For Sale" && (
                      <Badge className="absolute top-2 left-2 bg-amber-500/95 text-white border-transparent text-[10px]">
                        {product.listingType}
                      </Badge>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(product.id);
                      }}
                      className="absolute top-2 right-2 rounded-full bg-background/80 p-2 backdrop-blur-md transition-colors hover:bg-background shadow-sm"
                      aria-label="Save product"
                    >
                      <Heart className={`h-4 w-4 ${product.saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <Badge variant="outline" className="bg-background/85 text-[10px] backdrop-blur-md">
                        {product.condition}
                      </Badge>
                      {product.negotiable && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] backdrop-blur-md">
                          Negotiable
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="space-y-1.5 p-3">
                    <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-base font-bold text-gradient-blue sm:text-lg">
                        {formatPrice(product.price)}
                      </p>
                      {product.availability === "Out of Stock" && (
                        <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30">
                          Out of Stock
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="truncate">{product.seller}</span>
                        {product.sellerVerified && (
                          <span title="Verified Seller"><ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" /></span>
                        )}
                      </div>
                      {product.reviews > 0 ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{product.rating}</span>
                          <span className="text-muted-foreground/60 text-[10px]">({product.reviews})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/80 font-medium">New Seller</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1 shrink-0 text-[10px]">
                        <Clock className="h-3 w-3" />
                        <span>{matchesDatePosted(product.datePosted, "Today") ? "Today" : "Recent"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className="gradient-card border-border/70 overflow-hidden cursor-pointer hover:shadow-glow transition-all rounded-2xl active:scale-[0.99]"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex min-w-0">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden sm:h-32 sm:w-32 bg-muted/40">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                      {product.featured && (
                        <Badge className="absolute top-1 left-1 gradient-blue text-primary-foreground border-transparent text-[8px] px-1">
                          <Sparkles className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                    </div>
                    <CardContent className="flex min-w-0 flex-1 flex-col justify-between p-3">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">
                            {product.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(product.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary"
                          >
                            <Heart className={`h-4 w-4 ${product.saved ? "fill-primary text-primary" : ""}`} />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-gradient-blue">{formatPrice(product.price)}</p>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-[10px]">{product.condition}</Badge>
                            {product.negotiable && (
                              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                                Negotiable
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                          {product.reviews > 0 ? (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              {product.rating} ({product.reviews})
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/80 font-medium">New Seller</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-xs text-muted-foreground">
              Showing {paginatedProducts.length} of {filtered.length} products
            </p>
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="gap-2 px-8 rounded-xl bg-card border-border"
            >
              {loadingMore ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Load More
                </>
              )}
            </Button>
          </div>
        )}

        {!hasMore && filtered.length > PAGE_SIZE && (
          <p className="text-center text-xs text-muted-foreground py-4">
            You've seen all {filtered.length} products
          </p>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-base">No products match your filters</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try picking "All States" or clearing price and condition restrictions.
            </p>
            <Button variant="outline" size="sm" onClick={resetAllFilters} className="gap-1.5 rounded-xl">
              <RotateCcw className="h-3.5 w-3.5" /> Reset all filters
            </Button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NATIVE MOBILE BOTTOM FILTER SHEET (Delivery Removed)
          ───────────────────────────────────────────────────────────── */}
      <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
        <SheetContent
          side="bottom"
          className={`p-0 rounded-t-3xl flex flex-col bg-background/98 backdrop-blur-xl border-t border-border shadow-2xl focus:outline-none [&>button.absolute]:hidden ${
            activeFilterTab === "proximity" ? "max-h-[85dvh] h-auto" : "max-h-[90dvh] h-[90dvh]"
          }`}
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Sticky Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/70 shrink-0">
            <div className="flex items-center gap-2.5">
              {(() => {
                const info = filterTitleInfo[activeFilterTab] || filterTitleInfo.proximity;
                const IconComponent = info.icon;
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-display text-sm font-bold text-foreground block leading-tight">
                        {info.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {activeFilterTab === "proximity"
                          ? "Search & sort products by distance"
                          : "Refine marketplace items"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCountry("All");
                  setSelectedState("All");
                  setSelectedCity("All");
                  setSortBy("newest");
                  toast.success("Location filter reset");
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFiltersSheet(false)}
                className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Filter Content Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
            
            {/* ─────────────────────────────────────────────────────────────
                SECTION: LOCATION (Country, State, City - CSC Global Model)
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "proximity") && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/50 to-background/80 p-4 sm:p-5 shadow-sm space-y-4">
                  
                  {/* Top Status */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Globe className="h-3 w-3" />
                      <span>Global Marketplace Location</span>
                    </div>

                    <span className="text-[11px] font-medium text-muted-foreground">
                      {selectedCountry === "All" ? "Worldwide" : selectedCountry}
                    </span>
                  </div>

                  {/* CSC Cascading Selectors */}
                  <div className="space-y-3">
                    {/* 1. Country Selection */}
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        Country
                      </label>
                      <Select
                        value={selectedCountry}
                        onValueChange={(val) => {
                          setSelectedCountry(val);
                          setSelectedState("All");
                          setSelectedCity("All");
                        }}
                      >
                        <SelectTrigger className="bg-card border-border text-xs h-10 rounded-xl">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="All">🌐 Worldwide (All Countries)</SelectItem>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.name}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 2. State / Region Selection */}
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        State / Region
                      </label>
                      <Select
                        value={selectedState}
                        disabled={selectedCountry === "All"}
                        onValueChange={(val) => {
                          setSelectedState(val);
                          setSelectedCity("All");
                        }}
                      >
                        <SelectTrigger className="bg-card border-border text-xs h-10 rounded-xl">
                          <SelectValue placeholder="All States" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="All">All States / Regions</SelectItem>
                          {availableStates.map((s) => (
                            <SelectItem key={s.name} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 3. City Selection */}
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        City
                      </label>
                      <Select
                        value={selectedCity}
                        disabled={selectedState === "All"}
                        onValueChange={setSelectedCity}
                      >
                        <SelectTrigger className="bg-card border-border text-xs h-10 rounded-xl">
                          <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="All">All Cities</SelectItem>
                          {availableCities.map((ct) => (
                            <SelectItem key={ct} value={ct}>
                              {ct}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location Presets */}
                  <div className="pt-1">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/80 block mb-2">
                      Popular Hubs (Nigeria & Global)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: "Lagos, NG", country: "Nigeria", state: "Lagos", city: "All" },
                        { label: "Abuja (FCT), NG", country: "Nigeria", state: "Abuja (FCT)", city: "All" },
                        { label: "Rivers, NG", country: "Nigeria", state: "Rivers", city: "All" },
                        { label: "Oyo, NG", country: "Nigeria", state: "Oyo", city: "All" },
                        { label: "All Nigeria", country: "Nigeria", state: "All", city: "All" },
                        { label: "Worldwide", country: "All", state: "All", city: "All" },
                      ].map((hub) => {
                        const isMatch =
                          selectedCountry === hub.country &&
                          selectedState === hub.state &&
                          selectedCity === hub.city;

                        return (
                          <button
                            key={hub.label}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(hub.country);
                              setSelectedState(hub.state);
                              setSelectedCity(hub.city);
                              toast.success(`Filter set to ${hub.label}`);
                            }}
                            className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                              isMatch
                                ? "gradient-blue text-primary-foreground border-transparent shadow-xs"
                                : "bg-card/70 border-border hover:bg-muted text-foreground"
                            }`}
                          >
                            {hub.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SECTION: CATEGORY & SUBCATEGORY
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "category") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Category
                  </span>
                  {selectedCategory !== "All" && (
                    <button
                      onClick={() => handleCategoryChange("All")}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Clear Category
                    </button>
                  )}
                </div>

                {/* Visual Category Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCategoryChange("All")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      selectedCategory === "All"
                        ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                        : "bg-card border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="text-lg">🌟</span>
                    <span className="text-xs font-medium">All Categories</span>
                  </button>

                  {marketplaceCategories.map((c) => {
                    const isSelected = selectedCategory === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleCategoryChange(c.name)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                            : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        <span className="text-lg">{c.icon}</span>
                        <span className="text-xs font-medium truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Subcategories (Appears smoothly when category is picked) */}
                {selectedCategory !== "All" && activeCategoryData && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5 mt-3"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                      Subcategories in {selectedCategory}
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSubcategory("All")}
                        className={`text-xs py-1.5 px-3 rounded-xl border transition-all ${
                          selectedSubcategory === "All"
                            ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                            : "bg-card border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        All {selectedCategory}
                      </button>
                      {activeCategoryData.subcategories.map((sub) => {
                        const isSubSelected = selectedSubcategory === sub;
                        return (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubcategory(sub)}
                            className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl border transition-all ${
                              isSubSelected
                                ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                                : "bg-card border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            <span>{sub}</span>
                            {isSubSelected && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SECTION: PRICE & BUDGET
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "price") && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Price in {tenantConfig.currency.code} ({tenantConfig.currency.symbol})
                </span>

                {/* Popular Predefined Ranges */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-foreground block">Quick Price Ranges</span>
                  <div className="grid grid-cols-2 gap-2">
                    {tenantConfig.priceRanges.map((range) => {
                      const isSelected = selectedPriceRangeId === range.id;
                      return (
                        <button
                          key={range.id}
                          onClick={() => handlePriceRangeClick(range.id)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                            isSelected
                              ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                              : "bg-card border-border hover:bg-muted text-foreground"
                          }`}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Min / Max Inputs */}
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 space-y-2.5">
                  <span className="text-xs font-semibold text-foreground block">Custom Price Range</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Minimum Price</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          {tenantConfig.currency.symbol}
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => {
                            setMinPrice(e.target.value);
                            setSelectedPriceRangeId("");
                          }}
                          className="pl-8 bg-card border-border h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted-foreground mb-1 block">Maximum Price</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          {tenantConfig.currency.symbol}
                        </span>
                        <Input
                          type="number"
                          placeholder="No limit"
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            setSelectedPriceRangeId("");
                          }}
                          className="pl-8 bg-card border-border h-10 text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Negotiation Segmented Pill */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-medium text-foreground block">Price Negotiation</span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border/80">
                    {(["All", "Negotiable", "Fixed Price"] as NegotiationType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNegotiation(type)}
                        className={`h-8 rounded-lg text-xs font-medium transition-all ${
                          negotiation === type
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SECTION: CONDITION
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "condition") && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Item Condition
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCondition("All")}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedCondition === "All"
                        ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                        : "bg-card border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">All Conditions</span>
                      <span className="text-[11px] opacity-80">Show both brand new and used items</span>
                    </div>
                    {selectedCondition === "All" && <Check className="h-4 w-4" />}
                  </button>

                  {(["Brand New", "Like New", "Used", "Fairly Used", "Refurbished", "Damaged"] as ProductCondition[]).map(
                    (cond) => {
                      const isSelected = selectedCondition === cond;
                      return (
                        <button
                          key={cond}
                          onClick={() => setSelectedCondition(cond)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                              : "bg-card border-border hover:bg-muted text-foreground"
                          }`}
                        >
                          <div>
                            <span className="text-xs font-semibold block">{cond}</span>
                            <span className="text-[11px] opacity-75">{CONDITION_DESCRIPTIONS[cond]}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SECTION: SELLER & TRUST (Delivery Removed)
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "seller") && (
              <div className="space-y-4">
                {/* Seller Type Selector */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Seller Type
                  </span>
                  <p className="text-xs text-muted-foreground">Filter by type of merchant or individual:</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["All", "Individual", "Dealer", "Business"].map((type) => {
                      const isSelected = selectedSellerType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedSellerType(type)}
                          className={`h-9 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                              : "bg-card border-border hover:bg-muted text-foreground"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Verified Sellers Toggle */}
                <div
                  onClick={() =>
                    setSellerVerification(
                      sellerVerification === "Verified Only" ? "All Sellers" : "Verified Only"
                    )
                  }
                  className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 flex items-center justify-between cursor-pointer hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">Verified Sellers Only</span>
                      <span className="text-[11px] text-muted-foreground">Only show vetted sellers with verified badge</span>
                    </div>
                  </div>
                  <Checkbox
                    checked={sellerVerification === "Verified Only"}
                    onCheckedChange={(checked) =>
                      setSellerVerification(checked ? "Verified Only" : "All Sellers")
                    }
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SECTION: MORE OPTIONS (AVAILABILITY, LISTING TYPE, DATES, SORT)
                ───────────────────────────────────────────────────────────── */}
            {(activeFilterTab === "all" || activeFilterTab === "more") && (
              <div className="space-y-4">
                {/* Sort By */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Sort Listings
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "proximity", label: "Nearest Proximity" },
                      { id: "newest", label: "Newest First" },
                      { id: "lowest-price", label: "Lowest Price" },
                      { id: "highest-price", label: "Highest Price" },
                      { id: "rating", label: "Top Rated" },
                      { id: "oldest", label: "Oldest First" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSortBy(s.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                          sortBy === s.id
                            ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                            : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Posted */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Date Posted
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(["All Time", "Today", "Yesterday", "Last 7 Days", "Last 30 Days"] as DatePostedFilter[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDatePosted(d)}
                        className={`text-xs py-1.5 px-3 rounded-xl border transition-all ${
                          datePosted === d
                            ? "gradient-blue text-primary-foreground border-transparent font-semibold shadow-sm"
                            : "bg-card border-border hover:bg-muted text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing Type & Availability */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Listing Type
                    </span>
                    <Select value={selectedListingType} onValueChange={setSelectedListingType}>
                      <SelectTrigger className="w-full bg-card border-border h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="For Sale">For Sale</SelectItem>
                        <SelectItem value="For Rent">For Rent</SelectItem>
                        <SelectItem value="Wanted">Wanted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Availability
                    </span>
                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      <SelectTrigger className="w-full bg-card border-border h-9 text-xs rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="px-4 py-3 border-t border-border/80 bg-background/95 backdrop-blur-md flex items-center gap-2.5 shrink-0">
            {activeFilterTab !== "proximity" && (
              <Button
                variant="outline"
                onClick={resetAllFilters}
                disabled={activeFiltersCount === 0}
                className="h-11 px-4 rounded-xl text-xs gap-1.5 shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}

            <Button
              onClick={() => setShowFiltersSheet(false)}
              className="h-11 flex-1 rounded-xl gradient-blue text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 hover:shadow-glow transition-all"
            >
              {activeFilterTab === "proximity"
                ? `Show ${filtered.length} Product${filtered.length !== 1 ? "s" : ""} in ${
                    selectedCountry === "All" ? "Worldwide" : selectedCountry
                  }`
                : `Show ${filtered.length} Product${filtered.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────
          PRODUCT DETAIL DIALOG (Delivery Removed)
          ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="gradient-card border-border w-[calc(100vw-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          {selectedProduct && (
            <>
              <div className="relative h-48 overflow-hidden rounded-t-xl -mx-4 -mt-4 sm:h-60 sm:-mx-6 sm:-mt-6 bg-muted/40">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
                {selectedProduct.featured && (
                  <Badge className="absolute top-3 left-3 gradient-blue text-primary-foreground border-transparent">
                    <Sparkles className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
                <Badge variant="outline" className="absolute bottom-3 left-3 bg-background/85 text-xs backdrop-blur-md">
                  {selectedProduct.condition}
                </Badge>
              </div>

              <DialogHeader className="pt-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {selectedProduct.category} • {selectedProduct.subcategory}
                  </Badge>
                  {selectedProduct.listingType !== "For Sale" && (
                    <Badge className="text-[11px] bg-amber-500 text-white border-transparent">
                      {selectedProduct.listingType}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="font-display text-lg sm:text-xl font-bold leading-snug">
                  {selectedProduct.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground pt-1">
                  {selectedProduct.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 pt-2 text-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gradient-blue sm:text-3xl">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.negotiable && (
                      <span className="text-xs ml-2 text-emerald-500 font-medium">Negotiable</span>
                    )}
                  </div>
                  <Badge
                    variant={selectedProduct.availability === "Available" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {selectedProduct.availability}
                  </Badge>
                </div>

                {/* Seller Info Card */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {selectedProduct.sellerAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-semibold text-xs text-foreground">
                        {selectedProduct.seller}
                        {selectedProduct.sellerVerified && (
                          <span title="Verified Seller"><ShieldCheck className="h-4 w-4 text-primary" /></span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{selectedProduct.sellerType}</span>
                    </div>
                  </div>
                  {selectedProduct.reviews > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span>{selectedProduct.rating}</span>
                      <span className="text-muted-foreground/60 text-[10px]">({selectedProduct.reviews})</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-medium">New Seller</span>
                  )}
                </div>

                {/* Location Specs */}
                {(selectedProduct.city || selectedProduct.state || selectedProduct.country) && (
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground text-[10px] block uppercase font-bold">Location</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {[selectedProduct.city, selectedProduct.state, selectedProduct.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {selectedProduct.country && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {selectedProduct.country}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 text-xs h-10 rounded-xl"
                  onClick={() => toggleSave(selectedProduct.id)}
                >
                  <Heart className={`h-4 w-4 ${selectedProduct.saved ? "fill-primary text-primary" : ""}`} />
                  {selectedProduct.saved ? "Saved" : "Save Listing"}
                </Button>
                <Button
                  className="flex-1 gradient-blue text-primary-foreground gap-2 text-xs h-10 font-semibold rounded-xl cursor-pointer"
                  onClick={() => handleContactSeller(selectedProduct)}
                >
                  <MessageCircle className="h-4 w-4" /> Contact Seller
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          LIST PRODUCT DIALOG (SELLER CREATION - Delivery Removed)
          ───────────────────────────────────────────────────────────── */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="gradient-card border-border w-[calc(100vw-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-lg">List a Product or Service</DialogTitle>
            <DialogDescription className="text-xs">
              Listing on <strong>{tenantConfig.name}</strong> marketplace. Select your state and city to reach local buyers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-medium text-muted-foreground mb-1 block">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Apple MacBook Pro M3 or 2-Bedroom Flat"
                className="bg-secondary/80 border-border text-xs h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-muted-foreground mb-1 block">
                  Price ({tenantConfig.currency.symbol})
                </label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0"
                  className="bg-secondary/80 border-border text-xs h-9 rounded-xl"
                />
              </div>

              <div>
                <label className="font-medium text-muted-foreground mb-1 block">Negotiation</label>
                <Select
                  value={newNegotiable ? "yes" : "no"}
                  onValueChange={(v) => setNewNegotiable(v === "yes")}
                >
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">Fixed Price</SelectItem>
                    <SelectItem value="yes">Negotiable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Country Selection */}
            <div>
              <label className="font-medium text-muted-foreground mb-1 block">Country</label>
              <Select value={newCountry} onValueChange={handleNewListingCountryChange}>
                <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location (State & Dependent City) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-muted-foreground mb-1 block">State / Region</label>
                <Select value={newState} onValueChange={handleNewListingStateChange}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {newListingAvailableStates.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium text-muted-foreground mb-1 block">City / Town</label>
                <Select value={newCity} onValueChange={setNewCity}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {newListingAvailableCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={newCategory} onValueChange={handleNewListingCategoryChange}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {marketplaceCategories.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium text-muted-foreground mb-1 block">Subcategory</label>
                <Select value={newSubcategory} onValueChange={setNewSubcategory}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {marketplaceCategories
                      .find((c) => c.name === newCategory)
                      ?.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condition & Listing Type */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-muted-foreground mb-1 block">Condition</label>
                <Select value={newCondition} onValueChange={(v) => setNewCondition(v as ProductCondition)}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Brand New", "Like New", "Used", "Fairly Used", "Refurbished", "Damaged"] as ProductCondition[]).map((cond) => (
                      <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium text-muted-foreground mb-1 block">Listing Type</label>
                <Select value={newListingType} onValueChange={(v) => setNewListingType(v as ListingType)}>
                  <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["For Sale", "For Rent", "Wanted"] as ListingType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seller Type */}
            <div>
              <label className="font-medium text-muted-foreground mb-1 block">Seller Type</label>
              <Select value={newSellerType} onValueChange={(v) => setNewSellerType(v as SellerType)}>
                <SelectTrigger className="bg-secondary/80 border-border text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Individual", "Dealer", "Business"] as SellerType[]).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Include specifications, condition details, warranty, etc."
                className="bg-secondary/80 border-border resize-none text-xs rounded-xl"
                rows={3}
              />
            </div>

            {/* Hidden File Input for Real Photo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {newImage ? (
              <div className="relative rounded-xl overflow-hidden border border-border group bg-muted/40">
                <img
                  src={newImage}
                  alt="Product preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-8 text-xs rounded-lg"
                    onClick={() => setNewImage("")}
                  >
                    Remove
                  </Button>
                </div>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center text-xs font-semibold text-primary gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" /> Uploading to server...
                  </div>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed border-border/80 text-foreground text-xs h-12 rounded-xl hover:border-primary/60 hover:bg-primary/5 transition-all"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Uploading photo...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Upload Product Photo</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={() => setShowListDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleListProduct}
              disabled={isPublishing || isUploadingImage}
              className="gradient-blue text-primary-foreground font-semibold text-xs rounded-xl"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
