import { useState, useEffect } from "react";
import { toast } from "sonner";
import { needsApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingBag, Search, Trash2, ExternalLink, Clock, MapPin } from "lucide-react";

interface BookmarkItem {
  id: string;
  type: "need" | "commodity";
  title: string;
  description: string;
  author: string;
  location: string;
  savedAt: string;
  expiresAt?: string;
  expired?: boolean;
  price?: string;
}

const getInitialBookmarks = (): BookmarkItem[] => {
  try {
    const raw = localStorage.getItem("kiloneed_bookmarks");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
};

const Bookmarks = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(getInitialBookmarks);

  useEffect(() => {
    needsApiService
      .getBookmarks()
      .then((remoteBookmarks) => {
        if (Array.isArray(remoteBookmarks)) {
          setBookmarks(remoteBookmarks);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = bookmarks
    .filter(b => activeTab === "all" || b.type === activeTab)
    .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  const removeBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem("kiloneed_bookmarks", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (/^\d+$/.test(String(id))) {
      needsApiService.toggleBookmark(id).catch(() => {});
    }
    toast.success("Bookmark removed");
  };

  return (
    <MobileLayout title="Bookmarks">
      <div className="p-3 max-w-3xl mx-auto w-full space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs">All ({bookmarks.length})</TabsTrigger>
            <TabsTrigger value="need" className="gap-1 text-xs"><Package className="h-3 w-3" /> Needs</TabsTrigger>
            <TabsTrigger value="commodity" className="gap-1 text-xs"><ShoppingBag className="h-3 w-3" /> Items</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-3">
            <div className="space-y-2.5">
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No bookmarks found</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Try a different search or tab</p>
                </div>
              )}
              {filtered.map(item => (
                <Card key={item.id} className={`transition-all active:scale-[0.98] ${item.expired ? "opacity-50" : ""}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2.5">
                      {/* Type icon */}
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.type === "need" ? "bg-primary/10" : "bg-accent"}`}>
                        {item.type === "need" ? <Package className="h-4 w-4 text-primary" /> : <ShoppingBag className="h-4 w-4 text-accent-foreground" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-semibold text-foreground text-[13px] leading-tight line-clamp-1">{item.title}</h3>
                          <div className="flex gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="View" onClick={() => toast.info(`Opening "${item.title}"...`)}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => removeBookmark(item.id)} title="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.price && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">{item.price}</Badge>}
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">{item.type === "need" ? "Need" : "Item"}</Badge>
                          {item.expired && <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Expired</Badge>}
                        </div>

                        {/* Author & location */}
                        <div className="flex items-center gap-2.5 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Avatar className="h-3.5 w-3.5">
                              <AvatarFallback className="text-[7px] bg-primary/10 text-primary">{item.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            {item.author}
                          </span>
                          <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{item.location}</span>
                          {item.expiresAt && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{item.expiresAt}</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right">Saved {item.savedAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Bookmarks;

