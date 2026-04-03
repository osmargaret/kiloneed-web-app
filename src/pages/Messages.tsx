import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, AtSign, Clock, AlertTriangle, Package, ShoppingBag, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import AttachmentMenu from "@/components/chat/AttachmentMenu";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import LocationPicker from "@/components/chat/LocationPicker";
import MediaPreview from "@/components/chat/MediaPreview";

// Mock data
const mockNeedThreads = [
  {
    id: "n1",
    type: "need" as const,
    title: "Looking for a web developer",
    status: "active",
    expiresAt: "2026-04-15",
    unread: 3,
    guests: [
      { id: "g1", name: "Sarah Chen", avatar: "", lastMessage: "I can help with React projects", time: "2m ago", unread: 2 },
      { id: "g2", name: "Mike Johnson", avatar: "", lastMessage: "What's your budget range?", time: "1h ago", unread: 1 },
      { id: "g3", name: "Emma Davis", avatar: "", lastMessage: "Sent you my portfolio", time: "3h ago", unread: 0 },
    ],
  },
  {
    id: "n2",
    type: "need" as const,
    title: "Need office furniture ASAP",
    status: "active",
    expiresAt: "2026-04-05",
    unread: 1,
    guests: [
      { id: "g4", name: "Alex Turner", avatar: "", lastMessage: "We have standing desks in stock", time: "30m ago", unread: 1 },
    ],
  },
  {
    id: "n3",
    type: "need" as const,
    title: "Graphic designer needed",
    status: "expired",
    expiresAt: "2026-03-20",
    unread: 0,
    guests: [],
  },
];

const mockCommodityThreads = [
  {
    id: "c1",
    type: "commodity" as const,
    title: "Premium Wireless Headphones",
    status: "active",
    unread: 2,
    guests: [
      { id: "g5", name: "Lisa Park", avatar: "", lastMessage: "Is this still available?", time: "15m ago", unread: 1 },
      { id: "g6", name: "John Doe", avatar: "", lastMessage: "Can you do bulk pricing?", time: "2h ago", unread: 1 },
    ],
  },
  {
    id: "c2",
    type: "commodity" as const,
    title: "Ergonomic Office Chair",
    status: "draft",
    unread: 0,
    guests: [
      { id: "g7", name: "Tom Wilson", avatar: "", lastMessage: "Draft - hidden", time: "1d ago", unread: 0 },
    ],
  },
];

type MessageItem = {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
  mention?: string;
  type?: "text" | "image" | "video" | "voice" | "location";
  mediaUrl?: string;
  duration?: number;
  lat?: number;
  lng?: number;
};

const mockConversations: Record<string, MessageItem[]> = {
  g1: [
    { id: "m1", sender: "Sarah Chen", text: "Hi! I saw your need for a web developer.", time: "10:00 AM", isMine: false },
    { id: "m2", sender: "You", text: "Yes! We need someone with React experience.", time: "10:05 AM", isMine: true },
    { id: "m3", sender: "Sarah Chen", text: "I can help with React projects. I have 5 years of experience.", time: "10:08 AM", isMine: false },
    { id: "m4", sender: "You", text: "@Mike Johnson can you also take a look at this?", time: "10:12 AM", isMine: true, mention: "Mike Johnson" },
    { id: "m5", sender: "Sarah Chen", text: "Here's a link to my portfolio. Let me know if you'd like to discuss further!", time: "10:15 AM", isMine: false },
  ],
  g2: [
    { id: "m6", sender: "Mike Johnson", text: "Hello, I'm interested in the developer role.", time: "9:00 AM", isMine: false },
    { id: "m7", sender: "You", text: "Great! What's your hourly rate?", time: "9:15 AM", isMine: true },
    { id: "m8", sender: "Mike Johnson", text: "What's your budget range?", time: "9:30 AM", isMine: false },
  ],
  g5: [
    { id: "m9", sender: "Lisa Park", text: "Is this still available?", time: "11:00 AM", isMine: false },
  ],
  g6: [
    { id: "m10", sender: "John Doe", text: "Hi, I'm interested in bulk orders.", time: "8:00 AM", isMine: false },
    { id: "m11", sender: "You", text: "Sure, how many units?", time: "8:30 AM", isMine: true },
    { id: "m12", sender: "John Doe", text: "Can you do bulk pricing?", time: "9:00 AM", isMine: false },
  ],
};

type View = "list" | "guests" | "conversation";

