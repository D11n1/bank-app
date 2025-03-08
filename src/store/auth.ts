import { create } from "zustand";

type User = {
  id: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    is_admin: boolean | null;
    created_at: string;
    updated_at: string;
  };
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
