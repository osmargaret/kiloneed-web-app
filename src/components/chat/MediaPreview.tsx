import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, FileText } from "lucide-react";

interface MediaPreviewProps {
  file: File;
  type: "image" | "video";
  onRemove: () => void;
}

const MediaPreview = ({ file, type, onRemove }: MediaPreviewProps) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);
    return () => {
      URL.revokeObjectURL(objUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
      {type === "image" ? (
        <img src={url} alt="Preview" className="h-20 w-20 object-cover" />
      ) : type === "video" ? (
        <video src={url} className="h-20 w-20 object-cover" />
      ) : (
        <div className="h-20 w-20 flex flex-col items-center justify-center p-2 text-muted-foreground">
          <FileText className="h-6 w-6" />
          <span className="text-[10px] truncate max-w-full">{file.name}</span>
        </div>
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 rounded-full shadow-md"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 truncate px-1">
        {file.name}
      </span>
    </div>
  );
};

export default MediaPreview;
