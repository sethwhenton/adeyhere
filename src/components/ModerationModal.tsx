import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReportUser, useBanFromSpace } from '@/integrations/supabase/moderation';
import { toast } from 'sonner';

const REPORT_REASONS = [
    'Harassment or bullying',
    'Inappropriate content',
    'Spam or scam',
    'Impersonation',
    'Other',
];

interface ModerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: string;
        displayName: string;
        avatar?: string;
    };
    spaceId: string;
    currentUserId: string;
    isHost: boolean;
}

export function ModerationModal({
    isOpen,
    onClose,
    targetUser,
    spaceId,
    currentUserId,
    isHost
}: ModerationModalProps) {
    const [mode, setMode] = useState<'menu' | 'report' | 'ban'>('menu');
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [details, setDetails] = useState('');

    const reportUser = useReportUser();
    const banUser = useBanFromSpace();

    const handleReport = async () => {
        if (!selectedReason) {
            toast.error('Please select a reason');
            return;
        }

        try {
            await reportUser.mutateAsync({
                spaceId,
                reporterId: currentUserId,
                reportedUserId: targetUser.id,
                reason: selectedReason,
                details: details || undefined,
            });
            toast.success('Report submitted. Thank you for keeping the space safe.');
            onClose();
            setMode('menu');
            setSelectedReason('');
            setDetails('');
        } catch (error) {
            toast.error('Failed to submit report');
        }
    };

    const handleBan = async () => {
        try {
            await banUser.mutateAsync({
                spaceId,
                userId: targetUser.id,
                bannedBy: currentUserId,
                reason: selectedReason || 'Removed by host',
            });
            toast.success(`${targetUser.displayName} has been removed from the space`);
            onClose();
            setMode('menu');
        } catch (error) {
            toast.error('Failed to remove user');
        }
    };

    const resetAndClose = () => {
        setMode('menu');
        setSelectedReason('');
        setDetails('');
        onClose();
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
                        onClick={resetAndClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-card rounded-3xl p-5 shadow-card max-w-sm w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                                        {targetUser.avatar || '😊'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{targetUser.displayName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {mode === 'menu' ? 'Moderation' : mode === 'report' ? 'Report User' : 'Remove User'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetAndClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Menu Mode */}
                            {mode === 'menu' && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setMode('report')}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-warning" />
                                        <div className="text-left">
                                            <p className="font-medium text-foreground">Report User</p>
                                            <p className="text-xs text-muted-foreground">Flag inappropriate behavior</p>
                                        </div>
                                    </button>

                                    {isHost && (
                                        <button
                                            onClick={() => setMode('ban')}
                                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all"
                                        >
                                            <Ban className="w-5 h-5 text-destructive" />
                                            <div className="text-left">
                                                <p className="font-medium text-destructive">Remove from Space</p>
                                                <p className="text-xs text-muted-foreground">Ban this user from your space</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Report Mode */}
                            {mode === 'report' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Why are you reporting this user?
                                    </p>

                                    <div className="space-y-2">
                                        {REPORT_REASONS.map((reason) => (
                                            <button
                                                key={reason}
                                                onClick={() => setSelectedReason(reason)}
                                                className={`w-full px-4 py-3 rounded-xl text-left transition-all ${selectedReason === reason
                                                        ? 'bg-space/20 ring-2 ring-space'
                                                        : 'bg-secondary hover:bg-secondary/80'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{reason}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Additional details (optional)"
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        className="w-full h-20 px-4 py-3 rounded-xl bg-secondary/50 border-none resize-none text-sm"
                                        maxLength={500}
                                    />

                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setMode('menu')}
                                            className="flex-1 h-11 rounded-xl"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleReport}
                                            disabled={!selectedReason || reportUser.isPending}
                                            className="flex-1 h-11 rounded-xl bg-warning text-warning-foreground"
                                        >
                                            {reportUser.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Submit Report'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Ban Mode */}
                            {mode === 'ban' && (
                                <div className="space-y-4">
                                    <div className="bg-destructive/10 rounded-xl p-4 text-center">
                                        <Ban className="w-10 h-10 text-destructive mx-auto mb-2" />
                                        <p className="text-sm text-foreground">
                                            Are you sure you want to remove <strong>{targetUser.displayName}</strong> from your space?
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            They won't be able to rejoin this space.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setMode('menu')}
                                            className="flex-1 h-11 rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBan}
                                            disabled={banUser.isPending}
                                            className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground"
                                        >
                                            {banUser.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Remove User'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
