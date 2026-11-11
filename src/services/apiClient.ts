import { Need, NeedChatMessage, Comment, NeedMedia } from "@/types/need";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const TOKEN_KEY = "kiloneed_auth_token";
export const AUTH_EXPIRED_EVENT = "kiloneed-auth-expired";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // A rejected token means the session expired or was revoked - sign the user out.
    if (response.status === 401 && token && !endpoint.startsWith("/auth/login")) {
      clearAuthToken();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const firstFieldError = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined;
    const errorMsg =
      firstFieldError || data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>) => {
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        finalUrl += (url.includes("?") ? "&" : "?") + qs;
      }
    }
    return request<T>(finalUrl, { method: "GET" });
  },

  post: <T = any>(url: string, body?: any) =>
    request<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    }),

  put: <T = any>(url: string, body?: any) =>
    request<T>(url, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    }),

  delete: <T = any>(url: string) => request<T>(url, { method: "DELETE" }),

  upload: <T = any>(file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<T>("/upload", {
      method: "POST",
      body: formData,
    });
  },
};

// Needs API Service
export const needsApiService = {
  async getFeed(params?: {
    search?: string;
    category?: string;
    privacy?: string;
    sort?: "oldest" | "newest" | "distance";
    page?: number;
    pageSize?: number;
    geofence?: boolean;
    lat?: number;
    lon?: number;
  }) {
    return api.get<{
      needs: Need[];
      totalCount: number;
      hasMore: boolean;
      currentPage: number;
    }>("/needs", params);
  },

  async getNeed(id: string | number) {
    return api.get<Need>(`/needs/${id}`);
  },

  async createNeed(needData: {
    title?: string;
    text: string;
    categories?: string[];
    privacy?: "public" | "connections" | "groups" | "only_me";
    expires_in_hours?: number;
    media?: NeedMedia[];
    location?: string;
    country?: string;
    state?: string;
    city?: string;
    radius?: string;
  }) {
    return api.post<{ message: string; need: Need }>("/needs", needData);
  },

  async deleteNeed(id: string | number) {
    return api.delete(`/needs/${id}`);
  },

  async incrementClick(id: string | number) {
    return api.post<{ clicks: number }>(`/needs/${id}/click`);
  },

  async shareNeed(id: string | number) {
    return api.post<{ shares: number }>(`/needs/${id}/share`);
  },

  async toggleBookmark(id: string | number) {
    return api.post<{ bookmarked: boolean; saves: number }>(`/needs/${id}/bookmark`);
  },

  async repostNeed(id: string | number) {
    return api.post<{ reposted: boolean; reposts: number }>(`/needs/${id}/repost`);
  },

  async recommendNeed(id: string | number) {
    return api.post<{ recommended: boolean; recos: number }>(`/needs/${id}/recommend`);
  },

  async mentionPeers(id: string | number, peers: string[], snippet?: string) {
    return api.post<{ message: string; mentions: number }>(`/needs/${id}/mention-peers`, {
      peers,
      snippet,
    });
  },

  async getComments(needId: string | number) {
    return api.get<Comment[]>(`/needs/${needId}/comments`);
  },

  async addComment(needId: string | number, text: string) {
    return api.post<{ message: string; comment: Comment }>(`/needs/${needId}/comments`, {
      text,
    });
  },

  async getChats(needId: string | number) {
    return api.get<NeedChatMessage[]>(`/needs/${needId}/chats`);
  },

  async sendChat(needId: string | number, text: string, recipientId?: string | number) {
    return api.post<{ message: string; chat: NeedChatMessage }>(`/needs/${needId}/chats`, {
      text,
      recipient_id: recipientId,
    });
  },

  async getBookmarks() {
    return api.get<any[]>("/bookmarks");
  },

  async reportNeed(targetId: string | number, reason: string, details?: string) {
    return api.post("/reports", {
      target_type: "need",
      target_id: targetId,
      reason,
      details,
    });
  },
};

// Marketplace Products API Service
export const productsApiService = {
  async getProducts(params?: {
    search?: string;
    category?: string;
    country?: string;
    state?: string;
    city?: string;
    condition?: string;
    listingType?: string;
  }) {
    return api.get<any[]>("/products", params);
  },

  async createProduct(productData: {
    title: string;
    price: number;
    description: string;
    seller_type?: string;
    country?: string;
    state?: string;
    city?: string;
    category?: string;
    subcategory?: string;
    image?: string;
    featured?: boolean;
    condition?: string;
    availability?: string;
    listing_type?: string;
    negotiable?: boolean;
  }) {
    return api.post<{ message: string; product: any }>("/products", productData);
  },

  async updateProduct(id: string | number, patch: Record<string, any>) {
    return api.put<{ message: string; product: any }>(`/products/${id}`, patch);
  },

  async deleteProduct(id: string | number) {
    return api.delete(`/products/${id}`);
  },
};

