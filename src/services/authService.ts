import { api, setAuthToken, clearAuthToken } from "./apiClient";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  industry?: string;
  bio?: string;
  company?: string;
  role?: string;
  country?: string;
  state?: string;
  city?: string;
  kyc_status?: string;
  rating?: number;
  review_count?: number;
  active_needs_count?: number;
  completed_deals_count?: number;
}

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    location?: string;
    industry?: string;
  }) {
    const res = await api.post<{ message: string; user: UserProfile; token: string }>(
      "/auth/register",
      data
    );
    if (res.token) {
      setAuthToken(res.token);
      localStorage.setItem("kiloneed_user_name", res.user.name);
      localStorage.setItem("kiloneed_user_email", res.user.email);
      if (res.user.country) localStorage.setItem("kiloneed_country", res.user.country);
      if (res.user.state) localStorage.setItem("kiloneed_state", res.user.state);
      if (res.user.city) localStorage.setItem("kiloneed_city", res.user.city);
      if (res.user.location) localStorage.setItem("kiloneed_location", res.user.location);
      if (res.user.avatar) localStorage.setItem("kiloneed_avatar", res.user.avatar);
    }
    return res;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await api.post<{ message: string; user: UserProfile; token: string }>(
      "/auth/login",
      credentials
    );
    if (res.token) {
      setAuthToken(res.token);
      localStorage.setItem("kiloneed_user_name", res.user.name);
      localStorage.setItem("kiloneed_user_email", res.user.email);
      if (res.user.country) localStorage.setItem("kiloneed_country", res.user.country);
      if (res.user.state) localStorage.setItem("kiloneed_state", res.user.state);
      if (res.user.city) localStorage.setItem("kiloneed_city", res.user.city);
      if (res.user.location) localStorage.setItem("kiloneed_location", res.user.location);
      if (res.user.avatar) localStorage.setItem("kiloneed_avatar", res.user.avatar);
    }
    return res;
  },

  async getMe() {
    return api.get<{ user: UserProfile }>("/auth/me");
  },

  async updateProfile(profileData: Partial<UserProfile>) {
    return api.put<{ message: string; user: UserProfile }>("/auth/profile", profileData);
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuthToken();
    }
  },
};

