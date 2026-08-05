import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Mirrors what the backend returns. There is no `role` or `department` in this
 * system — `isAdmin` marks a Finance Lead and is the only privilege bit.
 */
export interface User {
  id: number;
  email: string;
  fullname: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  googleSub: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  mustChangePassword: boolean;

  setSession: (payload: {
    user: User;
    tokens: AuthTokens;
    mustChangePassword?: boolean;
  }) => void;
  setUser: (user: User) => void;
  setMustChangePassword: (value: boolean) => void;
  clearSession: () => void;
}

const emptySession = {
  user: null,
  accessToken: null,
  refreshToken: null,
  mustChangePassword: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...emptySession,

      setSession: ({ user, tokens, mustChangePassword }) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          mustChangePassword: mustChangePassword ?? user.mustChangePassword,
        }),

      setUser: (user) => set({ user, mustChangePassword: user.mustChangePassword }),

      setMustChangePassword: (value) => set({ mustChangePassword: value }),

      clearSession: () => set(emptySession),
    }),
    {
      name: 'sentinel-auth',
      storage: createJSONStorage(() => localStorage),

      // localStorage does not exist while the server renders, so letting the
      // store hydrate itself would make the first client render disagree with
      // the server's. Instead AuthGate calls rehydrate() once and holds the UI
      // on a loading screen until it resolves.
      skipHydration: true,

      // Actions are recreated on every load; only the session is worth keeping.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        mustChangePassword: state.mustChangePassword,
      }),
    }
  )
);

/** Reads the token outside React, for the API layer. */
export const getAccessToken = () => useAuthStore.getState().accessToken;