// Network Connections API Service
export const connectionsApiService = {
  async getConnections() {
    return api.get<any[]>("/connections");
  },

  async getSuggestions() {
    return api.get<any[]>("/connections/suggestions");
  },

  async getPending() {
    return api.get<any[]>("/connections/pending");
  },

  async sendRequest(connectedUserId: number | string) {
    return api.post("/connections/request", { connected_user_id: connectedUserId });
  },

  async acceptRequest(connectionId: number | string) {
    return api.post(`/connections/${connectionId}/accept`);
  },

  async declineRequest(connectionId: number | string) {
    return api.post(`/connections/${connectionId}/decline`);
  },

  async removeConnection(targetUserId: number | string) {
    return api.delete(`/connections/${targetUserId}`);
  },
};

// Trade Groups API Service
export const groupsApiService = {
  async getGroups() {
    return api.get<any[]>("/groups");
  },

  async getMyGroups() {
    return api.get<any[]>("/groups/my");
  },

  async createGroup(data: {
    name: string;
    description?: string;
    category?: string;
    is_private?: boolean;
    group_type?: "open" | "closed" | "special";
    cover_image?: string;
    icon?: string;
    monthly_dues?: number;
  }) {
    return api.post<{ message: string; group: any }>("/groups", data);
  },

  async updateGroup(
    groupId: number | string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      cover_image?: string;
      icon?: string;
      group_type?: "open" | "closed" | "special";
      monthly_dues?: number;
    }
  ) {
    return api.put<{ message: string; group: any }>(`/groups/${groupId}`, data);
  },

  async deleteGroup(groupId: number | string) {
    return api.delete<{ message: string }>(`/groups/${groupId}`);
  },

  async joinGroup(groupId: number | string) {
    return api.post(`/groups/${groupId}/join`);
  },

  async leaveGroup(groupId: number | string) {
    return api.post(`/groups/${groupId}/leave`);
  },
};

// Direct Messages API Service
export const messagesApiService = {
  async getConversations() {
    return api.get<any[]>("/conversations");
  },

  async startConversation(recipientId: number | string) {
    return api.post<{ conversationId: number }>("/conversations/start", {
      recipient_id: recipientId,
    });
  },

  async getConversation(conversationId: number | string) {
    return api.get<any>(`/conversations/${conversationId}`);
  },

  async sendMessage(conversationId: number | string, text?: string, mediaUrl?: string, mediaType?: string) {
    return api.post(`/conversations/${conversationId}/messages`, {
      text: text ?? "",
      media_url: mediaUrl,
      media_type: mediaType,
    });
  },
};

// Notifications API Service
export const notificationsApiService = {
  async getNotifications() {
    return api.get<any[]>("/notifications");
  },

  async markAsRead(id: number | string) {
    return api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return api.post("/notifications/read-all");
  },
};

// Sponsored Ads API Service
export const adsApiService = {
  async getAds() {
    return api.get<any[]>("/ads");
  },

  async getMyAds() {
    return api.get<any[]>("/ads/my");
  },

  async createAd(data: {
    title: string;
    description: string;
    budget: number;
    ad_type?: string;
    placement?: string;
    media_url?: string;
    target_url?: string;
  }) {
    return api.post<{ message: string; ad: any }>("/ads", data);
  },

  async updateAdStatus(id: number | string, status: "active" | "paused" | "ended") {
    return api.put<{ message: string; ad: any; status: string }>(`/ads/${id}/status`, { status });
  },

  async deleteAd(id: number | string) {
    return api.delete(`/ads/${id}`);
  },

  async trackClick(id: number | string) {
    return api.post(`/ads/${id}/click`);
  },

  async trackImpression(id: number | string) {
    return api.post(`/ads/${id}/impression`);
  },
};

// Wallet, Subscriptions & Transactions API Service
export const walletApiService = {
  async getTransactions() {
    return api.get<{
      wallet_balance: number;
      currency: string;
      transactions: any[];
    }>("/transactions");
  },

  async deposit(amount: number, description?: string) {
    return api.post<{ message: string; transaction: any }>("/transactions/deposit", {
      amount,
      description,
    });
  },

  async withdraw(amount: number, description?: string) {
    return api.post<{ message: string; transaction: any }>("/transactions/withdraw", {
      amount,
      description,
    });
  },

  async subscribe(data: {
    plan_id: string;
    plan_name: string;
    amount: number;
    billing_cycle?: string;
  }) {
    return api.post<{
      message: string;
      authorization_url?: string;
      access_code?: string;
      transaction?: any;
    }>("/subscriptions/subscribe", data);
  },

  async initializePaystack(data: {
    amount: number;
    type?: "deposit" | "payment";
    description?: string;
    plan_name?: string;
  }) {
    return api.post<{
      message: string;
      authorization_url: string;
      access_code: string;
      reference: string;
      transaction: any;
    }>("/paystack/initialize", data);
  },

  async verifyPaystack(reference: string) {
    return api.get<{
      message: string;
      reference: string;
      paystack_status: string;
      gateway_response: string;
      transaction: any;
    }>(`/paystack/verify/${reference}`);
  },
};

