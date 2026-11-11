import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, groupsApiService, productsApiService, walletApiService } from "@/services/apiClient";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Plus, Users, Lock, Sparkles, Globe, ChevronLeft, Settings,
  ShoppingBag, Home, UserPlus, UserCheck, UserX, Crown, Shield, User,
  Image as ImageIcon, Wallet, ArrowDownToLine, Check, X, Clock,
  AlertTriangle, ImagePlus, Send, Loader2, Upload, Camera, Trash2,
  ExternalLink, MapPin, Tag,
} from "lucide-react";
import GroupPost, { GroupPostData } from "@/components/GroupPost";
import GroupMessageModal from "@/components/GroupMessageModal";
import { HeaderActionButton } from "@/components/HeaderActionButton";

// ─── Types ───
type GroupType = "open" | "closed" | "special";
type MemberRole = "admin" | "moderator" | "member";

interface GroupMember {
  id: number;
  name: string;
  avatar: string;
  role: MemberRole;
  joinedAt: string;
}

interface DueTransaction {
  id: number;
  member: string;
  amount: number;
  date: string;
  type: "payment" | "withdrawal";
  status: "completed" | "pending" | "approved";
}

interface Group {
  id: number;
  title: string;
  description: string;
  image: string;
  type: GroupType;
  category: string;
  membersCount: number;
  maxMembers: number;
  isMember: boolean;
  isAdmin: boolean;
  isPending: boolean;
  members: GroupMember[];
  dues?: { total: number; frequency: string; amount: number; transactions: DueTransaction[] };
}

interface Invitation {
  id: number;
  groupId: number;
  groupTitle: string;
  groupImage: string;
  groupType: GroupType;
  invitedBy: string;
}

interface JoinRequest {
  id: number;
  groupId: number;
  groupTitle: string;
  userName: string;
  userAvatar: string;
  requestedAt: string;
}

const categories = ["All", "Electronics", "Fashion", "Vehicles", "Real Estate", "Food", "Services", "Health", "Sports"];

