export type PrivacyOption = "public" | "connections" | "groups" | "only_me";

export interface NeedMedia {
  type: "image" | "video" | "document";
  url: string;
  name?: string;
  size?: string;
  alt?: string;
}

export interface Comment {
  id: number;
  author: string;
  avatar?: string;
  text: string;
  time: string;
}

export interface NeedChatMessage {
  id: string;
  sender: string;
  senderAvatar?: string;
  text: string;
  time: string;
  isMine: boolean;
}

export interface NeedAnalytics {
  clicks: number;
  responses: number;
  mentions: number;
}

export interface Need {
  id: number | string;
  author: string;
  authorId?: number | string;
  avatar: string;
  avatarUrl?: string;
  location: string;
  country?: string;
  state?: string;
  city?: string;
  distanceKm: number;
  radius?: string;
  title?: string;
  text: string; // Description
  media: NeedMedia[];
  categories: string[]; // Industry & categories
  privacy: PrivacyOption;
  createdAt: number; // Timestamp in ms for oldest -> newest sorting
  postedAt: string;
  expiresAt: number; // Timestamp in ms
  expiresInText?: string;
  analytics: NeedAnalytics;
  saves: number; // Bookmarks
  shares: number;
  reposts: number;
  recos: number;
  comments: Comment[];
  chats?: NeedChatMessage[];
  isBookmarked?: boolean;
  isReposted?: boolean;
}
