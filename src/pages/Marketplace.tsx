import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Plus, Star, MapPin, Heart, MessageCircle,
  ShoppingCart, X, Image as ImageIcon, Tag, Grid3X3, List, Sparkles,
  ChevronDown,
} from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  seller: string;
  sellerAvatar: string;
  rating: number;
  reviews: number;
  location: string;
  category: string;
  image: string;
  featured: boolean;
  condition: "new" | "used" | "refurbished";
  saved: boolean;
}

const categories = [
  "All", "Electronics", "Fashion", "Vehicles", "Home & Garden",
  "Services", "Health & Beauty", "Sports", "Books", "Food",
];

const locations = [
  "All Locations", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu",
];

const conditions = ["All", "New", "Used", "Refurbished"];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

const seedProducts: Product[] = [
  { id: 1, title: "iPhone 15 Pro Max 256GB", price: 950000, description: "Brand new, sealed in box. Comes with receipt and 1 year warranty.", seller: "TechHub Lagos", sellerAvatar: "TH", rating: 4.9, reviews: 127, location: "Lagos", category: "Electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop", featured: true, condition: "new", saved: false },
  { id: 2, title: "Nike Air Jordan 1 Retro", price: 85000, description: "Authentic pair, size 42. Worn only twice, excellent condition.", seller: "SneakerVault", sellerAvatar: "SV", rating: 4.8, reviews: 89, location: "Abuja", category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", featured: true, condition: "used", saved: false },
  { id: 3, title: "Samsung 55\" 4K Smart TV", price: 320000, description: "Crystal UHD, 2024 model. Free delivery within Lagos.", seller: "ElectroMart", sellerAvatar: "EM", rating: 4.7, reviews: 56, location: "Lagos", category: "Electronics", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop", featured: false, condition: "new", saved: false },
  { id: 4, title: "Toyota Camry 2019 XLE", price: 12500000, description: "Foreign used, fully loaded, low mileage. Very clean.", seller: "AutoDeals NG", sellerAvatar: "AD", rating: 4.6, reviews: 34, location: "Abuja", category: "Vehicles", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=400&fit=crop", featured: true, condition: "used", saved: false },
  { id: 5, title: "Leather Office Chair", price: 65000, description: "Ergonomic design, lumbar support, adjustable height. Brand new.", seller: "FurniturePlus", sellerAvatar: "FP", rating: 4.5, reviews: 22, location: "Port Harcourt", category: "Home & Garden", image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop", featured: false, condition: "new", saved: false },
  { id: 6, title: "Professional Photography Service", price: 50000, description: "Product photography, events, portraits. Studio or on-location.", seller: "LensMaster", sellerAvatar: "LM", rating: 5.0, reviews: 78, location: "Lagos", category: "Services", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop", featured: false, condition: "new", saved: false },
  { id: 7, title: "Apple MacBook Pro M3 14\"", price: 1450000, description: "16GB RAM, 512GB SSD. Sealed with Apple warranty.", seller: "iStore NG", sellerAvatar: "iS", rating: 4.9, reviews: 64, location: "Lagos", category: "Electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", featured: true, condition: "new", saved: false },
  { id: 8, title: "Gym Equipment Set", price: 180000, description: "Dumbbells, bench press, resistance bands. Complete home gym.", seller: "FitGear", sellerAvatar: "FG", rating: 4.4, reviews: 15, location: "Ibadan", category: "Sports", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop", featured: false, condition: "new", saved: false },
];

const formatPrice = (price: number) =>
  "₦" + price.toLocaleString("en-NG");

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");
  const [condition, setCondition] = useState("All");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showListDialog, setShowListDialog] = useState(false);

  // New listing form
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newCondition, setNewCondition] = useState<"new" | "used" | "refurbished">("new");

  const filtered = products
    .filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      const matchLoc = location === "All Locations" || p.location === location;
      const matchCond = condition === "All" || p.condition === condition.toLowerCase();
      return matchSearch && matchCat && matchLoc && matchCond;
    })
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.id - a.id;
    });

  const toggleSave = (id: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  const handleListProduct = () => {
    if (!newTitle.trim() || !newPrice.trim()) return;
    const product: Product = {
      id: Date.now(),
      title: newTitle,
      price: Number(newPrice),
      description: newDesc,
      seller: "You",
      sellerAvatar: "YO",
      rating: 0,
      reviews: 0,
      location: "Lagos",
      category: newCategory,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      featured: false,
      condition: newCondition,
      saved: false,
    };
    setProducts((prev) => [product, ...prev]);
    setNewTitle("");
    setNewPrice("");
    setNewDesc("");
    setShowListDialog(false);
  };

  const featuredProducts = filtered.filter((p) => p.featured);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4">
            <SidebarTrigger />
            <span className="font-display text-lg font-bold text-gradient-blue">KILONEED</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">/ Marketplace</span>
            <div className="ml-auto">
              <Button size="sm" onClick={() => setShowListDialog(true)} className="gradient-blue text-primary-foreground gap-1.5">
                <Plus className="h-4 w-4" /> Sell
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-3 sm:max-w-6xl sm:px-4 sm:py-6 sm:space-y-6">
              {/* Search & Filters Bar */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products, sellers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
                <div className="flex flex-wrap items-stretch gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`shrink-0 ${showFilters ? "border-primary text-primary" : ""}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => setView(view === "grid" ? "list" : "grid")}>
                    {view === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="min-w-[140px] flex-1 bg-secondary border-border sm:w-[160px] sm:flex-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expandable Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                      <Card className="gradient-card border-border">
                        <CardContent className="space-y-4 p-3 sm:p-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((c) => (
                              <Badge
                                key={c}
                                variant={category === c ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${category === c ? "gradient-blue text-primary-foreground border-transparent" : "hover:bg-muted"}`}
                                onClick={() => setCategory(c)}
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                          <div className="min-w-0 sm:min-w-[160px]">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Location</label>
                            <Select value={location} onValueChange={setLocation}>
                              <SelectTrigger className="w-full bg-secondary border-border sm:w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((l) => (
                                  <SelectItem key={l} value={l}>{l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Condition</label>
                            <div className="flex flex-wrap gap-2">
                              {conditions.map((c) => (
                                <Badge
                                  key={c}
                                  variant={condition === c ? "default" : "outline"}
                                  className={`cursor-pointer transition-colors ${condition === c ? "gradient-blue text-primary-foreground border-transparent" : "hover:bg-muted"}`}
                                  onClick={() => setCondition(c)}
                                >
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Featured Products Banner */}
              {featuredProducts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        whileHover={{ scale: 1.03 }}
                        className="min-w-0 cursor-pointer overflow-hidden rounded-xl border border-border gradient-card shadow-card transition-shadow hover:shadow-glow"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <div className="relative h-24 overflow-hidden sm:h-32">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                          <Badge className="absolute top-2 left-2 gradient-blue text-primary-foreground border-transparent text-[10px]">
                            <Sparkles className="h-3 w-3 mr-1" /> Featured
                          </Badge>
                        </div>
                        <div className="p-2.5 sm:p-3">
                          <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{p.title}</p>
                          <p className="text-sm font-bold text-gradient-blue sm:text-base">{formatPrice(p.price)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <p className="text-xs text-muted-foreground sm:text-sm">
                {filtered.length} product{filtered.length !== 1 && "s"} found
              </p>

              {/* Product Grid / List */}
              <div className={view === "grid" ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {view === "grid" ? (
                      <Card
                        className="gradient-card border-border overflow-hidden cursor-pointer group hover:shadow-glow transition-shadow"
                        onClick={() => setSelectedProduct(product)}
                      >
                          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          {product.featured && (
                            <Badge className="absolute top-2 left-2 gradient-blue text-primary-foreground border-transparent text-[10px]">
                              <Sparkles className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSave(product.id); }}
                            className="absolute top-2 right-2 rounded-full bg-background/60 p-1.5 backdrop-blur-sm transition-colors sm:p-2"
                          >
                            <Heart className={`h-4 w-4 ${product.saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                          </button>
                          <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/70 text-[9px] capitalize backdrop-blur-sm sm:text-[10px]">
                            {product.condition}
                          </Badge>
                        </div>
                        <CardContent className="space-y-1 p-2.5 sm:p-3">
                          <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">{product.title}</h3>
                          <p className="text-base font-bold text-gradient-blue sm:text-lg">{formatPrice(product.price)}</p>
                          <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
                            <span className="min-w-0 truncate">{product.seller}</span>
                            <div className="flex shrink-0 items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span>{product.rating}</span>
                              <span className="text-muted-foreground/60">({product.reviews})</span>
                            </div>
                          </div>
                          <div className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{product.location}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card
                        className="gradient-card border-border overflow-hidden cursor-pointer hover:shadow-glow transition-shadow"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="flex min-w-0">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                            {product.featured && (
                              <Badge className="absolute top-1 left-1 gradient-blue text-primary-foreground border-transparent text-[8px] px-1">
                                <Sparkles className="h-2.5 w-2.5" />
                              </Badge>
                            )}
                          </div>
                          <CardContent className="flex min-w-0 flex-1 flex-col justify-between p-2.5 sm:p-3">
                            <div>
                              <h3 className="line-clamp-2 font-display text-sm font-semibold text-foreground">{product.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                            </div>
                            <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-base font-bold text-gradient-blue">{formatPrice(product.price)}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" />{product.rating}</span>
                                <span className="flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate">{product.location}</span></span>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="gradient-card border-border w-[calc(100vw-1rem)] max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          {selectedProduct && (
            <>
              <div className="relative h-44 overflow-hidden rounded-t-lg -mx-4 -mt-4 sm:h-56 sm:-mx-6 sm:-mt-6">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
                {selectedProduct.featured && (
                  <Badge className="absolute top-3 left-3 gradient-blue text-primary-foreground border-transparent">
                    <Sparkles className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                )}
              </div>
              <DialogHeader className="pt-4">
                <DialogTitle className="font-display text-lg sm:text-xl">{selectedProduct.title}</DialogTitle>
                <DialogDescription>{selectedProduct.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <p className="text-xl font-bold text-gradient-blue sm:text-2xl">{formatPrice(selectedProduct.price)}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {selectedProduct.sellerAvatar}
                    </div>
                    <span>{selectedProduct.seller}</span>
                  </div>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{selectedProduct.rating} ({selectedProduct.reviews})</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedProduct.location}</span>
                  <Badge variant="outline" className="capitalize text-xs">{selectedProduct.condition}</Badge>
                </div>
              </div>
              <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => { toggleSave(selectedProduct.id); }}>
                  <Heart className={`h-4 w-4 ${selectedProduct.saved ? "fill-primary text-primary" : ""}`} />
                  {selectedProduct.saved ? "Saved" : "Save"}
                </Button>
                <Button className="flex-1 gradient-blue text-primary-foreground gap-2">
                  <MessageCircle className="h-4 w-4" /> Contact Seller
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* List Product Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="gradient-card border-border w-[calc(100vw-1rem)] max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">List a Product</DialogTitle>
            <DialogDescription>Fill in the details to list your product on the marketplace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. iPhone 15 Pro Max" className="bg-secondary border-border" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₦)</label>
                <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" className="bg-secondary border-border" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Condition</label>
              <div className="flex flex-wrap gap-2">
                {(["new", "used", "refurbished"] as const).map((c) => (
                  <Badge
                    key={c}
                    variant={newCondition === c ? "default" : "outline"}
                    className={`cursor-pointer capitalize ${newCondition === c ? "gradient-blue text-primary-foreground border-transparent" : "hover:bg-muted"}`}
                    onClick={() => setNewCondition(c)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe your product..." className="bg-secondary border-border resize-none" rows={3} />
            </div>
            <Button variant="outline" className="w-full gap-2 border-dashed border-border text-muted-foreground">
              <ImageIcon className="h-4 w-4" /> Upload Photos
            </Button>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowListDialog(false)}>Cancel</Button>
            <Button onClick={handleListProduct} className="gradient-blue text-primary-foreground">List Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Marketplace;
