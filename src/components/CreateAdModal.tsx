import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  ShoppingBag,
  Star,
  MessageSquare,
  Bell,
  User,
  Sparkles,
  DollarSign,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { adsApiService, api } from "@/services/apiClient";
import { AdItem } from "@/pages/Ads";

interface CreateAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdCreated: (newAd: AdItem) => void;
}

const PLACEMENTS = [
  { id: "Marketplace Featured", label: "Marketplace Featured", price: "₦5,000/wk", icon: ShoppingBag },
  { id: "Need Feed Sidebar", label: "Need Feed Spotlight", price: "₦3,000/day", icon: Star },
  { id: "Messages Priority", label: "Messages Priority", price: "₦1,500/day", icon: MessageSquare },
  { id: "Notification Push", label: "Push Notification Blast", price: "₦2,000/blast", icon: Bell },
  { id: "Profile Sidebar", label: "Profile Sidebar CTA", price: "₦4,000/wk", icon: User },
];

const FORMATS = ["Image & Text", "Video & Text", "Image Slider / Banner"];

const BUDGET_PRESETS = [5000, 10000, 25000, 50000, 100000];

export const CreateAdModal: React.FC<CreateAdModalProps> = ({
  open,
  onOpenChange,
  onAdCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placement, setPlacement] = useState("Marketplace Featured");
  const [adType, setAdType] = useState("Image & Text");
  const [budget, setBudget] = useState("25000");
  const [durationDays, setDurationDays] = useState("14");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPlacement("Marketplace Featured");
    setAdType("Image & Text");
    setBudget("25000");
    setDurationDays("14");
    setTargetUrl("");
    setImageUrl("");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const localPreview = URL.createObjectURL(file);
    setImageUrl(localPreview);

    setIsUploading(true);
    try {
      const res = await api.upload(file);
      if (res?.url) {
        setImageUrl(res.url);
        toast.success("Image uploaded successfully");
      }
    } catch {
      // Local preview is preserved
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a campaign title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a campaign description");
      return;
    }

    const parsedBudget = Number(budget) || 10000;
    const days = parseInt(durationDays) || 14;
    const finalImage =
      imageUrl.trim() ||
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&fit=crop";

    setIsSubmitting(true);
    try {
      const res = await adsApiService.createAd({
        title: title.trim(),
        description: description.trim(),
        ad_type: adType,
        placement,
        budget: parsedBudget,
        media_url: finalImage,
        target_url: targetUrl.trim() || undefined,
      });

      const serverAd = res?.ad;
      const newAdObj: AdItem = {
        id: serverAd?.id ? String(serverAd.id) : "ad_" + Date.now(),
        title: serverAd?.title || title.trim(),
        description: serverAd?.description || description.trim(),
        type: serverAd?.ad_type || adType,
        placement: serverAd?.placement || placement,
        status: "active",
        startDate: new Date().toISOString().slice(0, 10),
        duration: `${days} days`,
        remaining: `${days} days`,
        views: 0,
        clicks: 0,
        ctr: "0.0%",
        budget: parsedBudget,
        spent: 0,
        image: serverAd?.media_url || finalImage,
        targetUrl: targetUrl.trim() || undefined,
      };

      onAdCreated(newAdObj);
      toast.success("Ad campaign launched and synced live with the backend!");
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create ad campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-border bg-card">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-blue flex items-center justify-center text-primary-foreground shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
                    Create New Ad Campaign
                  </DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                    Broadcast your products, store, or service across high-traffic zones.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Ad Title */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-foreground">
              Campaign Title / Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wholesale MacBook 96W USB-C Adapters - 20% Off"
              className="h-8.5 text-xs rounded-xl bg-background border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-foreground">
              Ad Description / Promotional Copy <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your promotion, offer terms, warranty, or delivery details to attract buyers..."
              rows={3}
              className="text-xs rounded-xl bg-background border-border resize-none"
              required
            />
          </div>

          {/* Placement Selection */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-foreground">
              Campaign Placement Zone
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PLACEMENTS.map((p) => {
                const Icon = p.icon;
                const isSelected = placement === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlacement(p.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 text-foreground shadow-xs"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-[11px] truncate">{p.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-[9px] shrink-0 font-mono">
                      {p.price}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ad Format / Type */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-foreground">
              Format Type
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {FORMATS.map((f) => {
                const isSelected = adType === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setAdType(f)}
                    className={`py-1.5 px-2 rounded-xl border text-center text-[10px] font-medium transition-all ${
                      isSelected
                        ? "gradient-blue text-primary-foreground border-transparent shadow-xs"
                        : "border-border hover:bg-muted/50 text-foreground bg-muted/20"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media / Banner Upload & Preview */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
              <span>Banner Image / Media</span>
              {isUploading && <span className="text-[10px] text-primary">Uploading...</span>}
            </Label>

            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-border/80 h-32 bg-muted/30 mb-2">
                <img src={imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs rounded-xl h-8 gap-1.5 shrink-0"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Image
              </Button>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="h-8 text-xs rounded-xl bg-background border-border flex-1"
              />
            </div>
          </div>

          {/* Budget & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground">
                Campaign Budget (₦)
              </Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="25000"
                className="h-8 text-xs rounded-xl bg-background border-border"
                min="1000"
              />
              <div className="flex gap-1 pt-1 overflow-x-auto scrollbar-none">
                {BUDGET_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(String(b))}
                    className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      Number(budget) === b
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    ₦{(b / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-foreground">
                Duration (Days)
              </Label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="14"
                className="h-8 text-xs rounded-xl bg-background border-border"
                min="1"
                max="90"
              />
              <div className="flex gap-1 pt-1">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(String(d))}
                    className={`text-[9px] px-2 py-0.5 rounded border ${
                      Number(durationDays) === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Destination URL */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <LinkIcon className="h-3 w-3 text-primary" /> Target Action URL (Optional)
            </Label>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. https://kiloneed.com/marketplace or product link"
              className="h-8 text-xs rounded-xl bg-background border-border"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-xl h-8 px-4"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="gradient-blue text-primary-foreground rounded-xl text-xs font-semibold h-8 px-4 shadow-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Launching...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Launch Ad Campaign
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default CreateAdModal;

