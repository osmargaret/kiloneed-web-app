import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Heart, MessageCircle, Share2, Bookmark, Send, MoreHorizontal,
  BookmarkCheck, HeartOff,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface GroupPostComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface GroupPostData {
  id: string;
  author: string;
  avatar: string;
  text: string;
  image?: string;
  time: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  shared: boolean;
  comments: GroupPostComment[];
}

interface GroupPostProps {
  post: GroupPostData;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onUsernameClick: (name: string) => void;
}

const GroupPost = ({ post, onLike, onSave, onShare, onComment, onUsernameClick }: GroupPostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <Card className="gradient-card border-border overflow-hidden">
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {post.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <button
                onClick={() => onUsernameClick(post.author)}
                className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block text-left"
              >
                {post.author}
              </button>
              <p className="text-[10px] text-muted-foreground">{post.time}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Post reported")}>Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Post hidden")}>Hide</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">{post.text}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <img src={post.image} alt="Post" className="w-full h-auto max-h-72 object-cover" loading="lazy" />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
          <span>{post.likes} like{post.likes !== 1 ? "s" : ""}</span>
          <span>{post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 text-xs h-8 px-2 ${post.liked ? "text-red-500" : "text-muted-foreground"}`}
            onClick={() => onLike(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs h-8 px-2 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 text-xs h-8 px-2 ${post.shared ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => onShare(post.id)}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 text-xs h-8 px-2 ${post.saved ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => onSave(post.id)}
          >
            {post.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 border-t border-border pt-2">
            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">{c.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg px-2.5 py-1.5">
                    <button
                      onClick={() => onUsernameClick(c.author)}
                      className="text-[10px] sm:text-xs font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {c.author}
                    </button>
                    <p className="text-[10px] sm:text-xs text-foreground">{c.text}</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 px-1">{c.time}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Write a comment..."
                className="h-8 text-xs bg-secondary border-border flex-1"
              />
              <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleComment} disabled={!commentText.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupPost;
