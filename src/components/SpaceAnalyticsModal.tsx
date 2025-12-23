import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import { useSpaceAnalytics } from '@/integrations/supabase/moderation';

interface SpaceAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    spaceId: string;
    spaceName: string;
}

export function SpaceAnalyticsModal({ isOpen, onClose, spaceId, spaceName }: SpaceAnalyticsModalProps) {
    const { data: analytics, isLoading } = useSpaceAnalytics(spaceId);

    const formatHour = (hour: number) => {
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4"
                    >
                        <div className="bg-card rounded-3xl p-5 shadow-card max-w-lg mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Space Analytics</h3>
                                    <p className="text-sm text-muted-foreground">{spaceName}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-space border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-muted-foreground mt-2">Loading analytics...</p>
                                </div>
                            ) : analytics ? (
                                <div className="space-y-4">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Total Visitors */}
                                        <div className="bg-secondary/50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-4 h-4 text-space" />
                                                <span className="text-xs text-muted-foreground">Total Visitors</span>
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{analytics.totalVisitors}</p>
                                        </div>

                                        {/* Current Live */}
                                        <div className="bg-secondary/50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                                <span className="text-xs text-muted-foreground">Live Now</span>
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{analytics.currentParticipants}</p>
                                        </div>

                                        {/* Total Messages */}
                                        <div className="bg-secondary/50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle className="w-4 h-4 text-space" />
                                                <span className="text-xs text-muted-foreground">Messages</span>
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{analytics.totalMessages}</p>
                                        </div>

                                        {/* Peak Hour */}
                                        <div className="bg-secondary/50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-broadcast" />
                                                <span className="text-xs text-muted-foreground">Peak Time</span>
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {analytics.peakVisitors > 0 ? formatHour(analytics.peakHour) : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Activity Timeline (simplified) */}
                                    <div className="bg-secondary/30 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">Activity</span>
                                        </div>
                                        <div className="flex items-end justify-between h-12 gap-1">
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const hourVisits = analytics.visits.filter(v =>
                                                    new Date(v.visited_at).getHours() === i * 2
                                                ).length;
                                                const maxVisits = Math.max(...Array.from({ length: 12 }, (_, j) =>
                                                    analytics.visits.filter(v => new Date(v.visited_at).getHours() === j * 2).length
                                                ), 1);
                                                const height = (hourVisits / maxVisits) * 100;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-space/50 rounded-t transition-all"
                                                        style={{ height: `${Math.max(height, 10)}%` }}
                                                        title={`${formatHour(i * 2)}: ${hourVisits} visits`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>12AM</span>
                                            <span>12PM</span>
                                            <span>12AM</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No analytics available yet
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
