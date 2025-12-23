import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendConnectionRequest } from '@/integrations/supabase/interactions';
import { toast } from 'sonner';

interface ConnectionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: string;
        displayName: string;
        avatar?: string;
    };
    currentUserId: string;
}

export function ConnectionRequestModal({ isOpen, onClose, targetUser, currentUserId }: ConnectionRequestModalProps) {
    const sendRequest = useSendConnectionRequest();

    const handleSendRequest = async () => {
        try {
            await sendRequest.mutateAsync({
                requesterId: currentUserId,
                receiverId: targetUser.id,
            });
            toast.success(`Link request sent to ${targetUser.displayName}!`);
            onClose();
        } catch (error) {
            toast.error('Failed to send request');
        }
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div className="bg-card rounded-3xl p-6 shadow-card max-w-sm w-full text-center">
                            {/* Avatar */}
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-secondary flex items-center justify-center text-4xl mb-4">
                                {targetUser.avatar || '😊'}
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-bold text-foreground mb-2">{targetUser.displayName}</h3>

                            {/* Description */}
                            <p className="text-muted-foreground mb-6">
                                Send a Link request to stay connected after the event ends!
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendRequest}
                                    disabled={sendRequest.isPending}
                                    className="flex-1 h-12 rounded-xl gradient-space text-primary-foreground font-semibold"
                                >
                                    {sendRequest.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <UserPlus className="w-4 h-4 mr-2" />
                                    )}
                                    Send Link
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
