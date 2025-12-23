import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/lib/geo';

interface GeofenceAlertProps {
    spaceId: string;
    spaceName: string;
    spaceCenter: { lat: number; lng: number };
    participantCount?: number;
    expiresAt?: Date;
    userLocation: { lat: number; lng: number };
    onJoin: () => void;
    onDismiss: () => void;
}

export function GeofenceAlert({
    spaceId,
    spaceName,
    spaceCenter,
    participantCount = 0,
    expiresAt,
    userLocation,
    onJoin,
    onDismiss,
}: GeofenceAlertProps) {
    const distance = Math.round(calculateDistance(userLocation, spaceCenter));
    const hoursLeft = expiresAt
        ? Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))
        : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed bottom-24 left-4 right-4 z-50"
            >
                <div className="bg-card rounded-3xl p-5 shadow-glow border-2 border-space">
                    {/* Pulsing indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-space rounded-full animate-ping opacity-75" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-space rounded-full" />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-space flex items-center justify-center animate-pulse">
                                <MapPin className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-space-deep font-semibold">You've arrived!</p>
                                <h3 className="text-lg font-bold text-foreground">{spaceName}</h3>
                            </div>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        {participantCount > 0 && (
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {participantCount} {participantCount === 1 ? 'person' : 'people'}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {distance}m away
                        </span>
                        {expiresAt && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {hoursLeft}h left
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <Button
                        onClick={onJoin}
                        className="w-full h-12 rounded-xl gradient-space text-primary-foreground font-semibold shadow-soft"
                    >
                        Join the Space
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
