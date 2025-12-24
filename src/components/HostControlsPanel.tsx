import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Megaphone,
    BarChart3,
    ChevronUp,
    ChevronDown,
    AlertTriangle,
    XCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpaceReports } from '@/integrations/supabase/moderation';
import { toast } from 'sonner';

interface HostControlsPanelProps {
    spaceId: string;
    spaceName: string;
    onOpenAnalytics: () => void;
    onCreateAnnouncement: () => void;
    onCloseSpace: () => void;
}

export function HostControlsPanel({
    spaceId,
    spaceName,
    onOpenAnalytics,
    onCreateAnnouncement,
    onCloseSpace
}: HostControlsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { data: reports = [] } = useSpaceReports(spaceId);

    const handleCloseSpace = async () => {
        if (!window.confirm('Are you sure you want to close this Space? All data will be deleted.')) {
            return;
        }
        setIsClosing(true);
        try {
            onCloseSpace();
        } catch (error) {
            toast.error('Failed to close Space');
            setIsClosing(false);
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
                    <span className="text-sm font-semibold text-foreground">Host Dashboard</span>
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
                                {/* Create Announcement */}
                                <button
                                    onClick={onCreateAnnouncement}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 hover:from-sky-500/30 hover:to-blue-500/30 transition-all"
                                >
                                    <Megaphone className="w-4 h-4" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium">Create Announcement</p>
                                        <p className="text-xs opacity-70">Broadcast to all attendees</p>
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

                                {/* Close Space */}
                                <button
                                    onClick={handleCloseSpace}
                                    disabled={isClosing}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
                                >
                                    {isClosing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                    <div className="text-left">
                                        <p className="text-sm font-medium">Close Space</p>
                                        <p className="text-xs opacity-70">End event & delete data</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

