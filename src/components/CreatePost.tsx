import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Video, X, Send, MapPin } from "lucide-react";

interface PostData {
  id: number;
  text: string;
  media: { type: "image" | "video"; url: string }[];
  author: string;
  avatar: string;
  location: string;
  postedAt: string;
}

interface CreatePostProps {
  onPost: (post: PostData) => void;
}

const CreatePost = ({ onPost }: CreatePostProps) => {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState<{ type: "image" | "video"; url: string; file: File }[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files;
    if (!files) return;
    const newMedia = Array.from(files).map((file) => ({
      type,
      url: URL.createObjectURL(file),
      file,
    }));
    setMediaFiles((prev) => [...prev, ...newMedia]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = () => {
    if (!text.trim() && mediaFiles.length === 0) return;
    onPost({
      id: Date.now(),
      text: text.trim(),
      media: mediaFiles.map(({ type, url }) => ({ type, url })),
      author: "You",
      avatar: "YO",
      location: "Your Location",
      postedAt: "Just now",
    });
    setText("");
    setMediaFiles([]);
  };

  return (
    <div className="gradient-card rounded-xl border border-border p-3 shadow-card sm:rounded-2xl sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-blue text-xs font-bold text-primary-foreground sm:h-10 sm:w-10">
          YO
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you need?"
            rows={3}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />

          {/* Media previews */}
          <AnimatePresence>
            {mediaFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 flex flex-wrap gap-1.5 sm:gap-2"
              >
                {mediaFiles.map((media, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                    {media.type === "image" ? (
                      <img src={media.url} alt="" className="h-20 w-20 object-cover sm:h-24 sm:w-24" />
                    ) : (
                      <video src={media.url} className="h-20 w-20 object-cover sm:h-24 sm:w-24" />
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground sm:px-3 sm:text-xs"
              >
                <Image className="h-4 w-4" />
                Photo
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground sm:px-3 sm:text-xs"
              >
                <Video className="h-4 w-4" />
                Video
              </button>
              <span className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-muted-foreground sm:px-3 sm:text-xs">
                <MapPin className="h-3.5 w-3.5" />
                Auto-locate
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() && mediaFiles.length === 0}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg gradient-blue px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:text-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Post
            </button>
          </div>

          <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFileSelect(e, "image")} />
          <input ref={videoInputRef} type="file" accept="video/*" multiple hidden onChange={(e) => handleFileSelect(e, "video")} />
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
