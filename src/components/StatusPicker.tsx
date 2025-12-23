import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateStatus } from '@/integrations/supabase/interactions';
import { toast } from 'sonner';

const STATUS_PRESETS = [
    { emoji: '💃', text: 'Looking for a dance partner' },
    { emoji: '🎤', text: 'Here for the music' },
    { emoji: '👋', text: 'Open to chat' },
    { emoji: '📸', text: 'Taking photos' },
    { emoji: '🍕', text: 'Looking for food' },
    { emoji: '🤝', text: 'Networking' },
    { emoji: '🎧', text: 'In the zone' },
    { emoji: '🆕', text: 'First time here!' },
];

interface StatusPickerProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentStatus?: string;
    currentEmoji?: string;
}

export function StatusPicker({ isOpen, onClose, userId, currentStatus, currentEmoji }: StatusPickerProps) {
    const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || '😊');
    const [customStatus, setCustomStatus] = useState(currentStatus || '');
    const updateStatus = useUpdateStatus();

    const handlePresetClick = async (emoji: string, text: string) => {
        setSelectedEmoji(emoji);
        setCustomStatus(text);
    };

    const handleSave = async () => {
        try {
            await updateStatus.mutateAsync({
                userId,
                status: customStatus || null,
                statusEmoji: selectedEmoji,
            });
            toast.success('Status updated!');
            onClose();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleClear = async () => {
        try {
            await updateStatus.mutateAsync({
                userId,
                status: null,
                statusEmoji: '😊',
            });
            toast.success('Status cleared');
            setCustomStatus('');
            setSelectedEmoji('😊');
            onClose();
        } catch (error) {
            toast.error('Failed to clear status');
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
                                    <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Set Your Vibe</h3>
                                        <p className="text-sm text-muted-foreground">Let others know what you're up to</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Preset Statuses */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {STATUS_PRESETS.map((preset) => (
                                    <motion.button
                                        key={preset.text}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handlePresetClick(preset.emoji, preset.text)}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${customStatus === preset.text
                                                ? 'bg-space/20 ring-2 ring-space'
                                                : 'bg-secondary hover:bg-secondary/80'
                                            }`}
                                    >
                                        <span className="text-xl">{preset.emoji}</span>
                                        <span className="text-sm font-medium text-foreground truncate">{preset.text}</span>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Custom Status */}
                            <div className="flex gap-2 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                                    {selectedEmoji}
                                </div>
                                <Input
                                    placeholder="Or write your own..."
                                    value={customStatus}
                                    onChange={(e) => setCustomStatus(e.target.value)}
                                    maxLength={50}
                                    className="h-12 bg-secondary/50"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handleClear}
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={updateStatus.isPending}
                                    className="flex-1 h-12 rounded-xl gradient-space text-primary-foreground font-semibold"
                                >
                                    {updateStatus.isPending ? 'Saving...' : 'Save Vibe'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
