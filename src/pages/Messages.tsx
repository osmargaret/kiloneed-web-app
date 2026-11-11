import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { messagesApiService, api } from "@/services/apiClient";
import { getEcho } from "@/services/echo";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Send,
  AtSign,
  Clock,
  AlertTriangle,
  Package,
  ShoppingBag,
  VideoIcon,
  MessageCircle,
  MapPin,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
  type?: "text" | "image" | "video" | "voice" | "audio" | "location";
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
  const [selectedGuest, setSelectedGuest] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [mentioning, setMentioning] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ file: File; type: "image" | "video" } | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<Record<string, MessageItem[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Helper to format text with @mentions
  const renderMessageContent = (text: string, isMine: boolean) => {
    if (!text) return null;
    const parts = text.split(/(@[A-Za-z0-9_ -]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@") && part.length > 1) {
        return (
          <span
            key={index}
            className={`font-semibold px-1 py-0.5 rounded text-xs ${
              isMine
                ? "bg-primary-foreground/25 text-primary-foreground underline decoration-primary-foreground/50"
                : "bg-primary/15 text-primary underline decoration-primary/40"
            }`}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

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

          setCommodityThreads((prev) => {
            const tempLocal = prev.filter((t) => isNaN(Number(t.id)));
            const mapById = new Map<string, MessageThread>();
            [...tempLocal, ...mapped].forEach((t) => mapById.set(t.id, t));
            return Array.from(mapById.values());
          });
        })
        .catch(() => {});
    };

    fetchThreadList();
    const listInterval = setInterval(fetchThreadList, 4000);
    return () => {
      isMounted = false;
      clearInterval(listInterval);
    };
  }, []);

  // Poll active conversation messages every 2s
  useEffect(() => {
    if (view !== "conversation" || !selectedThread) return;
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
              type: m.media_type,
            }));
            setConversations((prev) => {
              const prevMsgs = prev[guestId] || [];
              if (
                prevMsgs.length === msgs.length &&
                prevMsgs[prevMsgs.length - 1]?.id === msgs[msgs.length - 1]?.id &&
                prevMsgs[prevMsgs.length - 1]?.text === msgs[msgs.length - 1]?.text &&
                prevMsgs[prevMsgs.length - 1]?.mediaUrl === msgs[msgs.length - 1]?.mediaUrl
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
          type: data.media_type,
        };

        setConversations((prev) => {
          const list = prev[activeGuestId] || [];
          if (list.some((m) => m.id === newMsg.id || (m.text === newMsg.text && m.isMine === newMsg.isMine && m.mediaUrl === newMsg.mediaUrl))) {
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
        messagesApiService
          .getConversations()
          .then((remoteConvs) => {
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
          })
          .catch(() => {});
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
    setMentioning(false);
  };

  // Resolves backend numeric conversation ID
  const resolveTargetConversationId = async (): Promise<number | null> => {
    if (!selectedThread) return null;
    const numThreadId = Number(selectedThread.id);
    if (!isNaN(numThreadId) && numThreadId > 0) {
      return numThreadId;
    }
    const guestId = selectedGuest?.id || selectedThread.guests[0]?.id;
    if (guestId && !isNaN(Number(guestId)) && Number(guestId) > 0) {
      try {
        const res: any = await messagesApiService.startConversation(Number(guestId));
        if (res?.conversationId) {
          setSelectedThread((prev) => (prev ? { ...prev, id: String(res.conversationId) } : prev));
          return Number(res.conversationId);
        }
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachedFile) || !selectedGuest || !selectedThread || isSending) return;

    setIsSending(true);
    let uploadedUrl: string | undefined = undefined;
    let uploadedType: string | undefined = undefined;

    try {
      if (attachedFile) {
        toast.loading("Uploading attachment...", { id: "media-upload" });
        try {
          const uploadRes = await api.upload(attachedFile.file);
          uploadedUrl = uploadRes.url;
          uploadedType = uploadRes.type || attachedFile.type;
          toast.success("Attachment ready!", { id: "media-upload" });
        } catch (uploadErr: any) {
          toast.error("Upload failed: " + (uploadErr.message || "Could not upload file"), { id: "media-upload" });
          setIsSending(false);
          return;
        }
      }

      const msgText = newMessage.trim();
      const localItem: MessageItem = {
        id: `m-${Date.now()}`,
        sender: "You",
        text: msgText || (uploadedType === "video" ? "🎥 Video" : "📷 Photo"),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        mediaUrl: uploadedUrl,
        type: (uploadedType as any) || (uploadedUrl ? "image" : "text"),
      };

      setConversations((prev) => ({
        ...prev,
        [selectedGuest.id]: [...(prev[selectedGuest.id] || []), localItem],
      }));

      const targetConvId = await resolveTargetConversationId();
      if (targetConvId) {
        await messagesApiService.sendMessage(targetConvId, msgText, uploadedUrl, uploadedType);
      }

      setNewMessage("");
      setAttachedFile(null);
      setMentioning(false);
      toast.success("Message sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    if (val.endsWith("@") || val.includes("@")) {
      setMentioning(true);
    } else {
      setMentioning(false);
    }
  };

  const handleFileSelect = (file: File, type: "image" | "video") => {
    setAttachedFile({ file, type });
    toast.info(`${type === "image" ? "Image" : "Video"} selected. Type a caption or hit send.`);
  };

  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (!selectedGuest || !selectedThread || isSending) return;

    setIsSending(true);
    toast.loading("Uploading voice note...", { id: "voice-upload" });

    try {
      const voiceFile = new File([blob], `voice-${Date.now()}.webm`, {
        type: blob.type || "audio/webm",
      });

      const uploadRes = await api.upload(voiceFile);
      toast.success("Voice note uploaded!", { id: "voice-upload" });

      const localItem: MessageItem = {
        id: `m-${Date.now()}`,
        sender: "You",
        text: "🎤 Voice note",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        mediaUrl: uploadRes.url,
        duration,
        type: "voice",
      };

      setConversations((prev) => ({
        ...prev,
        [selectedGuest.id]: [...(prev[selectedGuest.id] || []), localItem],
      }));

      const targetConvId = await resolveTargetConversationId();
      if (targetConvId) {
        await messagesApiService.sendMessage(targetConvId, "🎤 Voice note", uploadRes.url, "audio");
      }

      toast.success("Voice note sent!");
    } catch (err: any) {
      toast.error("Failed to send voice note: " + (err.message || "Error"), { id: "voice-upload" });
    } finally {
      setIsSending(false);
    }
  };

  const handleLocationSend = async (lat: number, lng: number, label: string) => {
    if (!selectedGuest || !selectedThread || isSending) return;

    setIsSending(true);
    try {
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const localItem: MessageItem = {
        id: `m-${Date.now()}`,
        sender: "You",
        text: label,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: true,
        mediaUrl: mapUrl,
        lat,
        lng,
        type: "location",
      };

      setConversations((prev) => ({
        ...prev,
        [selectedGuest.id]: [...(prev[selectedGuest.id] || []), localItem],
      }));

      const targetConvId = await resolveTargetConversationId();
      if (targetConvId) {
        await messagesApiService.sendMessage(targetConvId, label, mapUrl, "location");
      }

      toast.success("Location shared!");
    } catch (err: any) {
      toast.error("Failed to share location: " + (err.message || "Error"));
    } finally {
      setIsSending(false);
    }
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
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleVideoCall} title="Video call">
            <VideoIcon className="h-4 w-4" />
          </Button>
        }
      >
        <div className="flex flex-col h-full flex-1 min-h-0 justify-between">
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
                messages.map((msg) => {
                  const isAudio =
                    msg.type === "voice" ||
                    msg.type === "audio" ||
                    (msg.mediaUrl &&
                      (msg.mediaUrl.endsWith(".webm") ||
                        msg.mediaUrl.endsWith(".mp3") ||
                        msg.mediaUrl.endsWith(".wav") ||
                        msg.mediaUrl.includes("/audio")));

                  const isVideo =
                    msg.type === "video" ||
                    (msg.mediaUrl &&
                      (msg.mediaUrl.endsWith(".mp4") ||
                        msg.mediaUrl.endsWith(".mov") ||
                        msg.mediaUrl.includes("/video")));

                  const isLocation =
                    msg.type === "location" ||
                    (msg.mediaUrl && (msg.mediaUrl.includes("maps.google.com") || msg.mediaUrl.includes("openstreetmap")));

                  const isImage =
                    !isAudio &&
                    !isVideo &&
                    !isLocation &&
                    Boolean(msg.mediaUrl);

                  return (
                    <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                          msg.isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md border border-border/40"
                        }`}
                      >
                        {/* Audio / Voice Player */}
                        {isAudio && msg.mediaUrl && (
                          <div className="my-1.5 flex flex-col gap-1">
                            <audio
                              controls
                              src={msg.mediaUrl}
                              className="h-10 max-w-[250px] sm:max-w-[280px] rounded-lg"
                            />
                            {msg.duration ? (
                              <span
                                className={`text-[10px] ${
                                  msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                Voice note ({Math.floor(msg.duration / 60)}:
                                {(msg.duration % 60).toString().padStart(2, "0")})
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Video Player */}
                        {isVideo && msg.mediaUrl && (
                          <div className="my-1.5 rounded-xl overflow-hidden bg-black/20">
                            <video
                              controls
                              src={msg.mediaUrl}
                              className="max-h-64 max-w-full rounded-xl object-contain"
                            />
                          </div>
                        )}

                        {/* Image Preview */}
                        {isImage && msg.mediaUrl && (
                          <div className="my-1.5 rounded-xl overflow-hidden cursor-pointer group">
                            <img
                              src={msg.mediaUrl}
                              alt="Attachment"
                              className="max-h-64 max-w-full rounded-xl object-cover hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.mediaUrl, "_blank")}
                            />
                          </div>
                        )}

                        {/* Location Link */}
                        {isLocation && msg.mediaUrl && (
                          <a
                            href={msg.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2.5 rounded-xl my-1.5 text-xs font-medium transition-colors ${
                              msg.isMine
                                ? "bg-black/20 hover:bg-black/30 text-white"
                                : "bg-primary/10 hover:bg-primary/20 text-primary"
                            }`}
                          >
                            <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                            <span className="truncate underline font-medium">
                              {msg.text || "View Location on Google Maps"}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70 ml-auto" />
                          </a>
                        )}

                        {/* Message Text (when not redundant placeholder) */}
                        {msg.text &&
                          !(
                            msg.mediaUrl &&
                            (msg.text === "🎤 Voice note" ||
                              msg.text === "📷 Photo" ||
                              msg.text === "🎥 Video" ||
                              isLocation)
                          ) && (
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {renderMessageContent(msg.text, msg.isMine)}
                            </p>
                          )}

                        <p
                          className={`text-[10px] mt-1 text-right ${
                            msg.isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input area pinned to bottom */}
          <div className="border-t border-border bg-background/95 backdrop-blur-md px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shrink-0">
            <div className="space-y-2 max-w-3xl mx-auto relative">
              {/* Interactive @ Mention Dropdown */}
              {mentioning && selectedGuest && (
                <div className="absolute bottom-full left-0 mb-2 bg-popover/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2 z-50 min-w-[220px] animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Mention in chat
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted text-left text-sm transition-colors w-full group cursor-pointer"
                    onClick={() => {
                      const base = newMessage.replace(/@\w*$/, "");
                      setNewMessage(`${base}@${selectedGuest.name} `);
                      setMentioning(false);
                      inputRef.current?.focus();
                    }}
                  >
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarImage src={selectedGuest.avatar} />
                      <AvatarFallback className="text-[11px] bg-primary/20 text-primary font-bold">
                        {selectedGuest.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {selectedGuest.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Tap to mention</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Media Preview before sending */}
              {attachedFile && (
                <MediaPreview
                  file={attachedFile.file}
                  type={attachedFile.type}
                  onRemove={() => setAttachedFile(null)}
                />
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <AttachmentMenu
                  onFileSelect={handleFileSelect}
                  onLocationShare={() => setLocationOpen(true)}
                  disabled={isDraft || isSending}
                />

                <VoiceRecorder onSend={handleVoiceSend} disabled={isDraft || isSending} />

                <Button
                  variant={mentioning ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9 shrink-0 text-xs transition-colors"
                  onClick={() => {
                    if (mentioning) {
                      setMentioning(false);
                    } else {
                      setMentioning(true);
                      if (!newMessage.endsWith("@")) {
                        setNewMessage((prev) => (prev ? prev + " @" : "@"));
                      }
                      inputRef.current?.focus();
                    }
                  }}
                  disabled={isDraft || isSending}
                  title="Mention user"
                >
                  <AtSign className="h-4 w-4" />
                </Button>

                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-secondary/80 border-border text-sm"
                  disabled={isDraft || isSending}
                />

                <Button
                  onClick={handleSend}
                  disabled={(!newMessage.trim() && !attachedFile) || isDraft || isSending}
                  className="h-9 w-9 p-0 shrink-0 gradient-blue text-primary-foreground shadow-md"
                  title="Send message"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

  return (
    <MobileLayout title="Messages" notificationCount={0}>
      <div className="space-y-4 p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="needs" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Needs Messages
            </TabsTrigger>
            <TabsTrigger value="commodities" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Marketplace Chats
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                  Browse the feed or marketplace to start a conversation with buyers and sellers.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-border/60"
                    onClick={() => handleThreadClick(thread)}
                  >
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={thread.guests[0]?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {thread.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {thread.guests[0]?.name || thread.title}
                          </h4>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {thread.guests[0]?.time || "Recently"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {thread.guests[0]?.lastMessage || "Tap to chat"}
                        </p>
                      </div>
                      {thread.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                          {thread.unread}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Messages;
