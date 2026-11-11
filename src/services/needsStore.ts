import { Need, NeedChatMessage, Comment, NeedMedia } from "@/types/need";
import { needsApiService } from "./apiClient";

const STORAGE_NEEDS = "kiloneed_needs_feed";
const STORAGE_BOOKMARKS = "kiloneed_bookmarks";
const STORAGE_NOTIFICATIONS = "kiloneed_notifications";
const STORAGE_BLOCKED = "kiloneed_blocked_authors";
const STORAGE_REPOSTS = "kiloneed_reposts";
const STORAGE_REPORTS = "kiloneed_reports";

export const USER_INDUSTRY = "Electronics";
export const USER_GEOFENCE_RADIUS_KM = 50;
export const USER_CURRENT_LOCATION = "Ikeja, Lagos";

export const USER_CONNECTIONS: string[] = [];
export const USER_GROUPS: string[] = [];

export const MOCK_AUTHORS: string[] = [
  "Adaeze Okafor",
  "Emeka Nwosu",
  "Halima Sani",
  "Bola Tinubu Jr",
  "Adebayo Ogunlesi",
  "Kemi Adeosun",
  "David Okonkwo",
  "Sarah Chen",
  "Yusuf Abdullahi",
  "Segun Alade",
];

const initialSeedNeeds: Need[] = [];

