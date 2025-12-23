export interface User {
  id: string;
  displayName: string;
  avatar?: string;
  isGhost: boolean;
  location: Location;
  isHost?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Space {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  center: Location;
  radius: number; // in meters, max 300
  createdAt: Date;
  expiresAt: Date;
  participants: User[];
  broadcastOnly?: boolean;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  isBroadcast?: boolean;
}

export type ViewMode = 'map' | 'radar' | 'chat';
