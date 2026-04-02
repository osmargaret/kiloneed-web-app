import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import CreatePost from "@/components/CreatePost";
import FeedPost from "@/components/FeedPost";

interface PostMedia {
  type: "image" | "video";
  url: string;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  location: string;
  text: string;
  media: PostMedia[];
  postedAt: string;
  expiresAt?: string;
  radius?: string;
  saves?: number;
  shares?: number;
  reposts?: number;
  recos?: number;
  comments?: Comment[];
}

const seedPosts: Post[] = [
  {
    id: 1,
    author: "Adebayo Ogunlesi",
    avatar: "AO",
    location: "Ikeja, Lagos",
    radius: "5km",
    text: "I need a reliable electrician for a full rewiring job in a 3-bedroom flat. Must be available this weekend. Budget ₦80,000–₦120,000.",
    media: [],
    postedAt: "2h ago",
    expiresAt: "3 days left",
    saves: 12,
    shares: 4,
    reposts: 2,
    recos: 8,
    comments: [
      { id: 1, author: "ChiefSparks NG", text: "I can handle this. 10 years experience. DM me.", time: "1h ago" },
      { id: 2, author: "Emeka Voltage", text: "Available this Saturday. Licensed. ₦95k all inclusive.", time: "45m ago" },
    ],
  },
  {
    id: 2,
    author: "Fatima Bello",
    avatar: "FB",
    location: "Wuse, Abuja",
    radius: "10km",
    text: "Looking for a Samsung Galaxy S24 Ultra, 256GB, any colour. Must be brand new and sealed. Budget up to ₦750,000.",
    media: [],
    postedAt: "5h ago",
    expiresAt: "7 days left",
    saves: 24,
    shares: 11,
    reposts: 5,
    recos: 15,
    comments: [
      { id: 1, author: "PhoneHub Abuja", text: "We have Phantom Black in stock. ₦720k. Can deliver today.", time: "3h ago" },
    ],
  },
  {
    id: 3,
    author: "Chinedu Okoro",
    avatar: "CO",
    location: "GRA, Port Harcourt",
    radius: "3km",
    text: "Need a professional photographer for a product shoot. 50 items for an online store. Studio or on-location.",
    media: [],
    postedAt: "1d ago",
    expiresAt: "5 days left",
    saves: 7,
    shares: 3,
    reposts: 1,
    recos: 4,
    comments: [],
  },
];

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>(seedPosts);

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger />
            <span className="font-display text-lg font-bold text-gradient-blue">KILONEED</span>
          </header>

          {/* Feed content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
              <CreatePost onPost={handleNewPost} />
              {posts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Feed;
