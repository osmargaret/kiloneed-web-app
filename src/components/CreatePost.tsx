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
    <div className="gradient-card rounded-2xl border border-border shadow-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
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
                className="flex flex-wrap gap-2 mt-2"
              >
                {mediaFiles.map((media, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                    {media.type === "image" ? (
                      <img src={media.url} alt="" className="h-24 w-24 object-cover" />
                    ) : (
                      <video src={media.url} className="h-24 w-24 object-cover" />
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Image className="h-4 w-4" />
                Photo
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Video className="h-4 w-4" />
                Video
              </button>
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Auto-locate
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() && mediaFiles.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-blue text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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
