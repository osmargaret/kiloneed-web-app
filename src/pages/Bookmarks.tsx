import { useState } from "react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Package, ShoppingBag, Search, Trash2, ExternalLink, Clock, MapPin } from "lucide-react";

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
  image?: string;
}

const mockBookmarks: BookmarkItem[] = [
  { id: "1", type: "need", title: "Looking for a web developer", description: "Need an experienced React developer for a 3-month project. Must have TypeScript experience.", author: "Sarah Chen", location: "Lagos, Nigeria", savedAt: "2d ago", expiresAt: "Apr 15, 2026" },
  { id: "2", type: "need", title: "Bulk office supplies needed", description: "Desks, chairs, monitors for 25 employees. Budget: $15k–$20k.", author: "Alex Turner", location: "Abuja, Nigeria", savedAt: "3d ago", expiresAt: "Apr 30, 2026" },
  { id: "3", type: "commodity", title: "Premium Wireless Headphones", description: "Noise-cancelling, 30hr battery, Bluetooth 5.3. Limited stock.", author: "Lisa Park", location: "Lagos, Nigeria", savedAt: "1w ago", price: "$119.99" },
  { id: "4", type: "need", title: "Graphic designer for branding", description: "Complete brand identity package including logo, colors, and guidelines.", author: "Mike Johnson", location: "Port Harcourt", savedAt: "1w ago", expiresAt: "Mar 20, 2026", expired: true },
  { id: "5", type: "commodity", title: "Ergonomic Office Chair", description: "Lumbar support, adjustable height, mesh back. 2-year warranty.", author: "Tom Wilson", location: "Lagos, Nigeria", savedAt: "2w ago", price: "$349.00" },
  { id: "6", type: "commodity", title: "4K Ultra HD Monitor 27\"", description: "IPS panel, 144Hz, USB-C hub, height adjustable stand.", author: "Grace Obi", location: "Abuja, Nigeria", savedAt: "2w ago", price: "$449.00" },
];

const Bookmarks = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(mockBookmarks);

  const filtered = bookmarks
    .filter(b => activeTab === "all" || b.type === activeTab)
    .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Bookmark className="h-6 w-6 text-primary" />
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Bookmarks</h1>
              <Badge variant="secondary">{bookmarks.length} saved</Badge>
            </div>
          </div>

          <div className="p-3 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="need" className="gap-1.5"><Package className="h-3.5 w-3.5" /> Needs</TabsTrigger>
                <TabsTrigger value="commodity" className="gap-1.5"><ShoppingBag className="h-3.5 w-3.5" /> Commodities</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <ScrollArea className="h-[calc(100vh-260px)]">
                  <div className="space-y-3">
                    {filtered.length === 0 && (
                      <p className="text-center text-muted-foreground py-12">No bookmarks found</p>
                    )}
                    {filtered.map(item => (
                      <Card key={item.id} className={`transition-colors hover:bg-muted/30 ${item.expired ? "opacity-60" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === "need" ? "bg-primary/10" : "bg-accent"}`}>
                              {item.type === "need" ? <Package className="h-5 w-5 text-primary" /> : <ShoppingBag className="h-5 w-5 text-accent-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                                <Badge variant="outline" className="text-xs">{item.type === "need" ? "Need" : "Commodity"}</Badge>
                                {item.expired && <Badge variant="destructive" className="text-xs">Expired</Badge>}
                                {item.price && <Badge variant="secondary" className="text-xs">{item.price}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{item.author.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
                                  </Avatar>
                                  {item.author}
                                </span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                                {item.expiresAt && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.expiresAt}</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => toast.info(`Opening "${item.title}"...`)}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { removeBookmark(item.id); toast.success("Bookmark removed"); }} title="Remove">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground/60 mt-2 text-right">Saved {item.savedAt}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Bookmarks;
