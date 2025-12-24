import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Space, ViewMode, Location } from '@/types';

interface AppState {
  // User state
  currentUser: User | null;
  isOnboarded: boolean;

  // Space state
  activeSpace: Space | null;

  // View state
  viewMode: ViewMode;

  // Actions
  setCurrentUser: (user: User) => void;
  setOnboarded: (value: boolean) => void;
  toggleGhostMode: () => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveSpace: (space: Space | null) => void;
  updateUserLocation: (location: Location) => void;
  updateProfile: (updates: { displayName?: string; avatar?: string }) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isOnboarded: false,
      activeSpace: null,
      viewMode: 'map',

      setCurrentUser: (user) => set({ currentUser: user }),

      setOnboarded: (value) => set({ isOnboarded: value }),

      toggleGhostMode: () =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, isGhost: !state.currentUser.isGhost }
            : null,
        })),

      setViewMode: (mode) => set({ viewMode: mode }),

      setActiveSpace: (space) => set({ activeSpace: space, viewMode: space ? 'radar' : 'map' }),

      updateUserLocation: (location) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, location }
            : null,
        })),

      updateProfile: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? {
              ...state.currentUser,
              displayName: updates.displayName ?? state.currentUser.displayName,
              avatar: updates.avatar ?? state.currentUser.avatar
            }
            : null,
        })),

      logout: () => set({ currentUser: null, isOnboarded: false, activeSpace: null, viewMode: 'map' }),
    }),
    {
      name: 'adeyhere-storage', // localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        isOnboarded: state.isOnboarded,
        // Don't persist activeSpace or viewMode - these should reset on app reload
      }),
    }
  )
);
