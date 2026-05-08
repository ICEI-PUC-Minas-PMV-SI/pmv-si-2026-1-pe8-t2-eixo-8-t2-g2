import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthPermission } from '~/@types/auth';
import type { User } from '~/@types/user';

type AuthStore = {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isLogged: () => boolean;
  getUserShortname: () => string;
  hasPermission: (permission: AuthPermission) => boolean;
  isAdmin: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setUser: (user: User) => set({ user }),

      setToken: (token: string) => set({ token }),

      logout: () => set({ user: null }),

      isLogged: () => !!get().user?.email,

      getUserShortname() {
        const name = get().user?.name || '';
        const limit = 25;
        if (name.length <= limit) {
          return name;
        }
        const [firstName] = name.split(' ');
        if (firstName.length <= limit) {
          return firstName;
        }
        return firstName.substring(0, limit);
      },

      hasPermission: (permission: AuthPermission) => {
        const user = get().user;
        return user?.role === permission;
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
