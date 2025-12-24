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
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed top-24 left-4 z-[500] max-w-[280px]"
            >
                <div className="bg-card rounded-2xl p-3 shadow-card border border-space/30">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-space flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-space-deep font-semibold">You've arrived!</p>
                                <h3 className="text-sm font-bold text-foreground truncate max-w-[160px]">{spaceName}</h3>
                            </div>
                        </div>
                        <button
                            onClick={onDismiss}
                            className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Stats - Compact */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {distance}m
                        </span>
                        {expiresAt && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {hoursLeft}h left
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <Button
                        onClick={onJoin}
                        size="sm"
                        className="w-full h-8 mt-2 rounded-lg gradient-space text-primary-foreground text-xs font-semibold"
                    >
                        Join Space
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

