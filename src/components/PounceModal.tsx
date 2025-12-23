import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSendPounce } from '@/integrations/supabase/interactions';
import { toast } from 'sonner';

const POUNCE_TYPES = [
    { type: 'wave', emoji: '👋', label: 'Wave' },
    { type: 'wink', emoji: '😉', label: 'Wink' },
    { type: 'nod', emoji: '🙂', label: 'Nod' },
    { type: 'high-five', emoji: '🙌', label: 'High Five' },
] as const;

interface PounceModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: string;
        displayName: string;
        avatar?: string;
    };
    currentUserId: string;
    spaceId?: string;
}

export function PounceModal({ isOpen, onClose, targetUser, currentUserId, spaceId }: PounceModalProps) {
    const [selectedType, setSelectedType] = useState<typeof POUNCE_TYPES[number]['type']>('wave');
    const [customMessage, setCustomMessage] = useState('');
    const sendPounce = useSendPounce();

    const handleSend = async () => {
        try {
            await sendPounce.mutateAsync({
                fromUserId: currentUserId,
                toUserId: targetUser.id,
                pounceType: selectedType,
                message: customMessage || undefined,
                spaceId,
            });
            toast.success(`Sent a ${selectedType} to ${targetUser.displayName}!`);
            onClose();
            setCustomMessage('');
        } catch (error) {
            toast.error('Failed to send pounce');
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
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4"
                    >
                        <div className="bg-card rounded-3xl p-5 shadow-card max-w-lg mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                                        {targetUser.avatar || '😊'}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Say hi to</p>
                                        <h3 className="text-lg font-bold text-foreground">{targetUser.displayName}</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Pounce Type Selection */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {POUNCE_TYPES.map((pounce) => (
                                    <motion.button
                                        key={pounce.type}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedType(pounce.type)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${selectedType === pounce.type
                                                ? 'bg-space/20 ring-2 ring-space'
                                                : 'bg-secondary hover:bg-secondary/80'
                                            }`}
                                    >
                                        <span className="text-2xl">{pounce.emoji}</span>
                                        <span className="text-xs font-medium">{pounce.label}</span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Custom Message */}
                            <div className="mb-4">
                                <Input
                                    placeholder="Add a quick message (optional)"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    maxLength={100}
                                    className="h-12 bg-secondary/50"
                                />
                            </div>

                            {/* Send Button */}
                            <Button
                                onClick={handleSend}
                                disabled={sendPounce.isPending}
                                className="w-full h-12 rounded-xl gradient-space text-primary-foreground font-semibold"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {sendPounce.isPending ? 'Sending...' : 'Send Pounce'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
