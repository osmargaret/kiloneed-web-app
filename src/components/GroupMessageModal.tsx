import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface GroupMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
}

const GroupMessageModal = ({ open, onOpenChange, userName }: GroupMessageModalProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    toast.success(`Message sent to ${userName}!`);
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gradient-card border-border max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Message @{userName}</DialogTitle>
          <DialogDescription>Start a conversation with {userName}</DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write a message to ${userName}...`}
            className="bg-secondary border-border resize-none"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={!message.trim()} className="gradient-blue text-primary-foreground gap-1">
            <Send className="h-4 w-4" /> Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMessageModal;
