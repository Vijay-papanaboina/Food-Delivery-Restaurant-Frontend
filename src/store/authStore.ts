import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      login: (user: User, accessToken: string) => {
        localStorage.setItem("access_token", accessToken);
        set({ isAuthenticated: true, user, accessToken });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        set({ isAuthenticated: false, user: null, accessToken: null });
      },
      setUser: (user: User) => set({ user }),
      setAccessToken: (accessToken: string) => {
        localStorage.setItem("access_token", accessToken);
        set({ accessToken });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
