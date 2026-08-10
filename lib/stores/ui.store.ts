import { create } from 'zustand';

interface UiState {
  isSideNavOpen: boolean;
  toggleSideNav: () => void;
  setSideNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSideNavOpen: false,
  toggleSideNav: () => set((state) => ({ isSideNavOpen: !state.isSideNavOpen })),
  setSideNavOpen: (open) => set({ isSideNavOpen: open }),
}));