const Messages = () => {
  const [activeTab, setActiveTab] = useState("needs");
  const [view, setView] = useState<View>("list");
  const [selectedThread, setSelectedThread] = useState<typeof mockNeedThreads[0] | typeof mockCommodityThreads[0] | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; name: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [mentioning, setMentioning] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File; type: "image" | "video" } | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);

  const handleThreadClick = (thread: typeof mockNeedThreads[0] | typeof mockCommodityThreads[0]) => {
    if (thread.status === "expired") return;
    setSelectedThread(thread);
    if (thread.guests.length === 1) {
      setSelectedGuest(thread.guests[0]);
      setView("conversation");
    } else {
      setView("guests");
    }
  };

  const handleGuestClick = (guest: { id: string; name: string }) => {
    setSelectedGuest(guest);
    setView("conversation");
  };

  const handleBack = () => {
    if (view === "conversation" && selectedThread && selectedThread.guests.length > 1) {
      setView("guests");
      setSelectedGuest(null);
    } else {
      setView("list");
      setSelectedThread(null);
      setSelectedGuest(null);
    }
    setAttachedFile(null);
  };

  const handleSend = () => {
    if (!newMessage.trim() && !attachedFile) return;
    if (attachedFile) {
      toast.success(`${attachedFile.type === "image" ? "Image" : "Video"} sent!`);
      setAttachedFile(null);
    }
    if (newMessage.trim()) {
      toast.success("Message sent!");
    }
    setNewMessage("");
    setMentioning(false);
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    setMentioning(val.includes("@"));
  };

  const handleFileSelect = (file: File, type: "image" | "video") => {
    setAttachedFile({ file, type });
    toast.info(`${type === "image" ? "Image" : "Video"} attached. Send when ready.`);
  };

  const handleVoiceSend = (blob: Blob, duration: number) => {
    toast.success(`Voice note sent (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`);
  };

  const handleLocationSend = (lat: number, lng: number, label: string) => {
    toast.success(`Location shared: ${label}`);
  };

  const handleVideoCall = () => {
    toast.info("Video call feature coming soon! This requires WebRTC setup.");
  };

  const isDraft = selectedThread?.status === "draft";
  const threads = activeTab === "needs" ? mockNeedThreads : mockCommodityThreads;
  const messages = selectedGuest ? mockConversations[selectedGuest.id] || [] : [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {view !== "list" && (
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                {view === "list" && "Messages"}
                {view === "guests" && selectedThread?.title}
                {view === "conversation" && selectedGuest?.name}
              </h1>
              {view === "conversation" && selectedThread && (
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {selectedThread.type === "need" ? "Need" : "Commodity"}: {selectedThread.title}
                </Badge>
              )}
              {view === "conversation" && (
                <Button variant="outline" size="icon" className="ml-auto" onClick={handleVideoCall} title="Video call">
                  <VideoIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* LIST VIEW */}
            {view === "list" && (
              <div className="p-3 sm:p-6 max-w-3xl mx-auto space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="needs" className="gap-2">
                      <Package className="h-4 w-4" /> Needs
                    </TabsTrigger>
                    <TabsTrigger value="commodities" className="gap-2">
                      <ShoppingBag className="h-4 w-4" /> Commodities
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-4 space-y-3">
                    {threads.length === 0 && (
                      <p className="text-center text-muted-foreground py-12">No messages yet</p>
                    )}
                    {threads.map((thread) => (
                      <Card
                        key={thread.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${thread.status === "expired" ? "opacity-50" : ""} ${thread.status === "draft" ? "border-dashed border-muted-foreground/40" : ""}`}
                        onClick={() => handleThreadClick(thread)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">{thread.title}</h3>
                              {thread.status === "expired" && (
                                <Badge variant="destructive" className="text-xs gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Expired
                                </Badge>
                              )}
                              {thread.status === "draft" && (
                                <Badge variant="secondary" className="text-xs">Draft</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {thread.guests.length} conversation{thread.guests.length !== 1 ? "s" : ""}
                              {"expiresAt" in thread && thread.status === "active" && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Expires {thread.expiresAt}
                                </span>
                              )}
                            </p>
                          </div>
                          {thread.unread > 0 && (
                            <Badge className="bg-primary text-primary-foreground ml-3">{thread.unread}</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* GUESTS VIEW */}
            {view === "guests" && selectedThread && (
              <div className="p-3 sm:p-6 max-w-3xl mx-auto space-y-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Replies categorized by guest — click to view conversation
                </p>
                {selectedThread.guests.map((guest) => (
                  <Card
                    key={guest.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => handleGuestClick(guest)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={guest.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {guest.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{guest.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{guest.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">{guest.time}</span>
                        {guest.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs">{guest.unread}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* CONVERSATION VIEW */}
            {view === "conversation" && selectedGuest && (
              <div className="flex flex-col h-full">
                {isDraft && (
                  <div className="bg-muted px-6 py-3 flex items-center gap-2 text-sm text-muted-foreground border-b border-border">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    This {selectedThread?.type} is in draft mode. Messages are hidden and new messages won't be delivered.
                  </div>
                )}
                <ScrollArea className="flex-1 px-3 sm:px-6 py-4">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                          <p className="text-sm">
                            {msg.mention ? (
                              <>
                                {msg.text.split(`@${msg.mention}`).map((part, i, arr) => (
                                  <span key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                      <span className={`font-semibold ${msg.isMine ? "text-primary-foreground/90 underline" : "text-primary underline"}`}>
                                        @{msg.mention}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </>
                            ) : msg.text}
                          </p>
                          <p className={`text-xs mt-1 ${msg.isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Chat Input Area */}
                <div className="border-t border-border px-3 sm:px-6 py-3 sm:py-4">
                  <div className="max-w-3xl mx-auto space-y-2">
                    {attachedFile && (
                      <MediaPreview
                        file={attachedFile.file}
                        type={attachedFile.type}
                        onRemove={() => setAttachedFile(null)}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <AttachmentMenu
                        onFileSelect={handleFileSelect}
                        onLocationShare={() => setLocationOpen(true)}
                        disabled={isDraft}
                      />
                      <VoiceRecorder onSend={handleVoiceSend} disabled={isDraft} />
                      <Button
                        variant={mentioning ? "default" : "outline"}
                        size="icon"
                        onClick={() => {
                          setMentioning(!mentioning);
                          setNewMessage(mentioning ? newMessage.replace(/@$/, "") : newMessage + "@");
                        }}
                        title="Mention someone"
                        disabled={isDraft}
                      >
                        <AtSign className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1"
                        disabled={isDraft}
                      />
                      <Button onClick={handleSend} disabled={(!newMessage.trim() && !attachedFile) || isDraft}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <LocationPicker
            open={locationOpen}
            onOpenChange={setLocationOpen}
            onSend={handleLocationSend}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Messages;
