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
  imageUrl?: string;
}

export type ViewMode = 'map' | 'radar' | 'chat' | 'friends' | 'profile';

// ==================== ANNOUNCEMENTS ====================
export interface Announcement {
  id: string;
  spaceId: string;
  hostId: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  createdAt: Date;
  readBy: string[]; // User IDs who have read
}

// ==================== Q&A ====================
export interface QAItem {
  id: string;
  spaceId: string;
  question: string;
  answer?: string;
  createdAt: Date;
}

// ==================== LOST & FOUND ====================
export interface LostFoundPost {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  resolved: boolean;
}

// ==================== FRIENDS (Persistent) ====================
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendAvatar?: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export interface FriendMessage {
  id: string;
  friendshipId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

// ==================== MESSAGE REQUESTS ====================
export interface MessageRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  postId?: string; // For Lost & Found DMs
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
