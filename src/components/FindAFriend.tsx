import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, MapPin, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { useParticipants } from '@/integrations/supabase/hooks';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

interface FindAFriendProps {
    spaceId: string;
    currentUserId: string;
    onBack: () => void;
}

// Helper to calculate distance between two locations
function calculateDistance(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function FindAFriend({ spaceId, currentUserId, onBack }: FindAFriendProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser } = useAppStore();
    const { data: participants = [] } = useParticipants(spaceId);

    // Filter out current user and ghosts, then sort by distance
    const filteredParticipants = useMemo(() => {
        if (!currentUser) return [];

        return participants
            .filter((p) => {
                // Exclude self
                if (p.id === currentUserId) return false;
                // Exclude ghosts
                if (p.isGhost) return false;
                // Filter by search query
                if (searchQuery) {
                    return p.displayName.toLowerCase().includes(searchQuery.toLowerCase());
                }
                return true;
            })
            .map((p) => ({
                ...p,
                isHost: (p as any).isHost || false,
                distance: calculateDistance(currentUser.location, p.location),
            }))
            .sort((a, b) => a.distance - b.distance);
    }, [participants, currentUserId, currentUser, searchQuery]);

    const formatDistance = (meters: number): string => {
        if (meters < 1) return 'Right here!';
        if (meters < 10) return `${Math.round(meters)}m away`;
        if (meters < 100) return `${Math.round(meters)}m away`;
        if (meters < 1000) return `${Math.round(meters)}m away`;
        return `${(meters / 1000).toFixed(1)}km away`;
    };

    const handleAddFriend = (user: User) => {
        // This would send a friend request in a real implementation
        toast.success(`Friend request sent to ${user.displayName}!`);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">🔍 Find a Friend</h2>
                    <p className="text-sm text-muted-foreground">See who's nearby</p>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="h-12 pl-12 rounded-xl"
                    />
                </div>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredParticipants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl mb-4">
                            🔍
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">
                            {searchQuery ? 'No one found' : 'No visible users'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery
                                ? 'Try a different search'
                                : 'Everyone might be in Ghost Mode'}
                        </p>
                    </div>
                ) : (
                    filteredParticipants.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex items-center gap-4 p-4 bg-secondary rounded-2xl"
                        >
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${user.isHost ? 'bg-broadcast/20' : 'bg-emerald-100 dark:bg-emerald-900/30'
                                }`}>
                                {user.isHost ? '👑' : user.avatar || '😊'}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground">{user.displayName}</h3>
                                    {user.isHost && (
                                        <span className="px-2 py-0.5 bg-broadcast/20 text-broadcast rounded-full text-xs font-medium">
                                            Host
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span>{formatDistance(user.distance)}</span>
                                </div>
                            </div>

                            {/* Action */}
                            <Button
                                onClick={() => handleAddFriend(user)}
                                size="sm"
                                variant="secondary"
                                className="rounded-xl"
                            >
                                <UserPlus className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    ))
                )}
            </div>
        </>
    );
}