const PRESET_BANNERS = [
  { label: "Tech", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=300&fit=crop" },
  { label: "Business", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop" },
  { label: "Auto", url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=300&fit=crop" },
  { label: "Fashion", url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=300&fit=crop" },
  { label: "Real Estate", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=300&fit=crop" },
  { label: "Food", url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=300&fit=crop" },
];

const typeIcon = (type: GroupType) => {
  if (type === "open") return <Globe className="h-3.5 w-3.5" />;
  if (type === "closed") return <Lock className="h-3.5 w-3.5" />;
  return <Sparkles className="h-3.5 w-3.5" />;
};

const typeColor = (type: GroupType) => {
  if (type === "open") return "text-green-400";
  if (type === "closed") return "text-yellow-400";
  return "text-primary";
};

const roleIcon = (role: MemberRole) => {
  if (role === "admin") return <Crown className="h-3.5 w-3.5 text-yellow-400" />;
  if (role === "moderator") return <Shield className="h-3.5 w-3.5 text-primary" />;
  return <User className="h-3.5 w-3.5 text-muted-foreground" />;
};

const formatCurrency = (n: number) => "₦" + Number(n || 0).toLocaleString("en-NG");

const MOCK_TITLES = new Set([
  "lagos tech traders",
  "abuja auto connect",
  "nigerian fashion hub",
  "ph real estate circle",
  "kano agribusiness network",
  "ibadan services hub",
  "exclusive gadget deals",
  "lekki homeowners",
]);

const getInitialGroups = (): Group[] => {
  try {
    const raw = localStorage.getItem("kiloneed_groups_cache");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed.filter((g: any) => !MOCK_TITLES.has((g.title || "").toLowerCase().trim()));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem("kiloneed_groups_cache", JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch {}
  return [];
};

const getInitialGroupPosts = (): Record<number, GroupPostData[]> => {
  try {
    const raw = localStorage.getItem("kiloneed_group_posts_cache");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  return {};
};

const Groups = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>(getInitialGroups);
  const [loadingGroups, setLoadingGroups] = useState(groups.length === 0);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [mainTab, setMainTab] = useState<"all" | "my" | "invitations" | "requests">("all");
  const [viewGroup, setViewGroup] = useState<Group | null>(null);
  const [groupTab, setGroupTab] = useState("needs");
  const [showCreate, setShowCreate] = useState(false);

  // Commodities state for the group's category
  const [commodities, setCommodities] = useState<any[]>([]);
  const [loadingCommodities, setLoadingCommodities] = useState(false);

  // Create Group State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<GroupType>("open");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newImage, setNewImage] = useState("");
  const [newDuesAmount, setNewDuesAmount] = useState("");
  const [newDuesFreq, setNewDuesFreq] = useState("monthly");
  const [isCreating, setIsCreating] = useState(false);
  const createImageInputRef = useRef<HTMLInputElement>(null);

  // Group Settings State (when viewing group as admin)
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("Electronics");
  const [editType, setEditType] = useState<GroupType>("open");
  const [editImage, setEditImage] = useState("");
  const [editDuesAmount, setEditDuesAmount] = useState("");
  const [editDuesFreq, setEditDuesFreq] = useState("monthly");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const editImageInputRef = useRef<HTMLInputElement>(null);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Group posts state scoped per group ID
  const [groupPostsMap, setGroupPostsMap] = useState<Record<number, GroupPostData[]>>(getInitialGroupPosts);
  const [newPostText, setNewPostText] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageTargetUser, setMessageTargetUser] = useState("");

  // Sync settings state when opening/switching viewGroup
  useEffect(() => {
    if (viewGroup) {
      setEditTitle(viewGroup.title);
      setEditDesc(viewGroup.description || "");
      setEditCategory(viewGroup.category || "Electronics");
      setEditType(viewGroup.type || "open");
      setEditImage(viewGroup.image || "");
      setEditDuesAmount(viewGroup.dues?.amount ? String(viewGroup.dues.amount) : "");
      setEditDuesFreq(viewGroup.dues?.frequency || "monthly");
    }
  }, [viewGroup]);

  // Fetch real groups from backend
  const fetchGroups = () => {
    const currentUserId = Number(localStorage.getItem("kiloneed_user_id")) || 0;
    groupsApiService
      .getGroups()
      .then((remoteGroups) => {
        if (Array.isArray(remoteGroups)) {
          const mapped: Group[] = remoteGroups.map((rg: any) => {
            const rawMembers: GroupMember[] =
              Array.isArray(rg.real_members) && rg.real_members.length > 0
                ? rg.real_members.map((m: any) => ({
                    id: Number(m.id || m.user_id),
                    name: m.name || "Member",
                    avatar: m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : "MB"),
                    role: (m.role || "member") as MemberRole,
                    joinedAt: m.joinedAt || "Recently",
                  }))
                : Array.isArray(rg.members) && rg.members.length > 0
                ? rg.members.map((m: any) => ({
                    id: Number(m.user_id || m.id),
                    name: m.user?.name || m.name || "Member",
                    avatar: m.user?.avatar || (m.user?.name ? m.user.name.substring(0, 2).toUpperCase() : "MB"),
                    role: (m.role || "member") as MemberRole,
                    joinedAt: "Recently",
                  }))
                : [];

            // If empty, guarantee group creator/admin is present
            if (rawMembers.length === 0) {
              rawMembers.push({
                id: Number(rg.owner_id || 1),
                name: rg.owner?.name || (rg.isAdmin ? "You" : "Group Admin"),
                avatar: rg.owner?.name ? rg.owner.name.substring(0, 2).toUpperCase() : "GA",
                role: "admin",
                joinedAt: "Creator",
              });
            }

            return {
              id: Number(rg.id),
              title: rg.name || rg.title || "Trade Group",
              description: rg.description || "Active community and trade network on Kiloneed.",
              image:
                rg.cover_image ||
                PRESET_BANNERS.find((b) => b.label.toLowerCase().includes((rg.category || "").toLowerCase()))?.url ||
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=300&fit=crop",
              type: (rg.group_type || (rg.is_private ? "closed" : "open")) as GroupType,
              category: rg.category || "Electronics",
              membersCount: Number(rg.members_count || rawMembers.length || 1),
              maxMembers: Number(rg.max_members || 1000),
              isMember: Boolean(rg.isMember ?? rg.is_member ?? false),
              isAdmin: Boolean(rg.isAdmin ?? (rg.owner_id && rg.owner_id === currentUserId)),
              isPending: false,
              members: rawMembers,
              dues:
                rg.group_type === "special"
                  ? {
                      total: Number(rg.treasury_balance || 0),
                      frequency: "monthly",
                      amount: Number(rg.monthly_dues || 5000),
                      transactions: [],
                    }
                  : undefined,
            };
          });

          const realOnly = mapped.filter((g) => !MOCK_TITLES.has((g.title || "").toLowerCase().trim()));
          setGroups(realOnly);
          localStorage.setItem("kiloneed_groups_cache", JSON.stringify(realOnly));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote groups:", err);
      })
      .finally(() => {
        setLoadingGroups(false);
      });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch commodities when viewing commodities tab
  useEffect(() => {
    if (viewGroup && groupTab === "commodities") {
      setLoadingCommodities(true);
      productsApiService
        .getProducts({ category: viewGroup.category !== "All" ? viewGroup.category : undefined })
        .then((items) => {
          if (Array.isArray(items)) {
            setCommodities(items);
          } else {
            setCommodities([]);
          }
        })
        .catch(() => setCommodities([]))
        .finally(() => setLoadingCommodities(false));
    }
  }, [viewGroup, groupTab]);

  const handleImageFile = (
    file: File | undefined,
    onSuccess: (url: string) => void
  ) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          onSuccess(compressed);
          toast.success("Group image optimized!");
        } else {
          onSuccess(rawDataUrl);
          toast.success("Image selected!");
        }
      };
      img.onerror = () => {
        onSuccess(rawDataUrl);
        toast.success("Image selected!");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const filtered = groups.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || g.category === filterCat;
    return matchSearch && matchCat;
  });

  const myGroups = filtered.filter((g) => g.isMember || g.isAdmin);
  const displayedGroups = mainTab === "my" ? myGroups : filtered;

  const handleJoin = async (id: number) => {
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const currentUserId = Number(localStorage.getItem("kiloneed_user_id")) || 0;
    const currentUserAvatar =
      localStorage.getItem("kiloneed_user_avatar") || currentUserName.substring(0, 2).toUpperCase();

    const newMember: GroupMember = {
      id: currentUserId || Date.now(),
      name: currentUserName,
      avatar: currentUserAvatar,
      role: "member",
      joinedAt: "Just now",
    };

    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== id) return g;
        if (g.type === "open") {
          const alreadyIn = g.members.some((m) => m.id === currentUserId || m.name === currentUserName);
          return {
            ...g,
            isMember: true,
            membersCount: g.membersCount + 1,
            members: alreadyIn ? g.members : [...g.members, newMember],
          };
        }
        return { ...g, isPending: true };
      });
      localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
      return updated;
    });

    if (viewGroup?.id === id) {
      setViewGroup((prev) =>
        prev
          ? {
              ...prev,
              isMember: true,
              membersCount: prev.membersCount + 1,
              members: [...prev.members, newMember],
            }
          : prev
      );
    }

    try {
      await groupsApiService.joinGroup(id);
      toast.success("Successfully joined the group!");
    } catch (err: any) {
      toast.info(err?.message || "Join recorded");
    }
  };

  const handleLeave = async (id: number) => {
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const currentUserId = Number(localStorage.getItem("kiloneed_user_id")) || 0;

    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          isMember: false,
          isPending: false,
          membersCount: Math.max(0, g.membersCount - 1),
          members: g.members.filter((m) => m.id !== currentUserId && m.name !== currentUserName),
        };
      });
      localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
      return updated;
    });

    if (viewGroup?.id === id) {
      setViewGroup((prev) =>
        prev
          ? {
              ...prev,
              isMember: false,
              isPending: false,
              membersCount: Math.max(0, prev.membersCount - 1),
              members: prev.members.filter((m) => m.id !== currentUserId && m.name !== currentUserName),
            }
          : prev
      );
    }

    toast.success("You left the group");
    try {
      await groupsApiService.leaveGroup(id);
    } catch {}
  };

  const handleAcceptRequest = (reqId: number) => setJoinRequests((prev) => prev.filter((r) => r.id !== reqId));
  const handleDeclineRequest = (reqId: number) => setJoinRequests((prev) => prev.filter((r) => r.id !== reqId));
  const handleAcceptInvite = (invId: number) => setInvitations((prev) => prev.filter((i) => i.id !== invId));
  const handleDeclineInvite = (invId: number) => setInvitations((prev) => prev.filter((i) => i.id !== invId));

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a group title");
      return;
    }
    setIsCreating(true);
    try {
      const cover =
        newImage.trim() ||
        PRESET_BANNERS.find((b) => b.label.toLowerCase().includes(newCategory.toLowerCase()))?.url ||
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop";
      const duesAmt = Number(newDuesAmount) || 0;
      const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
      const currentUserId = Number(localStorage.getItem("kiloneed_user_id")) || 1;

      const res = await groupsApiService.createGroup({
        name: newTitle.trim(),
        description: newDesc.trim() || undefined,
        category: newCategory,
        is_private: newType !== "open",
        group_type: newType,
        cover_image: cover,
        monthly_dues: newType === "special" ? duesAmt : 0,
      });

      const serverGroup = res?.group;
      const createdId = serverGroup?.id ? Number(serverGroup.id) : Date.now();

      const newGroupObj: Group = {
        id: createdId,
        title: serverGroup?.name || newTitle.trim(),
        description: serverGroup?.description || newDesc.trim(),
        image: serverGroup?.cover_image || cover,
        type: newType,
        category: newCategory,
        membersCount: 1,
        maxMembers: 1000,
        isMember: true,
        isAdmin: true,
        isPending: false,
        members: [
          {
            id: currentUserId,
            name: currentUserName,
            avatar: currentUserName.substring(0, 2).toUpperCase(),
            role: "admin",
            joinedAt: "Just now",
          },
        ],
        dues:
          newType === "special"
            ? {
                total: 0,
                frequency: newDuesFreq,
                amount: duesAmt,
                transactions: [],
              }
            : undefined,
      };

      setGroups((prev) => {
        const updated = [newGroupObj, ...prev.filter((g) => g.id !== createdId)];
        localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
        return updated;
      });

      toast.success(`Group "${newGroupObj.title}" created successfully!`);
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      setNewImage("");
      setNewType("open");
      setNewDuesAmount("");

      // Open new group immediately
      setViewGroup(newGroupObj);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create group on server");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!viewGroup) return;
    if (!editTitle.trim()) {
      toast.error("Group title cannot be empty");
      return;
    }
    setIsSavingSettings(true);
    try {
      const duesAmt = Number(editDuesAmount) || 0;
      await groupsApiService.updateGroup(viewGroup.id, {
        name: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        cover_image: editImage,
        group_type: editType,
        monthly_dues: editType === "special" ? duesAmt : 0,
      });

      const updatedGroup: Group = {
        ...viewGroup,
        title: editTitle.trim(),
        description: editDesc.trim(),
        category: editCategory,
        image: editImage || viewGroup.image,
        type: editType,
        dues:
          editType === "special"
            ? {
                total: viewGroup.dues?.total || 0,
                frequency: editDuesFreq,
                amount: duesAmt,
                transactions: viewGroup.dues?.transactions || [],
              }
            : undefined,
      };

      setViewGroup(updatedGroup);
      setGroups((prev) => {
        const updated = prev.map((g) => (g.id === viewGroup.id ? updatedGroup : g));
        localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
        return updated;
      });
      toast.success("Group settings updated in real time!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update group settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!viewGroup) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${viewGroup.title}"?`)) return;
    setIsDeletingGroup(true);
    try {
      await groupsApiService.deleteGroup(viewGroup.id);
      setGroups((prev) => {
        const updated = prev.filter((g) => g.id !== viewGroup.id);
        localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
        return updated;
      });
      setViewGroup(null);
      toast.success("Group deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete group");
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const handleChangeRole = (groupId: number, memberId: number, newRole: MemberRole) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)) }
          : g
      );
      localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
      return updated;
    });
    if (viewGroup?.id === groupId) {
      setViewGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
            }
          : prev
      );
    }
    toast.success(`Role updated to ${newRole}`);
  };

  // ─── Post handlers scoped to active group ───
  const activeGroupPosts = viewGroup ? groupPostsMap[viewGroup.id] || [] : [];

  const handleCreatePost = () => {
    if (!newPostText.trim() || !viewGroup) return;
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const post: GroupPostData = {
      id: `gp-${Date.now()}`,
      author: currentUserName,
      avatar: currentUserName.substring(0, 2).toUpperCase(),
      text: newPostText.trim(),
      time: "Just now",
      likes: 0,
      liked: false,
      saved: false,
      shared: false,
      comments: [],
    };

    setGroupPostsMap((prev) => {
      const updated = {
        ...prev,
        [viewGroup.id]: [post, ...(prev[viewGroup.id] || [])],
      };
      localStorage.setItem("kiloneed_group_posts_cache", JSON.stringify(updated));
      return updated;
    });
    setNewPostText("");
    toast.success("Post published to group feed!");
  };

  const handleLikePost = (id: string) => {
    if (!viewGroup) return;
    setGroupPostsMap((prev) => {
      const posts = prev[viewGroup.id] || [];
      const updatedPosts = posts.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      );
      const updated = { ...prev, [viewGroup.id]: updatedPosts };
      localStorage.setItem("kiloneed_group_posts_cache", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSavePost = (id: string) => {
    if (!viewGroup) return;
    setGroupPostsMap((prev) => {
      const posts = prev[viewGroup.id] || [];
      const updatedPosts = posts.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p));
      const post = posts.find((p) => p.id === id);
      toast.success(post?.saved ? "Post unsaved" : "Post saved!");
      const updated = { ...prev, [viewGroup.id]: updatedPosts };
      localStorage.setItem("kiloneed_group_posts_cache", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSharePost = (id: string) => {
    if (!viewGroup) return;
    setGroupPostsMap((prev) => {
      const posts = prev[viewGroup.id] || [];
      const updatedPosts = posts.map((p) => (p.id === id ? { ...p, shared: true } : p));
      const updated = { ...prev, [viewGroup.id]: updatedPosts };
      localStorage.setItem("kiloneed_group_posts_cache", JSON.stringify(updated));
      return updated;
    });
    toast.success("Post shared!");
  };

  const handleCommentPost = (id: string, text: string) => {
    if (!viewGroup) return;
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    setGroupPostsMap((prev) => {
      const posts = prev[viewGroup.id] || [];
      const updatedPosts = posts.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `gc-${Date.now()}`,
                  author: currentUserName,
                  avatar: currentUserName.substring(0, 2).toUpperCase(),
                  text,
                  time: "Just now",
                },
              ],
            }
          : p
      );
      const updated = { ...prev, [viewGroup.id]: updatedPosts };
      localStorage.setItem("kiloneed_group_posts_cache", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUsernameClick = (name: string) => {
    if (name === "You") return;
    setMessageTargetUser(name);
    setMessageModalOpen(true);
  };

  // ─── Single Group View ───
  if (viewGroup) {
    const g = groups.find((gr) => gr.id === viewGroup.id) || viewGroup;
    return (
      <MobileLayout title={g.title} showBack onBack={() => setViewGroup(null)}>
        <div className="relative h-40 sm:h-56 overflow-hidden">
          <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={`${typeColor(g.type)} border-current text-[10px] gap-1 capitalize`}>
                {typeIcon(g.type)} {g.type}
              </Badge>
              <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
            </div>
            <h1 className="font-display text-lg sm:text-2xl font-bold text-foreground">{g.title}</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
            <div className="flex items-center justify-between gap-3 mt-2 text-[11px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {g.membersCount.toLocaleString()} / {g.maxMembers.toLocaleString()} members
              </span>

              {/* Join / Joined Button right in Header */}
              <div>
                {!g.isMember ? (
                  <Button
                    size="sm"
                    onClick={() => handleJoin(g.id)}
                    className="gradient-blue text-primary-foreground text-xs h-7 px-3 rounded-lg gap-1 shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Join Group
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30 gap-1 bg-green-500/10 py-0.5 px-2">
                    <UserCheck className="h-3 w-3" /> Joined
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Tabs value={groupTab} onValueChange={setGroupTab}>
            <div className="overflow-x-auto -mx-3 px-3">
              <TabsList className="bg-muted/60 border border-border/50 flex w-max gap-0.5 p-0.5 h-8 rounded-lg">
                <TabsTrigger value="needs" className="gap-1 text-[11px] px-2.5 py-1 rounded-md">
                  <Home className="h-3.5 w-3.5" /> Needs & Feed
                </TabsTrigger>
                <TabsTrigger value="commodities" className="gap-1 text-[11px] px-2.5 py-1 rounded-md">
                  <ShoppingBag className="h-3.5 w-3.5" /> Items ({g.category})
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-1 text-[11px] px-2.5 py-1 rounded-md">
                  <Users className="h-3.5 w-3.5" /> Members ({g.members.length})
                </TabsTrigger>
                {g.isMember && g.dues && (
                  <TabsTrigger value="dues" className="gap-1 text-[11px] px-2.5 py-1 rounded-md">
                    <Wallet className="h-3.5 w-3.5" /> Dues
                  </TabsTrigger>
                )}
                {g.isAdmin && (
                  <TabsTrigger value="settings" className="gap-1 text-[11px] px-2.5 py-1 rounded-md">
                    <Settings className="h-3.5 w-3.5" /> Settings
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Group Feed Tab */}
            <TabsContent value="needs" className="mt-4 space-y-3">
              {g.isMember ? (
                <Card className="gradient-card border-border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {(localStorage.getItem("kiloneed_user_name") || "You").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          placeholder={`Post a need or update to ${g.title}...`}
                          className="bg-secondary border-border resize-none text-xs sm:text-sm min-h-[60px]"
                          rows={2}
                        />
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs text-muted-foreground h-7"
                            onClick={() => toast.info("Image attachment ready in next release")}
                          >
                            <ImagePlus className="h-3.5 w-3.5" /> Photo
                          </Button>
                          <Button
                            size="sm"
                            className="gradient-blue text-primary-foreground gap-1 text-xs h-7"
                            onClick={handleCreatePost}
                            disabled={!newPostText.trim()}
                          >
                            <Send className="h-3.5 w-3.5" /> Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="gradient-card border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Join this group to share needs, deals, and discussions.</p>
                  <Button size="sm" onClick={() => handleJoin(g.id)} className="gradient-blue text-primary-foreground text-xs h-7 px-4">
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Join Group
                  </Button>
                </Card>
              )}

              {/* Feed of Posts */}
              {activeGroupPosts.map((post) => (
                <GroupPost
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onSave={handleSavePost}
                  onShare={handleSharePost}
                  onComment={handleCommentPost}
                  onUsernameClick={handleUsernameClick}
                />
              ))}

              {activeGroupPosts.length === 0 && (
                <Card className="gradient-card border-border p-6 text-center">
                  <Home className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-medium text-foreground">No posts yet in {g.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to share an update, request, or offer!</p>
                </Card>
              )}
            </TabsContent>

            {/* Commodities / Market Items Tab */}
            <TabsContent value="commodities" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Community Marketplace ({g.category})</h3>
                  <p className="text-[11px] text-muted-foreground">Marketplace items and goods matching {g.category}.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/sell")}
                  className="gradient-blue text-primary-foreground text-xs h-7 px-3 rounded-lg gap-1"
                >
                  <Plus className="h-3 w-3" /> Sell Item
                </Button>
              </div>

              {loadingCommodities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : commodities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {commodities.map((item) => (
                    <Card
                      key={item.id}
                      className="gradient-card border-border overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group"
                      onClick={() => navigate("/marketplace")}
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                        {item.condition && (
                          <Badge variant="secondary" className="absolute top-1.5 left-1.5 text-[9px] py-0 px-1.5 bg-black/60 backdrop-blur-xs text-white border-0">
                            {item.condition}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-2 sm:p-2.5">
                        <p className="text-xs font-bold text-gradient-blue truncate">
                          ₦{Number(item.price || 0).toLocaleString("en-NG")}
                        </p>
                        <h4 className="text-xs font-medium text-foreground truncate mt-0.5">{item.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.city || item.state || "Nigeria"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="gradient-card border-border p-6 text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">No commodities listed under {g.category} yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Be the first to list an item or commodity in this category!</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate("/sell")}
                    className="gradient-blue text-primary-foreground text-xs h-8 px-4 rounded-xl gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post Item to Sell
                  </Button>
                </Card>
              )}
            </TabsContent>

            {/* Real Members Tab */}
            <TabsContent value="members" className="mt-4 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-muted-foreground font-medium">
                  {g.members.length} {g.members.length === 1 ? "Member" : "Members"}
                </span>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Limit: {g.maxMembers.toLocaleString()}
                </Badge>
              </div>

              {g.members.map((m) => (
                <Card key={m.id} className="gradient-card border-border">
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                          {m.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-medium text-foreground truncate">{m.name}</span>
                          {roleIcon(m.role)}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground capitalize">
                          {m.role} · {m.joinedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary hover:bg-primary/10 px-2"
                        onClick={() => handleUsernameClick(m.name)}
                      >
                        Message
                      </Button>

                      {g.isAdmin && m.role !== "admin" && (
                        <Select
                          value={m.role}
                          onValueChange={(val) => handleChangeRole(g.id, m.id, val as MemberRole)}
                        >
                          <SelectTrigger className="w-[85px] sm:w-[110px] h-7 text-[10px] sm:text-xs bg-secondary border-border shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Dues Tab (Special Groups) */}
            {g.dues && (
              <TabsContent value="dues" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="gradient-card border-border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Treasury Balance</p>
                      <p className="text-lg sm:text-xl font-bold text-gradient-blue">{formatCurrency(g.dues.total)}</p>
                    </CardContent>
                  </Card>
                  <Card className="gradient-card border-border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Dues Amount</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(g.dues.amount)}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{g.dues.frequency}</p>
                    </CardContent>
                  </Card>
                  <Card className="gradient-card border-border">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Actions</p>
                      {g.isAdmin ? (
                        <Button
                          size="sm"
                          className="gradient-blue text-primary-foreground gap-1 text-xs"
                          onClick={() => setShowWithdraw(true)}
                        >
                          <ArrowDownToLine className="h-3.5 w-3.5" /> Withdraw
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gradient-blue text-primary-foreground gap-1 text-xs"
                          onClick={() => {
                            const duesAmt = g.dues?.amount || 5000;
                            const newTx: DueTransaction = {
                              id: Date.now(),
                              member: localStorage.getItem("kiloneed_user_name") || "You",
                              amount: duesAmt,
                              date: "Just now",
                              type: "payment",
                              status: "completed",
                            };
                            setGroups((prev) => {
                              const updated = prev.map((gr) =>
                                gr.id === g.id && gr.dues
                                  ? {
                                      ...gr,
                                      dues: {
                                        ...gr.dues,
                                        total: gr.dues.total + duesAmt,
                                        transactions: [newTx, ...gr.dues.transactions],
                                      },
                                    }
                                  : gr
                              );
                              localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
                              return updated;
                            });
                            walletApiService
                              .deposit(duesAmt, `${g.title} - Group Dues`)
                              .catch(() => {});
                            toast.success(`Paid ${formatCurrency(duesAmt)} dues to ${g.title}!`);
                          }}
                        >
                          <Wallet className="h-3.5 w-3.5" /> Pay Dues
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
                <div className="space-y-2">
                  {g.dues.transactions.length === 0 ? (
                    <Card className="gradient-card border-border p-4 text-center">
                      <p className="text-xs text-muted-foreground">No due transactions recorded yet.</p>
                    </Card>
                  ) : (
                    g.dues.transactions.map((t) => (
                      <Card key={t.id} className="gradient-card border-border">
                        <CardContent className="p-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div
                              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 ${
                                t.type === "payment" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {t.type === "payment" ? <Wallet className="h-3.5 w-3.5" /> : <ArrowDownToLine className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-foreground truncate">{t.member}</p>
                              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                                {t.date} · <span className="capitalize">{t.status}</span>
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs sm:text-sm font-bold shrink-0 ${
                              t.type === "payment" ? "text-green-400" : "text-yellow-400"
                            }`}
                          >
                            {t.type === "payment" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </span>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            )}

            {/* Admin Settings Tab */}
            {g.isAdmin && (
              <TabsContent value="settings" className="mt-4 space-y-4">
                <Card className="gradient-card border-border">
                  <CardContent className="p-3 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Group Settings</h3>
                        <p className="text-[11px] text-muted-foreground">
                          Manage group image, branding, guidelines, and access type.
                        </p>
                      </div>
                      <Badge variant="outline" className={`${typeColor(editType)} border-current capitalize gap-1 text-[10px]`}>
                        {typeIcon(editType)} {editType}
                      </Badge>
                    </div>

                    {/* 1. Group Cover Photo */}
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">Group Cover Photo</label>
                      <input
                        type="file"
                        ref={editImageInputRef}
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0], setEditImage)}
                        className="hidden"
                      />

                      <div className="relative h-28 sm:h-36 rounded-xl overflow-hidden border border-border group bg-secondary/40">
                        <img
                          src={editImage || g.image}
                          alt="Group banner"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => editImageInputRef.current?.click()}
                            className="gradient-blue text-primary-foreground text-xs h-8 px-3 rounded-lg gap-1.5 shadow-xs"
                          >
                            <Camera className="h-3.5 w-3.5" /> Change Photo
                          </Button>
                        </div>
                      </div>

                      {/* Preset Banners */}
                      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">Presets:</span>
                        {PRESET_BANNERS.map((b) => (
                          <button
                            key={b.label}
                            type="button"
                            onClick={() => setEditImage(b.url)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors shrink-0 font-medium ${
                              editImage === b.url
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Group Title & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">Group Title</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-secondary border-border text-xs sm:text-sm h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger className="bg-secondary border-border text-xs sm:text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter((c) => c !== "All").map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 3. Description */}
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Description & Guidelines</label>
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="bg-secondary border-border resize-none text-xs sm:text-sm"
                        rows={3}
                      />
                    </div>

                    {/* 4. Group Type Selector */}
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1.5 block">Group Access Type</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditType("open")}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            editType === "open"
                              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                              : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                            <span>Open (Public)</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Anyone can discover and join immediately.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditType("closed")}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            editType === "closed"
                              ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/40"
                              : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Closed (Private)</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Requires admin approval to join.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditType("special")}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            editType === "special"
                              ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40"
                              : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Special (With Dues)</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">Members contribute regular dues to treasury.</p>
                        </button>
                      </div>

                      {/* Dues Settings when Special */}
                      {editType === "special" && (
                        <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div>
                            <label className="text-[11px] font-semibold text-foreground mb-1 block">Periodic Dues Amount (₦)</label>
                            <Input
                              type="number"
                              value={editDuesAmount}
                              onChange={(e) => setEditDuesAmount(e.target.value)}
                              placeholder="5000"
                              className="bg-secondary border-border text-xs h-8"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-foreground mb-1 block">Frequency</label>
                            <Select value={editDuesFreq} onValueChange={setEditDuesFreq}>
                              <SelectTrigger className="bg-secondary border-border text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteGroup}
                        disabled={isDeletingGroup || isSavingSettings}
                        className="w-full sm:w-auto gap-1.5 text-xs h-9 rounded-xl order-2 sm:order-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isDeletingGroup ? "Deleting Group..." : "Delete Group"}</span>
                      </Button>

                      <Button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings || isDeletingGroup || !editTitle.trim()}
                        className="w-full sm:w-auto gradient-blue text-primary-foreground font-semibold text-xs h-9 px-5 rounded-xl gap-1.5 order-1 sm:order-2 shadow-xs"
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Saving in Real Time...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {g.isMember && !g.isAdmin && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                onClick={() => handleLeave(g.id)}
              >
                Leave Group
              </Button>
            </div>
          )}
        </div>

        {/* Withdrawal Dialog */}
        <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
          <DialogContent className="gradient-card border-border max-w-[calc(100vw-2rem)]">
            <DialogHeader>
              <DialogTitle className="font-display">Request Withdrawal</DialogTitle>
              <DialogDescription>Requires sign-off from group co-administrators.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (₦)</label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destination Bank & Account</label>
                <Input placeholder="Bank Name — 0123456789" className="bg-secondary border-border" />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-400" /> Multi-signature governance enabled.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowWithdraw(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-blue text-primary-foreground"
                onClick={() => {
                  const amt = Number(withdrawAmount) || 50000;
                  const newTx: DueTransaction = {
                    id: Date.now(),
                    member: "Admin Request",
                    amount: amt,
                    date: "Pending Sign-off",
                    type: "withdrawal",
                    status: "pending",
                  };
                  setGroups((prev) => {
                    const updated = prev.map((gr) =>
                      gr.id === g.id && gr.dues
                        ? {
                            ...gr,
                            dues: {
                              ...gr.dues,
                              transactions: [newTx, ...gr.dues.transactions],
                            },
                          }
                        : gr
                    );
                    localStorage.setItem("kiloneed_groups_cache", JSON.stringify(updated));
                    return updated;
                  });
                  api
                    .post("/admin/group-disbursements", {
                      group_id: g.id,
                      group_name: g.title,
                      requested_by: localStorage.getItem("kiloneed_user_name") || "Group Admin",
                      amount: amt,
                      purpose: `${g.title} Multi-Signature Treasury Withdrawal`,
                    })
                    .catch(() => {});
                  setWithdrawAmount("");
                  setShowWithdraw(false);
                  toast.success(
                    `Withdrawal request of ${formatCurrency(amt)} submitted!`
                  );
                }}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <GroupMessageModal
          open={messageModalOpen}
          onOpenChange={setMessageModalOpen}
          userName={messageTargetUser}
        />
      </MobileLayout>
    );
  }

  // ─── Main Groups List View ───
  return (
    <MobileLayout
      title="Groups"
      headerRight={
        <HeaderActionButton
          label="Create"
          onClick={() => setShowCreate(true)}
        />
      }
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-xs sm:text-sm h-9"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3">
          {categories.map((c) => (
            <Badge
              key={c}
              variant={filterCat === c ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap text-xs ${
                filterCat === c ? "gradient-blue text-primary-foreground border-transparent" : "hover:bg-muted"
              }`}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </Badge>
          ))}
        </div>

        {/* Main Tabs: Explore, My Groups, Invites, Requests */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)}>
          <div className="overflow-x-auto -mx-3 px-3">
            <TabsList className="bg-muted/60 border border-border/50 flex w-max gap-0.5 p-0.5 h-8 rounded-lg">
              <TabsTrigger value="all" className="text-xs">
                Explore Groups ({filtered.length})
              </TabsTrigger>
              <TabsTrigger value="my" className="text-xs">
                My Groups ({myGroups.length})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-1 text-xs">
                Invites
                {invitations.length > 0 && (
                  <Badge className="gradient-blue text-primary-foreground h-4 px-1 text-[9px] border-transparent">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-1 text-xs">
                Requests
                {joinRequests.length > 0 && (
                  <Badge className="gradient-blue text-primary-foreground h-4 px-1 text-[9px] border-transparent">
                    {joinRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Groups Listing (Explore or My Groups) */}
          <TabsContent value={mainTab === "all" || mainTab === "my" ? mainTab : "all"} className="mt-4 space-y-3">
            {loadingGroups ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading groups from network...</p>
              </div>
            ) : displayedGroups.length > 0 ? (
              displayedGroups.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="gradient-card border-border overflow-hidden hover:shadow-glow transition-shadow">
                    <div className="flex">
                      <div
                        className="w-24 sm:w-44 shrink-0 overflow-hidden cursor-pointer bg-secondary/50"
                        onClick={() => {
                          setViewGroup(g);
                          setGroupTab("needs");
                        }}
                      >
                        <img src={g.image} alt={g.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <CardContent className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <h3
                              className="font-display font-semibold text-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors truncate"
                              onClick={() => {
                                setViewGroup(g);
                                setGroupTab("needs");
                              }}
                            >
                              {g.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`${typeColor(g.type)} border-current text-[8px] sm:text-[9px] gap-0.5 capitalize shrink-0`}
                            >
                              {typeIcon(g.type)} {g.type}
                            </Badge>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{g.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                          <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {g.membersCount.toLocaleString()} {g.membersCount === 1 ? "member" : "members"}
                          </span>
                          {g.isMember ? (
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] text-green-400 border-green-400/30 gap-0.5 bg-green-500/10">
                              <UserCheck className="h-3 w-3" /> Joined
                            </Badge>
                          ) : g.isPending ? (
                            <Badge variant="outline" className="text-[9px] sm:text-[10px] text-yellow-400 border-yellow-400/30 gap-0.5 bg-yellow-500/10">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 sm:h-7 text-[10px] sm:text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10 px-2.5 rounded-lg"
                              onClick={() => handleJoin(g.id)}
                            >
                              <UserPlus className="h-3 w-3" /> Join
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 space-y-3">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {mainTab === "my" ? "You haven't joined any groups yet" : "No groups found"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mainTab === "my"
                      ? "Explore community groups or create your own group to get started!"
                      : "Start a new trade, business, or community network."}
                  </p>
                </div>
                {mainTab === "my" ? (
                  <Button
                    size="sm"
                    onClick={() => setMainTab("all")}
                    className="gradient-blue text-primary-foreground text-xs h-8 px-4 rounded-xl"
                  >
                    Explore Groups
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowCreate(true)}
                    className="gradient-blue text-primary-foreground text-xs h-8 px-4 rounded-xl"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create First Group
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-4 space-y-3">
            {invitations.length === 0 ? (
              <div className="text-center py-16">
                <UserPlus className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No pending group invitations.</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <Card key={inv.id} className="gradient-card border-border">
                  <CardContent className="p-3 flex items-center gap-2 sm:gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden shrink-0">
                      <img src={inv.groupImage} alt={inv.groupTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{inv.groupTitle}</p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">Invited by {inv.invitedBy}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 border-green-400/30 text-green-400 hover:bg-green-400/10"
                        onClick={() => handleAcceptInvite(inv.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeclineInvite(inv.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-4 space-y-3">
            {joinRequests.length === 0 ? (
              <div className="text-center py-16">
                <UserCheck className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No pending member requests.</p>
              </div>
            ) : (
              joinRequests.map((req) => (
                <Card key={req.id} className="gradient-card border-border">
                  <CardContent className="p-3 flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{req.userAvatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{req.userName}</p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                        {req.groupTitle} · {req.requestedAt}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 sm:h-7 text-[10px] sm:text-xs border-green-400/30 text-green-400 hover:bg-green-400/10 gap-0.5 px-2"
                        onClick={() => handleAcceptRequest(req.id)}
                      >
                        <Check className="h-3 w-3" /> <span className="hidden sm:inline">Accept</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 sm:h-7 text-[10px] sm:text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-0.5 px-2"
                        onClick={() => handleDeclineRequest(req.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="gradient-card border-border w-[calc(100vw-1.5rem)] max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-base sm:text-lg">Create Group</DialogTitle>
            <DialogDescription className="text-xs">
              Start a new trade, business, or community network (max 1,000 members).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* 1. Group Cover Photo */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Group Cover Photo</label>
              <input
                type="file"
                ref={createImageInputRef}
                accept="image/*"
                onChange={(e) => handleImageFile(e.target.files?.[0], setNewImage)}
                className="hidden"
              />

              {newImage ? (
                <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden border border-border group bg-secondary/40">
                  <img src={newImage} alt="Group preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => createImageInputRef.current?.click()}
                      className="gradient-blue text-primary-foreground text-xs h-7.5 px-3 rounded-lg gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5" /> Change Photo
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setNewImage("")}
                      className="text-xs h-7.5 px-2.5 rounded-lg"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => createImageInputRef.current?.click()}
                  className="border border-dashed border-border hover:border-primary/60 rounded-xl p-3 sm:p-4 bg-secondary/30 flex items-center justify-center gap-3 cursor-pointer transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Upload Group Cover Photo</p>
                    <p className="text-[10px] text-muted-foreground">Tap to choose photo (auto-compressed)</p>
                  </div>
                </div>
              )}

              {/* Preset Banners */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium">Themes:</span>
                {PRESET_BANNERS.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setNewImage(b.url)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors shrink-0 font-medium ${
                      newImage === b.url
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Group Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Group Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lagos Tech Traders"
                  className="bg-secondary border-border text-xs sm:text-sm h-9"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-secondary border-border text-xs sm:text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c !== "All").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. Description */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Description & Purpose</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this community about? Share mission, goods traded, and guidelines..."
                className="bg-secondary border-border resize-none text-xs sm:text-sm"
                rows={3}
              />
            </div>

            {/* 4. Group Access Type */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Group Access Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType("open")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    newType === "open"
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                      : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    <span>Open (Public)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Anyone can find and join immediately for free.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setNewType("closed")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    newType === "closed"
                      ? "border-amber-500 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/40"
                      : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Closed (Private)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Requires admin approval or invite to join.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setNewType("special")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    newType === "special"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40"
                      : "border-border/80 bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Special (With Dues)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Members contribute regular dues to treasury.</p>
                </button>
              </div>

              {/* Dues Settings if Special */}
              {newType === "special" && (
                <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Periodic Dues (₦)</label>
                    <Input
                      type="number"
                      value={newDuesAmount}
                      onChange={(e) => setNewDuesAmount(e.target.value)}
                      placeholder="5000"
                      className="bg-secondary border-border text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Frequency</label>
                    <Select value={newDuesFreq} onValueChange={setNewDuesFreq}>
                      <SelectTrigger className="bg-secondary border-border text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreate(false)}
              disabled={isCreating}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newTitle.trim()}
              className="gradient-blue text-primary-foreground font-semibold text-xs rounded-xl shadow-xs"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating Group in Real Time...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Groups;
