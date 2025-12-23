import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Megaphone,
    MegaphoneOff,
    BarChart3,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToggleBroadcastOnly, useSpaceReports } from '@/integrations/supabase/moderation';
import { toast } from 'sonner';

interface HostControlsPanelProps {
    spaceId: string;
    spaceName: string;
    broadcastOnly: boolean;
    onOpenAnalytics: () => void;
}

export function HostControlsPanel({
    spaceId,
    spaceName,
    broadcastOnly,
    onOpenAnalytics
}: HostControlsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleBroadcast = useToggleBroadcastOnly();
    const { data: reports = [] } = useSpaceReports(spaceId);

    const handleToggleBroadcast = async () => {
        try {
            await toggleBroadcast.mutateAsync({ spaceId, broadcastOnly: !broadcastOnly });
            toast.success(broadcastOnly
                ? 'Chat is now open to everyone'
                : 'Only you can send messages now'
            );
        } catch (error) {
            toast.error('Failed to update chat mode');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-28 left-4 z-30"
        >
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                {/* Header - Always visible */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 px-4 py-3 w-full hover:bg-secondary/50 transition-colors"
                >
                    <Shield className="w-5 h-5 text-broadcast" />
                    <span className="text-sm font-semibold text-foreground">Host Controls</span>
                    {reports.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                            {reports.length}
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-auto" />
                    ) : (
                        <ChevronDown className="w-4 h-4 ml-auto" />
                    )}
                </button>

                {/* Expanded Controls */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border"
                        >
                            <div className="p-3 space-y-2">
                                {/* Broadcast Only Toggle */}
                                <button
                                    onClick={handleToggleBroadcast}
                                    disabled={toggleBroadcast.isPending}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${broadcastOnly
                                            ? 'bg-broadcast/20 text-broadcast'
                                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                                        }`}
                                >
                                    {toggleBroadcast.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : broadcastOnly ? (
                                        <Megaphone className="w-4 h-4" />
                                    ) : (
                                        <MegaphoneOff className="w-4 h-4" />
                                    )}
                                    <div className="text-left">
                                        <p className="text-sm font-medium">
                                            {broadcastOnly ? 'Broadcast Mode ON' : 'Broadcast Mode OFF'}
                                        </p>
                                        <p className="text-xs opacity-70">
                                            {broadcastOnly ? 'Only you can chat' : 'Everyone can chat'}
                                        </p>
                                    </div>
                                </button>

                                {/* Analytics Button */}
                                <button
                                    onClick={onOpenAnalytics}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-all"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium">Space Analytics</p>
                                        <p className="text-xs opacity-70">View visitor stats</p>
                                    </div>
                                </button>

                                {/* Reports Indicator */}
                                {reports.length > 0 && (
                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive">
                                        <AlertTriangle className="w-4 h-4" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium">{reports.length} Report{reports.length !== 1 ? 's' : ''}</p>
                                            <p className="text-xs opacity-70">Pending review</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
