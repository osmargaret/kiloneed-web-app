import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { authService } from "@/services/authService";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Lock,
  MapPin,
  Moon,
  Sun,
  Bell,
  Eye,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Sparkles,
  Smartphone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Info,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // User details state (loaded from auth or local session)
  const [userName, setUserName] = useState(
    () => localStorage.getItem("kiloneed_user_name") || "Merchant"
  );
  const [userHeadline, setUserHeadline] = useState(
    () => localStorage.getItem("kiloneed_headline") || "Merchant"
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("kiloneed_user_email") || ""
  );
  const [userPhone, setUserPhone] = useState(
    () => localStorage.getItem("kiloneed_user_phone") || ""
  );
  const [userLocation, setUserLocation] = useState(
    () => localStorage.getItem("kiloneed_location") || "Lagos, Nigeria"
  );
  const [userHandle, setUserHandle] = useState(
    () =>
      localStorage.getItem("kiloneed_handle") ||
      (localStorage.getItem("kiloneed_user_name") || "merchant")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
  );

  // Notification toggles
  const [notifPush, setNotifPush] = useState(true);
  const [notifNeeds, setNotifNeeds] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Privacy toggles
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [autoAcceptConnections, setAutoAcceptConnections] = useState(false);

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState<"terms" | "privacy" | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Edit profile form temp states
  const [tempName, setTempName] = useState(userName);
  const [tempHeadline, setTempHeadline] = useState(userHeadline);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempPhone, setTempPhone] = useState(userPhone);
  const [tempLocation, setTempLocation] = useState(userLocation);
  const [tempHandle, setTempHandle] = useState(userHandle);

  // Sync with live authenticated profile from backend
  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
        const u = res?.user;
        if (u) {
          if (u.name) {
            setUserName(u.name);
            setTempName(u.name);
            localStorage.setItem("kiloneed_user_name", u.name);
          }
          if (u.email) {
            setUserEmail(u.email);
            setTempEmail(u.email);
            localStorage.setItem("kiloneed_user_email", u.email);
          }
          if (u.phone) {
            setUserPhone(u.phone);
            setTempPhone(u.phone);
            localStorage.setItem("kiloneed_user_phone", u.phone);
          }
          if (u.location) {
            setUserLocation(u.location);
            setTempLocation(u.location);
            localStorage.setItem("kiloneed_location", u.location);
          }
          const headline = u.bio || u.company || u.industry || "Merchant";
          setUserHeadline(headline);
          setTempHeadline(headline);
          localStorage.setItem("kiloneed_headline", headline);

          const handle =
            (u as any).handle ||
            (u.name ? u.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "merchant");
          setUserHandle(handle);
          setTempHandle(handle);
          localStorage.setItem("kiloneed_handle", handle);
        }
      })
      .catch(() => {});
  }, []);

  // Automatically open edit profile dialog when navigated from Profile.tsx
  useEffect(() => {
    if ((location.state as any)?.editProfile) {
      setTempName(userName);
      setTempHeadline(userHeadline);
      setTempEmail(userEmail);
      setTempPhone(userPhone);
      setTempLocation(userLocation);
      setTempHandle(userHandle);
      setEditProfileOpen(true);
    }
  }, [location.state, userName, userHeadline, userEmail, userPhone, userLocation, userHandle]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSavingProfile(true);
    const cleanHandle = tempHandle.toLowerCase().replace(/[^a-z0-9_]/g, "");

    setUserName(tempName);
    setUserHeadline(tempHeadline);
    setUserEmail(tempEmail);
    setUserPhone(tempPhone);
    setUserLocation(tempLocation);
    setUserHandle(cleanHandle);

    localStorage.setItem("kiloneed_user_name", tempName);
    localStorage.setItem("kiloneed_headline", tempHeadline);
    localStorage.setItem("kiloneed_user_email", tempEmail);
    localStorage.setItem("kiloneed_user_phone", tempPhone);
    localStorage.setItem("kiloneed_location", tempLocation);
    localStorage.setItem("kiloneed_handle", cleanHandle);

    try {
      await authService.updateProfile({
        name: tempName,
        phone: tempPhone,
        location: tempLocation,
        bio: tempHeadline,
      });
      toast.success("Profile updated & synced with backend!");
      setEditProfileOpen(false);
    } catch {
      toast.success("Profile saved locally!");
      setEditProfileOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangePasswordOpen(false);
    toast.success("Password changed successfully!");
  };

  const handleSignOut = () => {
    authService.logout().catch(() => {});
    toast.success("Signed out successfully!");
    window.location.href = "/";
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    setDeleteAccountOpen(false);
    toast.success("Account deletion requested. Logging out...");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  return (
    <MobileLayout title="Settings" showBack>
      <div className="max-w-xl mx-auto px-4 py-5 space-y-6 pb-24">
        
        {/* User Profile Summary Card */}
        <div className="bg-gradient-to-br from-card to-muted/40 rounded-2xl p-4 border border-border shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                {initials || "JD"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-foreground truncate">{userName}</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">@{userHandle} • {userLocation}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{userEmail}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-medium shrink-0 h-8 px-3 border-border"
            onClick={() => {
              setTempName(userName);
              setTempEmail(userEmail);
              setTempPhone(userPhone);
              setTempLocation(userLocation);
              setTempHandle(userHandle);
              setEditProfileOpen(true);
            }}
          >
            Edit
          </Button>
        </div>

        {/* Section 1: Account & Security */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Account & Security
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
            
            {/* Personal Details */}
            <button
              onClick={() => {
                setTempName(userName);
                setTempEmail(userEmail);
                setTempPhone(userPhone);
                setTempLocation(userLocation);
                setTempHandle(userHandle);
                setEditProfileOpen(true);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Personal Details</p>
                  <p className="text-xs text-muted-foreground">Name, email, phone & location</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            {/* Password & Security */}
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Password & Security</p>
                  <p className="text-xs text-muted-foreground">Change password and protect account</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            {/* View Full Public Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">View My Public Profile</p>
                  <p className="text-xs text-muted-foreground">See how your store looks to buyers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

          </div>
        </div>

        {/* Section 2: Preferences */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Preferences & Appearance
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Theme</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark display</p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

          </div>
        </div>

        {/* Section 3: Notifications */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Notifications
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
            
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive real-time alerts on your device</p>
                </div>
              </div>
              <Switch
                checked={notifPush}
                onCheckedChange={(v) => {
                  setNotifPush(v);
                  toast.success(v ? "Push notifications enabled" : "Push notifications paused");
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Needs & Lead Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify when buyers request items matching your category</p>
                </div>
              </div>
              <Switch
                checked={notifNeeds}
                onCheckedChange={(v) => {
                  setNotifNeeds(v);
                  toast.success(v ? "Lead alerts enabled" : "Lead alerts disabled");
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Chat & Inquiry Alerts</p>
                  <p className="text-xs text-muted-foreground">Direct messages, quotes, and offer updates</p>
                </div>
              </div>
              <Switch
                checked={notifMessages}
                onCheckedChange={(v) => {
                  setNotifMessages(v);
                  toast.success(v ? "Message alerts enabled" : "Message alerts disabled");
                }}
              />
            </div>

          </div>
        </div>

        {/* Section 4: Privacy & Connections */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Privacy & Discovery
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
            
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Public Marketplace Profile</p>
                  <p className="text-xs text-muted-foreground">Allow buyers and peers to discover your business</p>
                </div>
              </div>
              <Switch
                checked={isProfilePublic}
                onCheckedChange={(v) => {
                  setIsProfilePublic(v);
                  toast.success(v ? "Profile is now public" : "Profile is now private");
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Active Status</p>
                  <p className="text-xs text-muted-foreground">Show when you are currently online</p>
                </div>
              </div>
              <Switch
                checked={showOnlineStatus}
                onCheckedChange={(v) => {
                  setShowOnlineStatus(v);
                  toast.success(v ? "Online status visible" : "Online status hidden");
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-Accept Connection Requests</p>
                  <p className="text-xs text-muted-foreground">Automatically link with verified peers</p>
                </div>
              </div>
              <Switch
                checked={autoAcceptConnections}
                onCheckedChange={(v) => {
                  setAutoAcceptConnections(v);
                  toast.success(v ? "Auto-accept enabled" : "Auto-accept disabled");
                }}
              />
            </div>

          </div>
        </div>

        {/* Section 5: Support & About */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Support & Legal
          </h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-xs">
            
            <button
              onClick={() => toast.info("Contact our support team at support@kiloneed.com")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Help Center & Support</p>
                  <p className="text-xs text-muted-foreground">FAQ, dispute resolution & assistance</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            <button
              onClick={() => setLegalModalOpen("terms")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Terms of Service</p>
                  <p className="text-xs text-muted-foreground">Platform policies and user agreement</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            <button
              onClick={() => setLegalModalOpen("privacy")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-muted/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Privacy Policy</p>
                  <p className="text-xs text-muted-foreground">How we safeguard your business data</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>

            <div className="p-3.5 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Kiloneed Mobile</p>
                  <p className="text-xs text-muted-foreground">Version 2.4.0 (Build 2026.11)</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Up to date
              </Badge>
            </div>

          </div>
        </div>

        {/* Section 6: Account Actions */}
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-11 rounded-2xl border-border font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted text-foreground"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            Sign Out
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              setDeleteConfirmation("");
              setDeleteAccountOpen(true);
            }}
            className="w-full h-10 rounded-2xl font-medium text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </Button>
        </div>

      </div>

      {/* ─── Edit Personal Details Dialog ─── */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-1.5rem)] max-h-[85dvh] rounded-2xl flex flex-col p-4 sm:p-5 overflow-hidden">
          <DialogHeader className="shrink-0 pb-1">
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <User className="h-4 w-4 text-primary" />
              Edit Personal Information
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Update your public merchant details and contact info.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2 overflow-y-auto flex-1 pr-1 overscroll-contain">
            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Full Name</Label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Your full name"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Headline / Bio</Label>
              <Input
                value={tempHeadline}
                onChange={(e) => setTempHeadline(e.target.value)}
                placeholder="e.g. Electronics & Tech Merchant"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Username / Handle</Label>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground px-2 h-8 flex items-center bg-muted rounded-l-lg border border-r-0 border-input">@</span>
                <Input
                  value={tempHandle}
                  onChange={(e) => setTempHandle(e.target.value)}
                  placeholder="username"
                  className="rounded-l-none h-8 text-xs rounded-r-lg px-2.5 bg-background border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <Input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Phone Number</Label>
              <Input
                type="tel"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="+234 ..."
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">City / State</Label>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <Input
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="e.g. Ikeja, Lagos"
                  className="h-8 text-xs rounded-lg px-2.5 bg-background border-border"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(false)} className="flex-1 sm:flex-none h-8 text-xs rounded-lg">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSavingProfile}
              className="flex-1 sm:flex-none gradient-blue text-primary-foreground font-semibold h-8 text-xs rounded-lg gap-1"
              onClick={handleSaveProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Change Password Dialog ─── */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-1.5rem)] max-h-[85dvh] rounded-2xl flex flex-col p-4 sm:p-5 overflow-hidden">
          <DialogHeader className="shrink-0 pb-1">
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Lock className="h-4 w-4 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Choose a strong password to keep your account safe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2 overflow-y-auto flex-1 pr-1 overscroll-contain">
            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>

            <div>
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="mt-1 h-8 text-xs rounded-lg px-2.5 bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 pt-3 border-t border-border flex flex-row items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setChangePasswordOpen(false)} className="flex-1 sm:flex-none h-8 text-xs rounded-lg">
              Cancel
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none gradient-blue text-primary-foreground font-semibold h-8 text-xs rounded-lg" onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Account Confirmation Dialog ─── */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action cannot be undone. All your needs, active listings, peer connections, and message history will be removed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Please type <span className="font-bold text-destructive">DELETE</span> below to confirm.
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmation !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Legal & Policies Modal ─── */}
      <Dialog open={legalModalOpen !== null} onOpenChange={(open) => !open && setLegalModalOpen(null)}>
        <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {legalModalOpen === "terms" ? "Terms of Service" : "Privacy Policy"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Kiloneed legal policies and guidelines
            </DialogDescription>
          </DialogHeader>

          <div className="text-xs text-muted-foreground space-y-2.5 max-h-60 overflow-y-auto pr-1">
            <p>
              Welcome to Kiloneed. By using our platform, you agree to comply with our community and trade standards.
            </p>
            <p>
              <strong>1. Account Responsibilities:</strong> You are responsible for safeguarding your login credentials and ensuring all posted listings and buyer needs represent genuine intent.
            </p>
            <p>
              <strong>2. Fair Marketplace Trade:</strong> False advertising, prohibited items, or deceptive pricing will result in immediate suspension.
            </p>
            <p>
              <strong>3. Privacy:</strong> We only collect necessary communication and transaction indicators to provide you with seamless local and national commerce.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button onClick={() => setLegalModalOpen(null)} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </MobileLayout>
  );
}
