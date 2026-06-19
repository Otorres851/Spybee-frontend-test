"use client";

import { create } from "zustand";
import {
  clearSession,
  getBrowserSession,
  loginWithMockCredentials,
  type AuthUser,
  type LoginCredentials,
} from "@/services/authService";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  loading: boolean;
  hydrate: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  loading: false,
  hydrate: () => {
    const user = getBrowserSession();
    set({ user, status: user ? "authenticated" : "unauthenticated" });
  },
  login: async (credentials) => {
    set({ loading: true });
    try {
      const user = await loginWithMockCredentials(credentials);
      set({ user, status: "authenticated", loading: false });
    } catch (error) {
      set({ loading: false, status: "unauthenticated" });
      throw error;
    }
  },
  logout: () => {
    clearSession();
    set({ user: null, status: "unauthenticated" });
  },
}));
