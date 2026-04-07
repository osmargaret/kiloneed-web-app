import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  User, Lock, MapPin, Tag, CreditCard, Eye, Link2,
  Trash2, AlertTriangle, Shield, Bell, UserPlus, Plus, X
} from "lucide-react";
import { toast } from "sonner";

/* ─── 30-day approval notice ─── */
const ApprovalBadge = () => (
  <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600 dark:text-amber-400 ml-2">
    * 30-day approval
  </Badge>
);

/* ─── Profile Settings ─── */
function ProfileSection() {
  const [profileName, setProfileName] = useState("John Doe");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [customLink, setCustomLink] = useState("johndoe");
  const [categories, setCategories] = useState(["Electronics", "Services"]);
  const [addCatValue, setAddCatValue] = useState("");

  // Payment cards
  const [cards, setCards] = useState([
    { id: 1, type: "VISA", last4: "4242", expiry: "12/26", isDefault: true },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [newCardName, setNewCardName] = useState("");

  const removeCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
    toast.success(`Removed "${cat}" category`);
  };

  const addCategory = (val: string) => {
    if (val && !categories.includes(val)) {
      setCategories(prev => [...prev, val]);
      toast.success(`Added "${val}" category. Change requires 30-day approval.`);
    }
    setAddCatValue("");
  };

  const handleAddCard = () => {
    if (!newCardNumber || !newCardExpiry || !newCardCvv || !newCardName) {
      toast.error("Please fill in all card fields");
      return;
    }
    const last4 = newCardNumber.replace(/\s/g, "").slice(-4);
    const type = newCardNumber.startsWith("5") ? "MC" : newCardNumber.startsWith("4") ? "VISA" : "CARD";
    setCards(prev => [...prev, { id: Date.now(), type, last4, expiry: newCardExpiry, isDefault: false }]);
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCvv("");
    setNewCardName("");
    setShowAddCard(false);
    toast.success("Card added successfully");
  };

  const setDefaultCard = (id: number) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    toast.success("Default card updated");
  };

  const removeCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
    toast.success("Card removed");
  };

  return (
    <div className="space-y-6">
      {/* Change Profile Name */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Name</CardTitle>
            <ApprovalBadge />
          </div>
          <CardDescription className="text-xs">Changes require 30 days from last update to take effect.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Enter profile name" />
          <Button size="sm" className="gradient-blue text-primary-foreground" onClick={() => toast.success("Name change submitted. Pending 30-day approval.")}>Save Name</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" placeholder="Current password" />
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <Button size="sm" className="gradient-blue text-primary-foreground" onClick={() => toast.success("Password updated successfully")}>Update Password</Button>
        </CardContent>
      </Card>

      {/* Change Location */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Location</CardTitle>
            <ApprovalBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter location" />
          <Button size="sm" className="gradient-blue text-primary-foreground" onClick={() => toast.success("Location change submitted. Pending 30-day approval.")}>Update Location</Button>
        </CardContent>
      </Card>

      {/* Change Categories */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Categories</CardTitle>
            <ApprovalBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeCategory(cat)}>
                {cat} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select value={addCatValue} onValueChange={setAddCatValue}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Add category" /></SelectTrigger>
              <SelectContent>
                {["Electronics", "Services", "Automotive", "Real Estate", "Fashion", "Food", "Health"]
                  .filter(c => !categories.includes(c))
                  .map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => addCategory(addCatValue)} disabled={!addCatValue}><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Payment Method</CardTitle>
          </div>
          <CardDescription className="text-xs">Manage cards on your account for billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cards.map(card => (
            <div key={card.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-12 rounded flex items-center justify-center ${card.type === "VISA" ? "bg-gradient-to-r from-blue-600 to-blue-400" : card.type === "MC" ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-gray-500 to-gray-400"}`}>
                  <span className="text-[10px] font-bold text-white">{card.type}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">•••• •••• •••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.isDefault ? (
                  <Badge variant="outline" className="text-[10px]">Default</Badge>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2" onClick={() => setDefaultCard(card.id)}>Set Default</Button>
                    <Button size="sm" variant="ghost" className="text-[10px] h-6 px-1 text-destructive" onClick={() => removeCard(card.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add New Card Dialog */}
          <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New Card
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Add Payment Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Cardholder Name</Label>
                  <Input value={newCardName} onChange={e => setNewCardName(e.target.value)} placeholder="John Doe" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Card Number</Label>
                  <Input value={newCardNumber} onChange={e => setNewCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Expiry</Label>
                    <Input value={newCardExpiry} onChange={e => setNewCardExpiry(e.target.value)} placeholder="MM/YY" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">CVV</Label>
                    <Input value={newCardCvv} onChange={e => setNewCardCvv(e.target.value)} placeholder="123" type="password" className="mt-1" />
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Button>
                <Button className="gradient-blue text-primary-foreground" onClick={handleAddCard}>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Customize Profile Link */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Link</CardTitle>
            <ApprovalBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">kiloneed.com/</span>
            <Input value={customLink} onChange={(e) => setCustomLink(e.target.value)} className="flex-1" placeholder="your-link" />
          </div>
          <Button size="sm" className="gradient-blue text-primary-foreground" onClick={() => toast.success(`Profile link saved: kiloneed.com/${customLink}. Pending 30-day approval.`)}>Save Link</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Privacy Settings ─── */
function PrivacySection() {
  const [privacySettings, setPrivacySettings] = useState({
    needs: true,
    commodities: true,
    connections: false,
    groups: true,
  });
  const [autoAcceptConnections, setAutoAcceptConnections] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Visibility</CardTitle>
          </div>
          <CardDescription className="text-xs">Choose what is public when people view your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(privacySettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-sm capitalize">{key}</Label>
              <Switch
                checked={value}
                onCheckedChange={(v) => {
                  setPrivacySettings((p) => ({ ...p, [key]: v }));
                  toast.success(`${key} visibility ${v ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Connection Requests</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-accept connection requests</p>
              <p className="text-xs text-muted-foreground">New requests will be accepted automatically.</p>
            </div>
            <Switch checked={autoAcceptConnections} onCheckedChange={(v) => { setAutoAcceptConnections(v); toast.success(v ? "Auto-accept enabled" : "Auto-accept disabled"); }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Notification Settings ─── */
function NotificationSection() {
  const [notifNeeds, setNotifNeeds] = useState(true);
  const [notifFollowers, setNotifFollowers] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Needs in my category</p>
              <p className="text-xs text-muted-foreground">Receive notifications for new needs matching your business category.</p>
            </div>
            <Switch checked={notifNeeds} onCheckedChange={(v) => { setNotifNeeds(v); toast.success(v ? "Need notifications enabled" : "Need notifications disabled"); }} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notify followers</p>
              <p className="text-xs text-muted-foreground">Send notifications of new commodities, offers, discounts, or price changes to your followers.</p>
            </div>
            <Switch checked={notifFollowers} onCheckedChange={(v) => { setNotifFollowers(v); toast.success(v ? "Follower notifications enabled" : "Follower notifications disabled"); }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Danger Zone ─── */
function DangerSection() {
  const [deleteInput, setDeleteInput] = useState("");

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Permanently delete your profile and all associated data. This cannot be undone.</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Profile
              </DialogTitle>
              <DialogDescription>
                This action is irreversible. All your needs, commodities, connections, and data will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <Input placeholder="Type DELETE to confirm" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} />
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={deleteInput !== "DELETE"}
                onClick={() => {
                  toast.success("Profile deletion requested. You will be logged out shortly.");
                  setDeleteInput("");
                }}
              >
                I understand, delete my profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ─── Settings Page ─── */
const Settings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger />
            <span className="font-display text-lg font-bold text-gradient-blue">KILONEED</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold font-display text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your profile, privacy, and preferences.
                  <span className="text-amber-600 dark:text-amber-400 ml-1">* Changes marked with * require 30-day approval.</span>
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 h-auto">
                  <TabsTrigger value="profile" className="text-xs flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="text-xs flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Privacy
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Notifs</span>
                  </TabsTrigger>
                  <TabsTrigger value="danger" className="text-xs flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" /> Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile"><ProfileSection /></TabsContent>
                <TabsContent value="privacy"><PrivacySection /></TabsContent>
                <TabsContent value="notifications"><NotificationSection /></TabsContent>
                <TabsContent value="danger"><DangerSection /></TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
