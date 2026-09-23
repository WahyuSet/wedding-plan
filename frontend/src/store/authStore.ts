import { create } from "zustand";
import { User, WeddingProfile } from "../types/index.js";
import { api } from "../lib/api.js";

interface AuthState {
  user: User | null;
  profile: WeddingProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User, profile: WeddingProfile) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfileState: (updatedProfile: Partial<WeddingProfile>) => void;
  updateUserState: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  token: localStorage.getItem("wedding_token"),
  isLoading: true,
  isAuthenticated: !!localStorage.getItem("wedding_token"),

  login: (token: string, user: User, profile: WeddingProfile) => {
    localStorage.setItem("wedding_token", token);
    set({
      token,
      user,
      profile,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      localStorage.removeItem("wedding_token");
      set({
        token: null,
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("wedding_token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        set({
          user: {
            id: res.data.data.id,
            email: res.data.data.email,
            username: res.data.data.username ?? null,
            role: res.data.data.role ?? "USER",
          },
          profile: res.data.data.weddingProfile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("wedding_token");
        set({ token: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      localStorage.removeItem("wedding_token");
      set({ token: null, user: null, profile: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfileState: (updatedProfile: Partial<WeddingProfile>) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updatedProfile } : null,
    }));
  },

  updateUserState: (updatedUser: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    }));
  },
}));
