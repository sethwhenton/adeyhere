import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePounces, useMarkPounceSeen } from '@/integrations/supabase/interactions';

const POUNCE_EMOJIS: Record<string, string> = {
    wave: '👋',
    wink: '😉',
    nod: '🙂',
    'high-five': '🙌',
    custom: '💬',
};

interface PounceNotificationsProps {
    userId: string | undefined;
}

export function PounceNotifications({ userId }: PounceNotificationsProps) {
    const { data: pounces = [] } = usePounces(userId);
    const markSeen = useMarkPounceSeen();

    const latestPounce = pounces[0];

    const handleDismiss = async () => {
        if (latestPounce) {
            await markSeen.mutateAsync(latestPounce.id);
        }
    };

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (latestPounce) {
            const timer = setTimeout(handleDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [latestPounce?.id]);

    // Haptic feedback when receiving pounce
    useEffect(() => {
        if (latestPounce && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
    }, [latestPounce?.id]);

    return (
        <AnimatePresence>
            {latestPounce && (
                <motion.div
                    key={latestPounce.id}
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="fixed top-20 left-4 right-4 z-50"
                >
                    <div className="bg-card rounded-2xl p-4 shadow-glow border-2 border-space">
                        <div className="flex items-center gap-3">
                            {/* Sender Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-space/20 flex items-center justify-center text-2xl animate-bounce">
                                {POUNCE_EMOJIS[latestPounce.pounce_type] || '👋'}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">
                                    {latestPounce.from_user?.is_ghost
                                        ? 'Someone'
                                        : latestPounce.from_user?.display_name
                                    } sent you a {latestPounce.pounce_type}!
                                </p>
                                {latestPounce.message && (
                                    <p className="text-sm text-muted-foreground">"{latestPounce.message}"</p>
                                )}
                            </div>

                            {/* Dismiss */}
                            <button
                                onClick={handleDismiss}
                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
