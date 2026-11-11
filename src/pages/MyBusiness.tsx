import { useEffect, useState } from "react";
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
  Pencil, ArrowLeft, Tag, Clock, Star,
} from "lucide-react";

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

const formatPrice = (n: number) => "₦" + n.toLocaleString("en-NG");

export default function MyBusiness() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kiloneed_business");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    try {
      const raw = localStorage.getItem("kiloneed_listings");
      if (raw) setListings(JSON.parse(raw));
    } catch {}
  }, []);

  const myListings = profile ? listings.filter((l) => l.businessId === profile.id) : [];
  const products = myListings.filter((l) => (l.type ?? "product") === "product");
  const services = myListings.filter((l) => l.type === "service");

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
            {!profile ? (
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
                {/* Header card */}
                <Card className="gradient-card border-border overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-primary/30 to-accent/30" />
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 -mt-12 sm:-mt-16">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                        {profile.logo ? <AvatarImage src={profile.logo} alt={profile.businessName} /> : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                          {profile.businessName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 sm:pt-12">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">{profile.businessName}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                <Tag className="h-3 w-3 mr-1" />{profile.category}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground font-mono">{profile.id}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/marketplace")}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
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
