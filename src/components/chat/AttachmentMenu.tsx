import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Camera, Image, Video, MapPin, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface AttachmentMenuProps {
  onFileSelect: (file: File, type: "image" | "video") => void;
  onLocationShare: () => void;
  disabled?: boolean;
}

const AttachmentMenu = ({ onFileSelect, onLocationShare, disabled }: AttachmentMenuProps) => {
  const [open, setOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, type);
      setOpen(false);
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" disabled={disabled} title="Attach media">
            <Paperclip className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto p-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                cameraInputRef.current?.click();
              }}
            >
              <Camera className="h-4 w-4 text-primary" />
              Camera
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                imageInputRef.current?.click();
              }}
            >
              <Image className="h-4 w-4 text-accent-foreground" />
              Gallery
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                videoInputRef.current?.click();
              }}
            >
              <Video className="h-4 w-4 text-destructive" />
              Video
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                onLocationShare();
                setOpen(false);
              }}
            >
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default AttachmentMenu;
