import { create } from "zustand";
import { type User, type WeddingProfile } from "../types/index.js";
import { api } from "../lib/api.js";

interface AuthState {
  user: User | null;
  profile: WeddingProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, profile: WeddingProfile) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfileState: (updatedProfile: Partial<WeddingProfile>) => void;
  updateUserState: (updatedUser: Partial<User>) => void;
}

// Sesi kini hanya lewat cookie httpOnly; bersihkan sisa token lama di localStorage.
try {
  localStorage.removeItem("wedding_token");
} catch {
  // storage tidak tersedia
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  login: (user: User, profile: WeddingProfile) => {
    set({
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
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
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
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
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
