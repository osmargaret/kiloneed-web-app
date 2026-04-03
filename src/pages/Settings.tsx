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
  Trash2, AlertTriangle, Shield, Bell, UserPlus, Plus
} from "lucide-react";

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
          <Button size="sm" className="gradient-blue text-primary-foreground">Save Name</Button>
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
          <Button size="sm" className="gradient-blue text-primary-foreground">Update Password</Button>
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
          <Button size="sm" className="gradient-blue text-primary-foreground">Update Location</Button>
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
              <Badge key={cat} variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors">
                {cat} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Add category" /></SelectTrigger>
              <SelectContent>
                {["Electronics", "Services", "Automotive", "Real Estate", "Fashion", "Food", "Health"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline"><Plus className="h-4 w-4" /></Button>
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
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">Default</Badge>
          </div>
          <Button size="sm" variant="outline" className="w-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add New Card
          </Button>
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
          <Button size="sm" className="gradient-blue text-primary-foreground">Save Link</Button>
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
                onCheckedChange={(v) => setPrivacySettings((p) => ({ ...p, [key]: v }))}
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
            <Switch checked={autoAcceptConnections} onCheckedChange={setAutoAcceptConnections} />
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
            <Switch checked={notifNeeds} onCheckedChange={setNotifNeeds} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notify followers</p>
              <p className="text-xs text-muted-foreground">Send notifications of new commodities, offers, discounts, or price changes to your followers.</p>
            </div>
            <Switch checked={notifFollowers} onCheckedChange={setNotifFollowers} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Danger Zone ─── */
function DangerSection() {
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
            <Input placeholder="Type DELETE to confirm" />
            <DialogFooter>
              <Button variant="destructive">I understand, delete my profile</Button>
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
