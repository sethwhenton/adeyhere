import { create } from 'zustand';
import { User, Space, Message, ViewMode, Location } from '@/types';
import { generateRandomPosition } from '@/lib/geo';

interface AppState {
  // User state
  currentUser: User | null;
  isOnboarded: boolean;
  
  // Space state
  spaces: Space[];
  activeSpace: Space | null;
  
  // View state
  viewMode: ViewMode;
  
  // Chat state
  messages: Message[];
  broadcasts: Message[];
  
  // Actions
  setCurrentUser: (user: User) => void;
  setOnboarded: (value: boolean) => void;
  toggleGhostMode: () => void;
  setViewMode: (mode: ViewMode) => void;
  createSpace: (name: string, center: Location, radius: number, duration: number) => void;
  joinSpace: (spaceId: string) => void;
  leaveSpace: () => void;
  sendMessage: (content: string) => void;
  sendBroadcast: (content: string) => void;
  updateUserLocation: (location: Location) => void;
}

// Mock users for demo
const generateMockUsers = (center: Location, count: number): User[] => {
  const names = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];
  const avatars = ['🎸', '🎨', '📸', '🎭', '🎵', '☕', '🌟', '🦋'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    displayName: names[i % names.length],
    avatar: avatars[i % avatars.length],
    isGhost: Math.random() > 0.5,
    location: generateRandomPosition(center, 250),
  }));
};

// Mock spaces for demo - spread out for better visibility
const createMockSpaces = (): Space[] => {
  return [
    {
      id: 'space-1',
      name: 'Sunday Jazz in the Park',
      hostId: 'host-1',
      hostName: 'Jamie',
      center: { lat: 37.7749, lng: -122.4194 }, // User's location (center)
      radius: 250,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      participants: generateMockUsers({ lat: 37.7749, lng: -122.4194 }, 8),
    },
    {
      id: 'space-2',
      name: 'Tech Meetup @ Coffee House',
      hostId: 'host-2',
      hostName: 'Chris',
      center: { lat: 37.7780, lng: -122.4150 }, // ~400m NE
      radius: 150,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      participants: generateMockUsers({ lat: 37.7780, lng: -122.4150 }, 5),
    },
    {
      id: 'space-3',
      name: 'Yoga at Sunset',
      hostId: 'host-3',
      hostName: 'Maya',
      center: { lat: 37.7720, lng: -122.4240 }, // ~500m SW
      radius: 200,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
      participants: generateMockUsers({ lat: 37.7720, lng: -122.4240 }, 12),
    },
    {
      id: 'space-4',
      name: 'Food Truck Friday',
      hostId: 'host-4',
      hostName: 'Leo',
      center: { lat: 37.7770, lng: -122.4230 }, // ~350m NW
      radius: 180,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      participants: generateMockUsers({ lat: 37.7770, lng: -122.4230 }, 6),
    },
  ];
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isOnboarded: false,
  spaces: createMockSpaces(),
  activeSpace: null,
  viewMode: 'map',
  messages: [],
  broadcasts: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  
  setOnboarded: (value) => set({ isOnboarded: value }),
  
  toggleGhostMode: () =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, isGhost: !state.currentUser.isGhost }
        : null,
    })),

  setViewMode: (mode) => set({ viewMode: mode }),

  createSpace: (name, center, radius, duration) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const newSpace: Space = {
      id: `space-${Date.now()}`,
      name,
      hostId: currentUser.id,
      hostName: currentUser.displayName,
      center,
      radius: Math.min(radius, 300),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
      participants: [{ ...currentUser, isHost: true }],
    };

    set((state) => ({
      spaces: [...state.spaces, newSpace],
      activeSpace: newSpace,
      viewMode: 'radar',
    }));
  },

  joinSpace: (spaceId) => {
    const { spaces, currentUser } = get();
    const space = spaces.find((s) => s.id === spaceId);
    
    if (space && currentUser) {
      const updatedSpace = {
        ...space,
        participants: [...space.participants, currentUser],
      };
      
      set((state) => ({
        spaces: state.spaces.map((s) => (s.id === spaceId ? updatedSpace : s)),
        activeSpace: updatedSpace,
        viewMode: 'radar',
        messages: [
          {
            id: `welcome-${Date.now()}`,
            userId: 'system',
            userName: 'Adey Here',
            content: `Welcome to "${space.name}"! Say hi to everyone 👋`,
            timestamp: new Date(),
          },
        ],
      }));
    }
  },

  leaveSpace: () =>
    set({
      activeSpace: null,
      viewMode: 'map',
      messages: [],
      broadcasts: [],
    }),

  sendMessage: (content) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.isGhost ? 'Anonymous' : currentUser.displayName,
      userAvatar: currentUser.isGhost ? '👻' : currentUser.avatar,
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  sendBroadcast: (content) => {
    const { currentUser, activeSpace } = get();
    if (!currentUser || !activeSpace || activeSpace.hostId !== currentUser.id) return;

    const broadcast: Message = {
      id: `broadcast-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.displayName,
      userAvatar: '📢',
      content,
      timestamp: new Date(),
      isBroadcast: true,
    };

    set((state) => ({
      broadcasts: [...state.broadcasts, broadcast],
    }));
  },

  updateUserLocation: (location) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, location }
        : null,
    })),
}));
