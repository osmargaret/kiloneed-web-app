import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { messagesApiService } from "@/services/apiClient";
import { getEcho } from "@/services/echo";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, AtSign, Clock, AlertTriangle, Package, ShoppingBag, VideoIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import AttachmentMenu from "@/components/chat/AttachmentMenu";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import LocationPicker from "@/components/chat/LocationPicker";
import MediaPreview from "@/components/chat/MediaPreview";

interface ThreadGuest {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface MessageThread {
  id: string;
  type: "need" | "commodity";
  title: string;
  status: "active" | "expired" | "draft";
  expiresAt?: string;
  unread: number;
  guests: ThreadGuest[];
}

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

type View = "list" | "guests" | "conversation";

const Messages = () => {
  const [activeTab, setActiveTab] = useState("needs");
  const [view, setView] = useState<View>("list");
  const [needThreads, setNeedThreads] = useState<MessageThread[]>([]);
  const [commodityThreads, setCommodityThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; name: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [mentioning, setMentioning] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File; type: "image" | "video" } | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [conversations, setConversations] =
    useState<Record<string, MessageItem[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Handle direct navigation to open chat with a seller or need author
  useEffect(() => {
    const state = location.state as {
      recipient?: string;
      recipientId?: string | number;
      productTitle?: string;
      productPrice?: number;
      productId?: number;
      productImage?: string;
      initialText?: string;
      threadType?: "need" | "commodity";
    } | null;

    if (!state || (!state.recipient && !state.productTitle)) return;

    const sellerName = state.recipient || "Seller";
    const guestId = state.recipientId ? String(state.recipientId) : `seller-${state.productId || Date.now()}`;
    const threadTitle = state.productTitle ? state.productTitle : `Chat with ${sellerName}`;
    const threadType = state.threadType || "commodity";

    const targetGuest: ThreadGuest = {
      id: guestId,
      name: sellerName,
      avatar: state.productImage || "",
      lastMessage: state.initialText || "Interested in listing",
      time: "Just now",
      unread: 0,
    };

    const targetThread: MessageThread = {
      id: `thread-${state.productId || Date.now()}`,
      type: threadType,
      title: threadTitle,
      status: "active",
      unread: 0,
      guests: [targetGuest],
    };

    if (threadType === "commodity") {
      setActiveTab("commodities");
      setCommodityThreads((prev) => {
        const exists = prev.find((t) => t.guests.some((g) => g.name === sellerName || g.id === guestId));
        return exists ? prev : [targetThread, ...prev];
      });
    } else {
      setActiveTab("needs");
      setNeedThreads((prev) => {
        const exists = prev.find((t) => t.guests.some((g) => g.name === sellerName || g.id === guestId));
        return exists ? prev : [targetThread, ...prev];
      });
    }

    setSelectedThread(targetThread);
    setSelectedGuest(targetGuest);
    setView("conversation");

    if (state.initialText) {
      setNewMessage(state.initialText);
    }

    // Connect to real backend conversation if valid user ID exists
    if (state.recipientId) {
      messagesApiService
        .startConversation(state.recipientId)
        .then((res: any) => {
          if (res?.conversationId) {
            const realId = String(res.conversationId);
            setSelectedThread((prev) => (prev ? { ...prev, id: realId } : prev));
          }
        })
        .catch(() => {});
    }
  }, [location.state]);

  // Poll conversations list in background every 4s for real-time thread updates
  useEffect(() => {
    let isMounted = true;

    const fetchThreadList = () => {
      messagesApiService
        .getConversations()
        .then((remoteConvs) => {
          if (!isMounted || !Array.isArray(remoteConvs)) return;
          const loadedThreads: MessageThread[] = remoteConvs.map((rc: any) => ({
            id: String(rc.id),
            type: rc.type === "commodity" ? "commodity" : "need",
            title: rc.title || `Conversation #${rc.id}`,
            status: "active",
            unread: rc.unread ? 1 : 0,
            guests: [
              {
                id: String(rc.otherUser?.id || rc.id),
                name: rc.otherUser?.name || rc.title || "User",
                avatar: rc.avatar || "",
                lastMessage: rc.lastMessage || "No messages yet",
                time: rc.lastMessageTime || "Recently",
                unread: rc.unread ? 1 : 0,
              },
            ],
          }));
          const needs = loadedThreads.filter((t) => t.type !== "commodity");
          const commodities = loadedThreads.filter((t) => t.type === "commodity");
          setNeedThreads((prev) => {
            const extra = prev.filter((p) => p.id.startsWith("thread-"));
            return [...extra, ...needs];
          });
          setCommodityThreads((prev) => {
            const extra = prev.filter((p) => p.id.startsWith("thread-"));
            return [...extra, ...commodities];
          });
        })
        .catch(() => {});
    };

    fetchThreadList();
    const interval = setInterval(fetchThreadList, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Poll active conversation every 2s for real-time incoming messages
  useEffect(() => {
    if (!selectedThread || view !== "conversation") return;

    let isSubscribed = true;

    const fetchCurrentConversation = () => {
      const numThreadId = Number(selectedThread.id);
      const guestId = selectedGuest?.id || selectedThread.guests[0]?.id || selectedThread.id;

      const promise =
        !isNaN(numThreadId) && numThreadId > 0
          ? messagesApiService.getConversation(numThreadId)
          : guestId && !isNaN(Number(guestId)) && Number(guestId) > 0
          ? messagesApiService.startConversation(Number(guestId)).then((r: any) => {
              if (r?.conversationId) {
                setSelectedThread((prev) => (prev ? { ...prev, id: String(r.conversationId) } : prev));
                return messagesApiService.getConversation(r.conversationId);
              }
              return null;
            })
          : Promise.resolve(null);

      promise
        .then((res: any) => {
          if (!isSubscribed || !res) return;
          if (Array.isArray(res?.messages)) {
            const currentUserId = localStorage.getItem("kiloneed_user_id");
            const msgs: MessageItem[] = res.messages.map((m: any) => ({
              id: String(m.id),
              sender:
                (currentUserId && String(m.sender_id) === String(currentUserId)) || m.isMine
                  ? "You"
                  : m.sender?.name || res.otherUser?.name || "User",
              text: m.text || "",
              time: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Just now",
              isMine: (currentUserId && String(m.sender_id) === String(currentUserId)) || Boolean(m.isMine),
              mediaUrl: m.media_url,
            }));
            setConversations((prev) => {
              const prevMsgs = prev[guestId] || [];
              if (
                prevMsgs.length === msgs.length &&
                prevMsgs[prevMsgs.length - 1]?.id === msgs[msgs.length - 1]?.id &&
                prevMsgs[prevMsgs.length - 1]?.text === msgs[msgs.length - 1]?.text
              ) {
                return prev;
              }
              return { ...prev, [guestId]: msgs };
            });
          }
        })
        .catch(() => {});
    };

    fetchCurrentConversation();
    const pollInterval = setInterval(fetchCurrentConversation, 2000);
    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [selectedThread?.id, selectedGuest?.id, view]);

  // Pusher Echo Real-Time WebSocket Listener
  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const currentUserId = localStorage.getItem("kiloneed_user_id");

    const channel = echo.channel("chat-global");
    channel.listen(".message.sent", (e: any) => {
      const data = e.message;
      if (!data) return;

      const isMyMessage = currentUserId && String(data.sender_id) === String(currentUserId);
      const activeThreadId = selectedThread?.id ? String(selectedThread.id) : null;
      const activeGuestId = selectedGuest?.id ? String(selectedGuest.id) : null;

      // Check if message belongs to the currently active conversation
      const isForActiveChat =
        (activeThreadId && String(data.conversation_id) === activeThreadId) ||
        (activeGuestId && (String(data.sender_id) === activeGuestId || String(data.receiver_id) === activeGuestId));

      if (isForActiveChat && activeGuestId) {
        const newMsg: MessageItem = {
          id: String(data.id || Date.now()),
          sender: isMyMessage ? "You" : data.sender || "User",
          text: data.text || "",
          time: data.time || "Just now",
          isMine: Boolean(isMyMessage),
          mediaUrl: data.media_url,
        };

        setConversations((prev) => {
          const list = prev[activeGuestId] || [];
          if (list.some((m) => m.id === newMsg.id || (m.text === newMsg.text && m.isMine === newMsg.isMine))) {
            return prev;
          }
          return { ...prev, [activeGuestId]: [...list, newMsg] };
        });
      }

      // If message is incoming from another user, show live notification toast
      if (!isMyMessage) {
        toast.info(`New message from ${data.sender || "User"}`, {
          description: data.text ? (data.text.length > 60 ? data.text.slice(0, 60) + "..." : data.text) : "Sent an attachment",
        });

        // Background reload conversation threads to update last messages
        messagesApiService.getConversations().then((remoteConvs) => {
          if (Array.isArray(remoteConvs)) {
            const mapped: MessageThread[] = remoteConvs.map((rc: any) => ({
              id: String(rc.id),
              title: rc.title || "Chat",
              type: "commodity",
              status: "active",
              unread: rc.unread ? 1 : 0,
              guests: [
                {
                  id: String(rc.otherUser?.id || rc.id),
                  name: rc.otherUser?.name || rc.title || "User",
                  avatar: rc.avatar || "",
                  lastMessage: rc.lastMessage || "No messages yet",
                  time: rc.lastMessageTime || "Recently",
                  unread: rc.unread ? 1 : 0,
                },
              ],
            }));
            setCommodityThreads(mapped);
          }
        }).catch(() => {});
      }
    });

    return () => {
      channel.stopListening(".message.sent");
    };
  }, [selectedGuest?.id, selectedThread?.id]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (view === "conversation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, view, selectedGuest]);

  const handleThreadClick = (thread: MessageThread) => {
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

  const handleSend = async () => {
    if (!newMessage.trim() && !attachedFile) return;
    if (attachedFile) {
      toast.success(`${attachedFile.type === "image" ? "Image" : "Video"} sent!`);
      setAttachedFile(null);
    }
    if (newMessage.trim() && selectedGuest && selectedThread) {
      const msgText = newMessage.trim();
      const item: MessageItem = {
        id: `m-${Date.now()}`,
        sender: "You",
        text: msgText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
      };
      setConversations((prev) => ({
        ...prev,
        [selectedGuest.id]: [...(prev[selectedGuest.id] || []), item],
      }));

      const numThreadId = Number(selectedThread.id);
      if (!isNaN(numThreadId) && numThreadId > 0) {
        messagesApiService.sendMessage(numThreadId, msgText).catch(() => {});
      } else {
        const numGuestId = Number(selectedGuest.id);
        if (!isNaN(numGuestId) && numGuestId > 0) {
          messagesApiService
            .startConversation(numGuestId)
            .then((res: any) => {
              if (res?.conversationId) {
                setSelectedThread((prev) => (prev ? { ...prev, id: String(res.conversationId) } : prev));
                messagesApiService.sendMessage(res.conversationId, msgText).catch(() => {});
              }
            })
            .catch(() => {});
        }
      }
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
  const threads = activeTab === "needs" ? needThreads : commodityThreads;
  const messages = selectedGuest ? conversations[selectedGuest.id] || [] : [];

  // Conversation view — full screen, hide bottom nav
  if (view === "conversation" && selectedGuest) {
    return (
      <MobileLayout
        title={selectedGuest.name}
        showBack
        onBack={handleBack}
        hideBottomNav
        headerRight={
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleVideoCall}>
            <VideoIcon className="h-4 w-4" />
          </Button>
        }
      >        <div className="flex flex-col h-full flex-1 min-h-0 justify-between">
          {isDraft && (
            <div className="bg-muted px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground border-b border-border shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Draft mode — messages hidden.
            </div>
          )}
          <ScrollArea className="flex-1 min-h-0 px-3 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                    Send a message to start chatting with {selectedGuest.name}.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                      msg.isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      <p className="text-sm">
                        {msg.mention ? (
                          <>
                            {msg.text.split(`@${msg.mention}`).map((part, i, arr) => (
                              <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <span className={`font-semibold ${
                                    msg.isMine ? "text-primary-foreground/90 underline" : "text-primary underline"
                                  }`}>
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
                ))
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input area pinned to bottom */}
          <div className="border-t border-border bg-background/95 backdrop-blur-md px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shrink-0">
            <div className="space-y-2 max-w-3xl mx-auto">
              {attachedFile && (
                <MediaPreview
                  file={attachedFile.file}
                  type={attachedFile.type}
                  onRemove={() => setAttachedFile(null)}
                />
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AttachmentMenu
                  onFileSelect={handleFileSelect}
                  onLocationShare={() => setLocationOpen(true)}
                  disabled={isDraft}
                />
                <VoiceRecorder onSend={handleVoiceSend} disabled={isDraft} />
                <Button
                  variant={mentioning ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9 shrink-0 text-xs"
                  onClick={() => {
                    setMentioning(!mentioning);
                    setNewMessage(mentioning ? newMessage.replace(/@$/, "") : newMessage + "@");
                  }}
                  disabled={isDraft}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-secondary/80 border-border text-sm"
                  disabled={isDraft}
                />
                <Button onClick={handleSend} disabled={(!newMessage.trim() && !attachedFile) || isDraft} className="h-9 w-9 p-0 shrink-0 gradient-blue text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <LocationPicker
          open={locationOpen}
          onOpenChange={setLocationOpen}
          onSend={handleLocationSend}
        />
      </MobileLayout>
    );
  }

  // Guest list view
  if (view === "guests" && selectedThread) {
    return (
      <MobileLayout
        title={selectedThread.title}
        showBack
        onBack={handleBack}
      >
        <div className="p-3 space-y-3">
          <p className="text-sm text-muted-foreground">Select a conversation</p>
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
      </MobileLayout>
    );
  }

  // List view
  return (
    <MobileLayout title="Messages">
      <div className="p-3 max-w-3xl mx-auto space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 h-8 p-0.5 rounded-lg bg-muted/60 border border-border/50">
            <TabsTrigger value="needs" className="gap-1.5 text-[11px] font-medium py-1">
              <Package className="h-3.5 w-3.5" /> Needs
            </TabsTrigger>
            <TabsTrigger value="commodities" className="gap-1.5 text-[11px] font-medium py-1">
              <ShoppingBag className="h-3.5 w-3.5" /> Commodities
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {threads.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No messages yet</p>
            )}
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  thread.status === "expired" ? "opacity-50" : ""
                } ${thread.status === "draft" ? "border-dashed border-muted-foreground/40" : ""}`}
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
    </MobileLayout>
  );
};

export default Messages;
