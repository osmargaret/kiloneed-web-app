import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaPreviewProps {
  file: File;
  type: "image" | "video";
  onRemove: () => void;
}

const MediaPreview = ({ file, type, onRemove }: MediaPreviewProps) => {
  const url = URL.createObjectURL(file);

  return (
    <div className="relative inline-block rounded-lg overflow-hidden border border-border bg-muted">
      {type === "image" ? (
        <img src={url} alt="Preview" className="h-20 w-20 object-cover" onLoad={() => URL.revokeObjectURL(url)} />
      ) : (
        <video src={url} className="h-20 w-20 object-cover" onLoadedData={() => URL.revokeObjectURL(url)} />
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 rounded-full"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <span className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[10px] text-center py-0.5 truncate px-1">
        {file.name}
      </span>
    </div>
  );
};

export default MediaPreview;