export const needsStore = {
  getRawNeeds(): Need[] {
    const raw = localStorage.getItem(STORAGE_NEEDS);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const clean = parsed.filter(
        (n: Need) => !MOCK_AUTHORS.includes(n.author) && !MOCK_AUTHORS.includes((n as any).user?.name || "")
      );
      if (clean.length !== parsed.length) {
        this.saveRawNeeds(clean);
      }
      return clean;
    } catch {
      return [];
    }
  },

  saveRawNeeds(needs: Need[]): void {
    localStorage.setItem(STORAGE_NEEDS, JSON.stringify(needs));
  },

  async syncWithBackend(): Promise<Need[]> {
    try {
      const res = await needsApiService.getFeed({ pageSize: 100, sort: "newest" });
      if (res && Array.isArray(res.needs)) {
        const clean = res.needs.filter(
          (n: Need) => !MOCK_AUTHORS.includes(n.author) && !MOCK_AUTHORS.includes((n as any).user?.name || "")
        );
        this.saveRawNeeds(clean);
        return clean;
      }
    } catch {
      // Backend offline or unreachable
    }
    return this.getRawNeeds();
  },

  getBlockedAuthors(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_BLOCKED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  blockAuthor(author: string): void {
    const blocked = this.getBlockedAuthors();
    if (!blocked.includes(author)) {
      blocked.push(author);
      localStorage.setItem(STORAGE_BLOCKED, JSON.stringify(blocked));
    }
  },

  unblockAuthor(author: string): void {
    const blocked = this.getBlockedAuthors().filter((a) => a !== author);
    localStorage.setItem(STORAGE_BLOCKED, JSON.stringify(blocked));
  },

  getNeeds(options?: {
    searchQuery?: string;
    category?: string;
    industryCategory?: string;
    type?: string;
    country?: string;
    state?: string;
    city?: string;
    maxDistanceKm?: number;
    ignoreGeofence?: boolean;
    ignoreIndustry?: boolean;
    page?: number;
    pageSize?: number;
  }): { needs: Need[]; totalCount: number; hasMore: boolean } {
    const all = this.getRawNeeds();
    const blocked = this.getBlockedAuthors();
    const currentTime = Date.now();
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "John Doe";
    const selectedCategory = options?.category ?? options?.industryCategory ?? "all";
    const selectedType = options?.type || "all";
    const search = options?.searchQuery?.trim().toLowerCase() || "";

    const filtered = all.filter((need) => {
      if (blocked.includes(need.author)) return false;
      if (need.expiresAt && need.expiresAt <= currentTime) return false;

      // CSC Location filtering (Country, State, City)
      if (options?.country && options.country.toLowerCase() !== "all") {
        const cMatch = (need.country || "").toLowerCase() === options.country.toLowerCase() ||
          need.location.toLowerCase().includes(options.country.toLowerCase());
        if (!cMatch && need.author !== currentUserName) {
          return false;
        }
      }

      if (options?.state && options.state.toLowerCase() !== "all") {
        const sMatch = (need.state || "").toLowerCase() === options.state.toLowerCase() ||
          need.location.toLowerCase().includes(options.state.toLowerCase());
        if (!sMatch && need.author !== currentUserName) {
          return false;
        }
      }

      if (options?.city && options.city.toLowerCase() !== "all") {
        const ctMatch = (need.city || "").toLowerCase() === options.city.toLowerCase() ||
          need.location.toLowerCase().includes(options.city.toLowerCase());
        if (!ctMatch && need.author !== currentUserName) {
          return false;
        }
      }

      if (!options?.ignoreIndustry && selectedCategory && selectedCategory !== "all") {
        const matchesCategory = need.categories.some(
          (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchesCategory && need.author !== currentUserName) {
          return false;
        }
      }

      if (selectedType && selectedType !== "all") {
        if (selectedType === "public") {
          if (need.privacy !== "public") return false;
        } else if (selectedType === "connections") {
          if (need.privacy !== "connections") return false;
        } else if (selectedType === "groups") {
          if (need.privacy !== "groups") return false;
        } else if (selectedType === "urgent") {
          const isUrgent =
            (need.title && /urgent/i.test(need.title)) ||
            /urgent/i.test(need.text) ||
            need.categories.some((c) => /urgent/i.test(c));
          if (!isUrgent) return false;
        } else if (selectedType === "media") {
          if (!need.media || need.media.length === 0) return false;
        }
      }

      if (need.author !== currentUserName) {
        if (need.privacy === "only_me") return false;
      }

      if (search) {
        const inTitle = (need.title || "").toLowerCase().includes(search);
        const inText = need.text.toLowerCase().includes(search);
        const inAuthor = need.author.toLowerCase().includes(search);
        const inCategory = need.categories.some((c) => c.toLowerCase().includes(search));
        const inImageAlt = need.media?.some(
          (m) => m.alt && m.alt.toLowerCase().includes(search)
        );

        if (!inTitle && !inText && !inAuthor && !inCategory && !inImageAlt) {
          return false;
        }
      }

      return true;
    });

    // Newest to Oldest ("newest up")
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const pageSize = options?.pageSize || 4;
    const page = options?.page || 1;
    const paginated = filtered.slice(0, page * pageSize);

    return {
      needs: paginated,
      totalCount: filtered.length,
      hasMore: paginated.length < filtered.length,
    };
  },

  addNeed(needData: {
    text: string;
    title?: string;
    media: NeedMedia[];
    categories: string[];
    privacy: "public" | "connections" | "groups" | "only_me";
    expiresInHours?: number;
  }): Need {
    const raw = this.getRawNeeds();
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const userAvatar = localStorage.getItem("kiloneed_avatar") || "";
    const initials =
      currentUserName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "ME";

    const hours = needData.expiresInHours || 24;
    const createdAt = Date.now();
    const expiresAt = createdAt + hours * 3600 * 1000;

    const userCountry = localStorage.getItem("kiloneed_country") || "Nigeria";
    const userState = localStorage.getItem("kiloneed_state") || "Lagos";
    const userCity = localStorage.getItem("kiloneed_city") || "Ikeja";
    const userLocation = (needData as any).location || localStorage.getItem("kiloneed_location") || `${userCity}, ${userState}, ${userCountry}`;

    const newNeed: Need = {
      id: Date.now(),
      author: currentUserName,
      avatar: initials,
      avatarUrl: userAvatar || undefined,
      location: userLocation,
      country: (needData as any).country || userCountry,
      state: (needData as any).state || userState,
      city: (needData as any).city || userCity,
      distanceKm: 0,
      radius: "CSC",
      title: needData.title || needData.text.slice(0, 50) + "...",
      text: needData.text,
      media: needData.media,
      categories: needData.categories.length > 0 ? needData.categories : [USER_INDUSTRY],
      privacy: needData.privacy,
      createdAt,
      postedAt: "Just now",
      expiresAt,
      expiresInText: `${hours} hours left`,
      analytics: {
        clicks: 0,
        responses: 0,
        mentions: 0,
      },
      saves: 0,
      shares: 0,
      reposts: 0,
      recos: 0,
      comments: [],
      chats: [],
    };

    raw.push(newNeed);
    this.saveRawNeeds(raw);

    needsApiService.createNeed({
      title: newNeed.title,
      text: newNeed.text,
      categories: newNeed.categories,
      privacy: newNeed.privacy,
      expires_in_hours: hours,
      media: newNeed.media,
      location: newNeed.location,
      country: newNeed.country,
      state: newNeed.state,
      city: newNeed.city,
      radius: newNeed.radius,
    }).then((res) => {
      if (res && res.need && res.need.id) {
        const updated = this.getRawNeeds().map((n) => n.id === newNeed.id ? { ...n, id: res.need.id } : n);
        this.saveRawNeeds(updated);
      }
    }).catch(() => {});

    return newNeed;
  },

  incrementClick(needId: number | string): void {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === needId);
    if (target) {
      target.analytics.clicks = (target.analytics.clicks || 0) + 1;
      this.saveRawNeeds(all);
      needsApiService.incrementClick(needId).catch(() => {});
    }
  },

  addResponse(needId: number | string, messageText: string): NeedChatMessage {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === needId);
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const newMsg: NeedChatMessage = {
      id: "msg_" + Date.now(),
      sender: currentUserName,
      text: messageText,
      time: "Just now",
      isMine: true,
    };

    if (target) {
      if (!target.chats) target.chats = [];
      target.chats.push(newMsg);
      target.analytics.responses = (target.analytics.responses || 0) + 1;
      this.saveRawNeeds(all);
      needsApiService.sendChat(needId, messageText).catch(() => {});
    }

    return newMsg;
  },

  async addComment(needId: number | string, text: string): Promise<Comment> {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === needId);
    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    const optimisticComment: Comment = {
      id: Date.now(),
      author: currentUserName,
      text,
      time: "Just now",
    };

    if (target) {
      if (!target.comments) target.comments = [];
      target.comments.push(optimisticComment);
      target.analytics.responses = (target.analytics.responses || 0) + 1;
      this.saveRawNeeds(all);
    }

    try {
      const res = await needsApiService.addComment(needId, text);
      if (res && res.comment) {
        const serverComment: Comment = {
          id: res.comment.id || optimisticComment.id,
          author: res.comment.author || currentUserName,
          text: res.comment.text || text,
          time: res.comment.time || "Just now",
        };
        if (target) {
          target.comments = target.comments.map((c) => c.id === optimisticComment.id ? serverComment : c);
          this.saveRawNeeds(all);
        }
        return serverComment;
      }
    } catch {
      // offline fallback maintains optimisticComment
    }

    return optimisticComment;
  },

  async mentionPeers(
    needId: number | string,
    selectedPeers: string[],
    needSnippet: string
  ): Promise<{ mentions: number }> {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === needId);
    let newMentions = 0;
    if (target) {
      target.analytics.mentions = (target.analytics.mentions || 0) + selectedPeers.length;
      newMentions = target.analytics.mentions;
      this.saveRawNeeds(all);
    }

    const currentUserName = localStorage.getItem("kiloneed_user_name") || "You";
    try {
      const rawNotifs = localStorage.getItem(STORAGE_NOTIFICATIONS);
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];

      selectedPeers.forEach((peer) => {
        notifs.unshift({
          id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          type: "mention",
          title: `${currentUserName} mentioned you to attend to a need`,
          description: `Regarding: "${needSnippet.slice(0, 60)}..."`,
          detail: `You were recommended by ${currentUserName} to attend to this need within your industry. Click to view need details and respond.`,
          from: currentUserName,
          time: "Just now",
          read: false,
          needId,
        });
      });

      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
    } catch {
      // ignore
    }

    try {
      const res = await needsApiService.mentionPeers(needId, selectedPeers, needSnippet);
      if (res && typeof res.mentions === "number") {
        if (target) {
          target.analytics.mentions = res.mentions;
          this.saveRawNeeds(all);
        }
        return { mentions: res.mentions };
      }
    } catch {
      // offline fallback
    }

    return { mentions: newMentions };
  },

  async toggleBookmark(need: Need): Promise<{ bookmarked: boolean; saves: number }> {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === need.id);
    let bookmarked = false;
    let savesCount = target?.saves ?? need.saves ?? 0;

    try {
      const raw = localStorage.getItem(STORAGE_BOOKMARKS);
      let bookmarks: any[] = raw ? JSON.parse(raw) : [];

      const existsIdx = bookmarks.findIndex((b) => String(b.id) === String(need.id));
      if (existsIdx >= 0) {
        bookmarks.splice(existsIdx, 1);
        bookmarked = false;
        savesCount = Math.max(0, savesCount - 1);
      } else {
        bookmarks.unshift({
          id: String(need.id),
          type: "need",
          title: need.title || need.text.slice(0, 50),
          description: need.text,
          author: need.author,
          location: need.location,
          savedAt: "Just now",
          expiresAt: need.expiresInText || "Within 24h",
        });
        bookmarked = true;
        savesCount += 1;
      }

      if (target) {
        target.saves = savesCount;
        target.isBookmarked = bookmarked;
      }
      localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(bookmarks));
      this.saveRawNeeds(all);
    } catch {
      // ignore
    }

    try {
      const res = await needsApiService.toggleBookmark(need.id);
      if (res && typeof res.saves === "number") {
        if (target) {
          target.saves = res.saves;
          target.isBookmarked = res.bookmarked;
          this.saveRawNeeds(all);
        }
        return { bookmarked: res.bookmarked, saves: res.saves };
      }
    } catch {
      // offline fallback
    }

    return { bookmarked, saves: savesCount };
  },

  async repostNeed(need: Need): Promise<{ reposted: boolean; reposts: number }> {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === need.id);
    let reposted = true;
    let repostsCount = (target?.reposts ?? need.reposts ?? 0) + 1;

    try {
      const raw = localStorage.getItem(STORAGE_REPOSTS);
      let reposts: any[] = raw ? JSON.parse(raw) : [];
      const existsIdx = reposts.findIndex((r) => String(r.needId) === String(need.id));

      if (existsIdx >= 0) {
        reposts.splice(existsIdx, 1);
        reposted = false;
        repostsCount = Math.max(0, (target?.reposts ?? 1) - 1);
      } else {
        reposts.unshift({
          needId: need.id,
          repostedAt: Date.now(),
          author: need.author,
          text: need.text,
        });
        reposted = true;
      }

      if (target) {
        target.reposts = repostsCount;
        target.isReposted = reposted;
      }
      localStorage.setItem(STORAGE_REPOSTS, JSON.stringify(reposts));
      this.saveRawNeeds(all);
    } catch {
      // ignore
    }

    try {
      const res = await needsApiService.repostNeed(need.id);
      if (res && typeof res.reposts === "number") {
        if (target) {
          target.reposts = res.reposts;
          target.isReposted = res.reposted;
          this.saveRawNeeds(all);
        }
        return { reposted: res.reposted, reposts: res.reposts };
      }
    } catch {
      // offline fallback
    }

    return { reposted, reposts: repostsCount };
  },

  async shareNeed(needId: number | string): Promise<number> {
    const all = this.getRawNeeds();
    const target = all.find((n) => n.id === needId);
    let shares = (target?.shares || 0) + 1;
    if (target) {
      target.shares = shares;
      this.saveRawNeeds(all);
    }

    try {
      const res = await needsApiService.shareNeed(needId);
      if (res && typeof res.shares === "number") {
        if (target) {
          target.shares = res.shares;
          this.saveRawNeeds(all);
        }
        return res.shares;
      }
    } catch {
      // offline fallback
    }

    return shares;
  },

  reportNeed(needId: number | string, reason: string, details?: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_REPORTS);
      const reports = raw ? JSON.parse(raw) : [];
      reports.unshift({
        needId,
        reason,
        details: details || "",
        reportedAt: Date.now(),
      });
      localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
    } catch {
      // ignore
    }

    needsApiService.reportNeed(needId, reason, details).catch(() => {});
  },
};
