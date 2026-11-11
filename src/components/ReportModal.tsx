import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ShieldCheck, Flag } from "lucide-react";
import { toast } from "sonner";
import { needsStore } from "@/services/needsStore";
import { Need } from "@/types/need";

interface ReportModalProps {
  need: Need;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS = [
  "Spam, fraudulent or scam request",
  "Misleading or deceptive information",
  "Prohibited or illegal item/service",
  "Harassment, hate speech or abuse",
  "Expired, duplicate or invalid need",
  "Other reason",
];

export const ReportModal: React.FC<ReportModalProps> = ({
  need,
  open,
  onOpenChange,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    needsStore.reportNeed(need.id, selectedReason, details);
    setSubmitted(true);
    toast.success("Abuse report submitted to KiloNeed Admin. Thank you!");
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl border-border bg-card p-5">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Report Need to Admin
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Help keep KiloNeed safe and trustworthy. Select the reason you are reporting this need by @{need.author}.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-foreground">Report Received</p>
            <p className="text-xs text-muted-foreground">
              Our safety and moderation team will review this listing shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Select Reason
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                      selectedReason === reason
                        ? "border-primary/50 bg-primary/5 font-semibold text-foreground"
                        : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-primary h-3.5 w-3.5"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Additional Details (Optional)
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any context that helps administrators investigate..."
                rows={3}
                className="text-xs rounded-xl bg-background border-border"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSubmit}
                className="text-xs font-bold rounded-xl gap-1.5"
              >
                <Flag className="h-3.5 w-3.5" />
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
