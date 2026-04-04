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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-3 sm:px-4 gap-3 bg-card">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Connections</h1>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 max-w-5xl mx-auto w-full">
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections…"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="received" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="received" className="text-xs">
                  Received{received.length > 0 && <Badge variant="destructive" className="ml-1 text-[10px] px-1.5">{received.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="sent" className="text-xs">Sent</TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs">Suggest</TabsTrigger>
                <TabsTrigger value="my" className="text-xs">My List</TabsTrigger>
              </TabsList>

              <TabsContent value="received" className="space-y-3">
                <AnimatePresence>
                  {received.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-12">No pending requests.</p>
                  )}
                  {received.map((r, i) => (
                    <motion.div key={r.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 cursor-pointer shrink-0" onClick={() => goToProfile(r.id)}>
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">{r.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm cursor-pointer hover:underline truncate" onClick={() => goToProfile(r.id)}>{r.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{r.mutualConnections} mutual</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs" onClick={() => accept(r.id)}><UserCheck className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Accept</span></Button>
                            <Button size="sm" variant="outline" className="h-7 sm:h-8 px-2" onClick={() => decline(r.id)}><X className="h-3.5 w-3.5" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="sent" className="space-y-3">
                <AnimatePresence>
                  {sent.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-12">No pending sent requests.</p>
                  )}
                  {sent.map((s, i) => (
                    <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                          <Avatar className="h-10 w-10 cursor-pointer shrink-0" onClick={() => goToProfile(s.id)}>
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">{s.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm cursor-pointer hover:underline truncate" onClick={() => goToProfile(s.id)}>{s.name}</p>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.mutualConnections}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.requestAge}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" className="h-7 sm:h-8 text-xs px-2 sm:px-3 shrink-0" onClick={() => cancelSent(s.id)}>
                            <UserX className="h-3.5 w-3.5 sm:mr-1" /><span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="suggestions">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {suggestions.map((s, i) => (
                      <motion.div key={s.id} custom={i} variants={cardVariant} initial="hidden" animate="visible" exit="exit">
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="flex flex-col items-center text-center gap-2 p-3 sm:p-5">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer" onClick={() => goToProfile(s.id)}>
                              <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm sm:text-lg">{s.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 w-full">
                              <p className="font-medium text-foreground text-xs sm:text-sm cursor-pointer hover:underline truncate" onClick={() => goToProfile(s.id)}>{s.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{s.location}</p>
                              <p className="text-[10px] text-muted-foreground">{s.mutualConnections} mutual</p>
                              <Badge variant="secondary" className="mt-1 text-[9px] sm:text-[10px]">{s.category}</Badge>
                            </div>
                            <div className="flex gap-1.5 w-full">
                              <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => connect(s.id)}><UserPlus className="h-3.5 w-3.5 mr-1" />Connect</Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => removeSuggestion(s.id)}><X className="h-3.5 w-3.5" /></Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="my" className="space-y-3">
                {filteredConnections.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-12">No connections found.</p>
                )}
                {filteredConnections.map((c, i) => (
                  <motion.div key={c.id} custom={i} variants={cardVariant} initial="hidden" animate="visible">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                        <Avatar className="h-10 w-10 cursor-pointer shrink-0" onClick={() => goToProfile(c.id)}>
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">{c.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm cursor-pointer hover:underline truncate" onClick={() => goToProfile(c.id)}>{c.name}</p>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                            <span>{c.mutualConnections} mutual</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2 shrink-0" onClick={() => goToProfile(c.id)}>
                          View
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