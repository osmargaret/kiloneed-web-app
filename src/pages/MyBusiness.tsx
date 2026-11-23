import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store, Mail, Phone, MapPin, Globe, FileText, Package, Wrench,
  Pencil, ArrowLeft, Tag, Clock, Star, Loader2, Camera,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { api, productsApiService } from "@/services/apiClient";

interface BusinessProfile {
  id: string;
  fullName?: string;
  businessName: string;
  email: string;
  phone?: string;
  category: string;
  taxId?: string;
  address?: string;
  website?: string;
  description?: string;
  logo?: string;
}

interface Listing {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  type?: "product" | "service";
  duration?: string;
  businessId?: string;
}

const formatPrice = (n: number) => "₦" + Number(n).toLocaleString("en-NG");

export default function MyBusiness() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarImage, setAvatarImage] = useState<string>(() => localStorage.getItem("kiloneed_avatar") || "");
  const [coverImage, setCoverImage] = useState<string>(() => localStorage.getItem("kiloneed_cover_image") || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;

    // 1. Try local cache first
    try {
      const raw = localStorage.getItem("kiloneed_business");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem("kiloneed_listings");
      if (raw) setListings(JSON.parse(raw));
    } catch {}

    // 2. Fetch live data from backend API
    Promise.all([
      authService.getMe().catch(() => null),
      productsApiService.getProducts().catch(() => []),
    ]).then(([meRes, allProducts]) => {
      if (!mounted) return;
      if (meRes?.user) {
        const u = meRes.user;
        const resolvedAvatar = u.avatar || localStorage.getItem("kiloneed_avatar") || "";
        if (resolvedAvatar) {
          setAvatarImage(resolvedAvatar);
          localStorage.setItem("kiloneed_avatar", resolvedAvatar);
        }
        setProfile((prev) => {
          const base = prev || {
            id: String(u.id),
            fullName: u.name,
            businessName: u.company || u.name,
            email: u.email,
            phone: u.phone,
            category: u.industry || "General",
            address: u.location || [u.city, u.state, u.country].filter(Boolean).join(", "),
            description: u.bio || `Official store of ${u.name}`,
          };
          return { ...base, logo: resolvedAvatar || base.logo };
        });

        if (Array.isArray(allProducts)) {
          const userItems: Listing[] = allProducts
            .filter((p: any) => p.user_id === u.id || p.seller === u.name)
            .map((p: any) => ({
              id: p.id,
              title: p.title,
              price: Number(p.price) || 0,
              image: p.image || "/placeholder.svg",
              category: p.category || "General",
              location: p.city ? `${p.city}, ${p.state}` : (p.location || "Online"),
              rating: p.rating || 5.0,
              reviews: p.reviews || 0,
              type: p.listing_type === "For Rent" || p.category === "Services" ? "service" : "product",
              businessId: String(u.id),
            }));
          if (userItems.length > 0) {
            setListings(userItems);
          }
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const myListings = profile ? listings.filter((l) => !l.businessId || l.businessId === profile.id) : listings;
  const products = myListings.filter((l) => (l.type ?? "product") === "product");
  const services = myListings.filter((l) => l.type === "service");

  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    toast.loading("Updating profile image...", { id: "biz-avatar" });
    try {
      let url = "";
      try {
        const up = await api.upload(file);
        url = up.url;
      } catch {
        url = await readAsDataUrl(file);
      }
      setAvatarImage(url);
      localStorage.setItem("kiloneed_avatar", url);
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, logo: url };
        localStorage.setItem("kiloneed_business", JSON.stringify(next));
        return next;
      });
      await authService.updateProfile({ avatar: url }).catch(() => {});
      toast.success("Business & profile image updated!", { id: "biz-avatar" });
    } catch {
      toast.error("Could not update image", { id: "biz-avatar" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    toast.loading("Updating cover image...", { id: "biz-cover" });
    try {
      let url = "";
      try {
        const up = await api.upload(file);
        url = up.url;
      } catch {
        url = await readAsDataUrl(file);
      }
      setCoverImage(url);
      localStorage.setItem("kiloneed_cover_image", url);
      toast.success("Cover image updated!", { id: "biz-cover" });
    } catch {
      toast.error("Could not update cover image", { id: "biz-cover" });
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 gap-3 bg-card">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate("/marketplace")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Marketplace
            </Button>
            <h1 className="text-lg font-semibold text-foreground ml-auto">My Business</h1>
          </header>

          <main className="flex-1 overflow-y-auto">
            {loading && !profile ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading business profile...</span>
              </div>
            ) : !profile ? (
              <div className="max-w-2xl mx-auto p-6 text-center mt-12">
                <Store className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-semibold text-foreground">No business profile yet</h2>
                <p className="text-sm text-muted-foreground mt-2">Create a business profile to start selling products and services.</p>
                <Button className="mt-5 gradient-blue text-primary-foreground" onClick={() => navigate("/marketplace")}>
                  Go to Marketplace
                </Button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
                {/* Hidden file inputs for profile & cover photo */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />

                {/* Header card */}
                <Card className="gradient-card border-border overflow-hidden">
                  {/* Cover Image / Banner */}
                  <div className="relative h-36 sm:h-48 bg-gradient-to-r from-primary/30 via-blue-600/20 to-accent/30 group overflow-hidden">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt="Business Cover"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-medium text-foreground hover:bg-background transition-all shadow-sm cursor-pointer"
                      title="Change cover photo"
                    >
                      {uploadingCover ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span>{coverImage ? "Change Cover" : "Add Cover Photo"}</span>
                    </button>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 -mt-14 sm:-mt-16 relative z-10">
                      <div className="relative w-fit">
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl bg-card">
                          {(avatarImage || profile.logo) ? (
                            <AvatarImage
                              src={avatarImage || profile.logo}
                              alt={profile.businessName}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                            {profile.businessName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-md flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 cursor-pointer"
                          title="Change profile image"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Camera className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0 sm:pt-12">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{profile.businessName}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                <Tag className="h-3 w-3 mr-1" />{profile.category}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground font-mono">ID: {profile.id}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/marketplace")}>
                            <Pencil className="h-3.5 w-3.5" /> Manage Listings
                          </Button>
                        </div>
                        {profile.description && (
                          <p className="text-sm text-muted-foreground mt-3">{profile.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid sm:grid-cols-2 gap-3 mt-6">
                      {profile.email && <Detail icon={Mail} label="Email" value={profile.email} />}
                      {profile.phone && <Detail icon={Phone} label="Phone" value={profile.phone} />}
                      {profile.address && <Detail icon={MapPin} label="Address" value={profile.address} />}
                      {profile.website && <Detail icon={Globe} label="Website" value={profile.website} />}
                      {profile.taxId && <Detail icon={FileText} label="Tax / Business ID" value={profile.taxId} />}
                      {profile.fullName && <Detail icon={Store} label="Owner" value={profile.fullName} />}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="Products" value={products.length} icon={Package} />
                  <StatCard label="Services" value={services.length} icon={Wrench} />
                  <StatCard label="Total listings" value={myListings.length} icon={Tag} />
                </div>

                {/* Listings */}
                <Card className="gradient-card border-border">
                  <CardContent className="p-3 sm:p-4">
                    <Tabs defaultValue="all">
                      <TabsList>
                        <TabsTrigger value="all">All ({myListings.length})</TabsTrigger>
                        <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                        <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4"><ListingGrid items={myListings} /></TabsContent>
                      <TabsContent value="products" className="mt-4"><ListingGrid items={products} /></TabsContent>
                      <TabsContent value="services" className="mt-4"><ListingGrid items={services} /></TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <Card className="gradient-card border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ListingGrid({ items }: { items: Listing[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No listings yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          <div className="aspect-square overflow-hidden bg-muted">
            <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <CardContent className="p-2.5 space-y-1">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</p>
            <p className="text-sm font-bold text-gradient-blue">{formatPrice(p.price)}</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <Badge variant="outline" className="text-[9px] gap-1">
                {p.type === "service" ? <><Wrench className="h-2.5 w-2.5" />Service</> : <><Package className="h-2.5 w-2.5" />Product</>}
              </Badge>
              {p.type === "service" && p.duration && (
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{p.duration}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
