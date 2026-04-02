import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, UserPlus, UserCheck, UserX, Users, Clock, X, MapPin, ArrowRight,
} from "lucide-react";

// ─── Types ───
interface ConnectionRequest {
  id: number;
  name: string;
  avatar: string;
  mutualConnections: number;
  location?: string;
  requestAge?: string;
}

interface ConnectionSuggestion {
  id: number;
  name: string;
  avatar: string;
  mutualConnections: number;
  location: string;
  category: string;
}

interface Connection {
  id: number;
  name: string;
  avatar: string;
  mutualConnections: number;
  location: string;
  connectedSince: string;
}

// ─── Mock Data ───
const mockReceived: ConnectionRequest[] = [
  { id: 1, name: "Adaeze Okafor", avatar: "AO", mutualConnections: 12 },
  { id: 2, name: "Chinedu Eze", avatar: "CE", mutualConnections: 5 },
  { id: 3, name: "Fatima Bello", avatar: "FB", mutualConnections: 8 },
];

const mockSent: ConnectionRequest[] = [
  { id: 4, name: "Yusuf Abdullahi", avatar: "YA", mutualConnections: 3, requestAge: "2 days ago" },
  { id: 5, name: "Grace Amadi", avatar: "GA", mutualConnections: 7, requestAge: "5 days ago" },
];

const mockSuggestions: ConnectionSuggestion[] = [
  { id: 6, name: "Emeka Nwosu", avatar: "EN", mutualConnections: 15, location: "Lagos", category: "Electronics" },
  { id: 7, name: "Halima Sani", avatar: "HS", mutualConnections: 9, location: "Abuja", category: "Fashion" },
  { id: 8, name: "Tunde Bakare", avatar: "TB", mutualConnections: 4, location: "Lagos", category: "Electronics" },
  { id: 9, name: "Ngozi Ibe", avatar: "NI", mutualConnections: 11, location: "Port Harcourt", category: "Food" },
  { id: 10, name: "Segun Alade", avatar: "SA", mutualConnections: 6, location: "Lagos", category: "Auto Parts" },
  { id: 11, name: "Amina Yusuf", avatar: "AY", mutualConnections: 2, location: "Kano", category: "Textiles" },
];

const mockConnections: Connection[] = [
  { id: 12, name: "Bola Tinubu Jr", avatar: "BT", mutualConnections: 20, location: "Lagos", connectedSince: "Jan 2025" },
  { id: 13, name: "Kemi Adeosun", avatar: "KA", mutualConnections: 14, location: "Abuja", connectedSince: "Mar 2025" },
  { id: 14, name: "David Okonkwo", avatar: "DO", mutualConnections: 8, location: "Enugu", connectedSince: "Feb 2025" },
];

// ─── Card animation ───
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
  exit: { opacity: 0, x: -60, transition: { duration: 0.25 } },
};

export default function Connections() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [received, setReceived] = useState(mockReceived);
  const [sent, setSent] = useState(mockSent);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [connections] = useState(mockConnections);

  const accept = (id: number) => setReceived((r) => r.filter((x) => x.id !== id));
  const decline = (id: number) => setReceived((r) => r.filter((x) => x.id !== id));
  const cancelSent = (id: number) => setSent((s) => s.filter((x) => x.id !== id));
  const connect = (id: number) => setSuggestions((s) => s.filter((x) => x.id !== id));
  const removeSuggestion = (id: number) => setSuggestions((s) => s.filter((x) => x.id !== id));

  const filteredConnections = connections.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goToProfile = (id: number) => navigate(`/profile/${id}`);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Connections</h1>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections by name, category…"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="received" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="received" className="text-xs sm:text-sm">
                  Received{received.length > 0 && <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5">{received.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="sent" className="text-xs sm:text-sm">Sent</TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs sm:text-sm">Suggestions</TabsTrigger>
                <TabsTrigger value="my" className="text-xs sm:text-sm">My Connections</TabsTrigger>
              </TabsList>

              {/* ── Received ── */}
              <TabsContent value="received" className="space-y-3">
                <AnimatePresence>
                  {received.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-12">No pending requests.</p>
                  )}
                  {received.map((r, i) => (
                    <motion.div key={r.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(r.id)}>
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">{r.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => goToProfile(r.id)}>{r.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{r.mutualConnections} mutual connections</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => accept(r.id)}><UserCheck className="h-4 w-4 mr-1" />Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => decline(r.id)}><X className="h-4 w-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>

              {/* ── Sent ── */}
              <TabsContent value="sent" className="space-y-3">
                <AnimatePresence>
                  {sent.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-12">No pending sent requests.</p>
                  )}
                  {sent.map((s, i) => (
                    <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(s.id)}>
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">{s.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => goToProfile(s.id)}>{s.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.mutualConnections} mutual</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.requestAge}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => cancelSent(s.id)}><UserX className="h-4 w-4 mr-1" />Delete</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>

              {/* ── Suggestions ── */}
              <TabsContent value="suggestions">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {suggestions.map((s, i) => (
                      <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="flex flex-col items-center text-center gap-3 p-5">
                            <Avatar className="h-16 w-16 cursor-pointer" onClick={() => goToProfile(s.id)}>
                              <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">{s.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => goToProfile(s.id)}>{s.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1"><MapPin className="h-3 w-3" />{s.location}</p>
                              <p className="text-xs text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{s.mutualConnections} mutual</p>
                              <Badge variant="secondary" className="mt-1 text-[10px]">{s.category}</Badge>
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button size="sm" className="flex-1" onClick={() => connect(s.id)}><UserPlus className="h-4 w-4 mr-1" />Connect</Button>
                              <Button size="sm" variant="ghost" onClick={() => removeSuggestion(s.id)}><X className="h-4 w-4" /></Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* ── My Connections ── */}
              <TabsContent value="my" className="space-y-3">
                {filteredConnections.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-12">No connections found.</p>
                )}
                {filteredConnections.map((c, i) => (
                  <motion.div key={c.id} custom={i} variants={cardVariant} initial="hidden" animate="visible">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => goToProfile(c.id)}>
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">{c.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => goToProfile(c.id)}>{c.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                            <span><Users className="h-3 w-3 inline mr-1" />{c.mutualConnections} mutual</span>
                            <span>Connected {c.connectedSince}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => goToProfile(c.id)}>
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
