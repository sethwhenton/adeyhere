import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, AlertCircle, Search, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';

const BEACON_TYPES = [
    { type: 'help', emoji: '🆘', label: 'Need Help', color: 'bg-red-500', description: 'Signal that you need assistance' },
    { type: 'lost', emoji: '🔍', label: 'Lost Something', color: 'bg-amber-500', description: 'Looking for a lost item' },
    { type: 'found', emoji: '📦', label: 'Found Something', color: 'bg-green-500', description: 'Found an item that belongs to someone' },
    { type: 'meetup', emoji: '📍', label: 'Meetup Point', color: 'bg-blue-500', description: 'Gathering spot for friends' },
] as const;

interface BeaconModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentBeacon?: { type: string; message: string } | null;
}

export function BeaconModal({ isOpen, onClose, userId, currentBeacon }: BeaconModalProps) {
    const [selectedType, setSelectedType] = useState<string | null>(currentBeacon?.type || null);
    const [message, setMessage] = useState(currentBeacon?.message || '');
    const queryClient = useQueryClient();

    const activateBeacon = useMutation({
        mutationFn: async ({ type, message }: { type: string; message: string }) => {
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Beacons expire after 30 mins

            const { error } = await supabase
                .from('profiles')
                .update({
                    beacon_type: type,
                    beacon_message: message,
                    beacon_expires_at: expiresAt.toISOString(),
                })
                .eq('id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] });
            haptics.success();
            toast.success('Beacon activated! Others can now see your signal.');
            onClose();
        },
        onError: () => {
            haptics.error();
            toast.error('Failed to activate beacon');
        },
    });

    const deactivateBeacon = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    beacon_type: null,
                    beacon_message: null,
                    beacon_expires_at: null,
                })
                .eq('id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] });
            haptics.tap();
            toast.success('Beacon deactivated');
            onClose();
        },
    });

    const handleActivate = () => {
        if (!selectedType) {
            toast.error('Please select a beacon type');
            return;
        }
        activateBeacon.mutate({ type: selectedType, message });
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
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center animate-pulse">
                                        <Radio className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Activate Beacon</h3>
                                        <p className="text-sm text-muted-foreground">Signal others on the radar</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Beacon Types */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {BEACON_TYPES.map((beacon) => (
                                    <motion.button
                                        key={beacon.type}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedType(beacon.type);
                                            haptics.tap();
                                        }}
                                        className={`p-3 rounded-xl text-left transition-all ${selectedType === beacon.type
                                                ? 'ring-2 ring-space bg-space/10'
                                                : 'bg-secondary hover:bg-secondary/80'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{beacon.emoji}</span>
                                            <span className="font-medium text-foreground">{beacon.label}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{beacon.description}</p>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Message */}
                            <div className="mb-4">
                                <Input
                                    placeholder="Add details (optional)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={100}
                                    className="h-12 bg-secondary/50"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {currentBeacon && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => deactivateBeacon.mutate()}
                                        disabled={deactivateBeacon.isPending}
                                        className="flex-1 h-11 rounded-xl"
                                    >
                                        Turn Off
                                    </Button>
                                )}
                                <Button
                                    onClick={handleActivate}
                                    disabled={!selectedType || activateBeacon.isPending}
                                    className="flex-1 h-11 rounded-xl gradient-space text-primary-foreground font-semibold"
                                >
                                    {activateBeacon.isPending ? 'Activating...' : 'Activate Beacon'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
