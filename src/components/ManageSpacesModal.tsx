import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, MapPin, Users, Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { useDeleteSpace } from '@/integrations/supabase/hooks';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ManagedSpace {
    id: string;
    name: string;
    center: { lat: number; lng: number };
    radius: number;
    createdAt: Date;
    expiresAt: Date;
    participantCount: number;
    description?: string;
}

interface ManageSpacesModalProps {
    isOpen: boolean;
    onClose: () => void;
    spaces: ManagedSpace[];
    onSpaceDeleted: () => void;
}

export function ManageSpacesModal({ isOpen, onClose, spaces, onSpaceDeleted }: ManageSpacesModalProps) {
    const { currentUser, setActiveSpace } = useAppStore();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const deleteSpaceMutation = useDeleteSpace();

    const handleDeleteSpace = async (spaceId: string) => {
        if (!currentUser) return;

        setDeletingId(spaceId);
        try {
            await deleteSpaceMutation.mutateAsync({
                spaceId,
                hostId: currentUser.id
            });

            toast.success('Space deleted successfully');
            onSpaceDeleted();
            onClose();
        } catch (e) {
            console.error('Failed to delete space:', e);
            toast.error('Failed to delete space');
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewSpace = (space: ManagedSpace) => {
        setActiveSpace({
            id: space.id,
            name: space.name,
            hostId: currentUser?.id || '',
            hostName: currentUser?.displayName || 'You',
            center: space.center,
            radius: space.radius,
            createdAt: space.createdAt,
            expiresAt: space.expiresAt,
            participants: []
        });
        onClose();
    };

    const getTimeLeft = (expiresAt: Date) => {
        const hours = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));
        return hours > 0 ? `${hours}h left` : 'Expired';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[500] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="relative w-full max-w-md max-h-[80vh] bg-card rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-card border-b border-border z-10 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Manage Spaces</h2>
                                    <p className="text-xs text-muted-foreground">{spaces.length} active space{spaces.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {spaces.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
                                        <MapPin className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-2">No Active Spaces</h3>
                                    <p className="text-sm text-muted-foreground">
                                        You haven't created any spaces yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {spaces.map((space) => (
                                        <motion.div
                                            key={space.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="bg-secondary/30 rounded-2xl p-4 border border-border/50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                {/* Space Info - Clickable */}
                                                <button
                                                    onClick={() => handleViewSpace(space)}
                                                    className="flex-1 text-left"
                                                >
                                                    <h3 className="font-semibold text-foreground mb-1 hover:text-space-deep transition-colors">
                                                        {space.name}
                                                    </h3>
                                                    {space.description && (
                                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                            {space.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                                            <Users className="w-3 h-3" />
                                                            {space.participantCount}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                                            <Clock className="w-3 h-3" />
                                                            {getTimeLeft(space.expiresAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                                            <MapPin className="w-3 h-3" />
                                                            {space.radius}m
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Created {formatDistanceToNow(space.createdAt, { addSuffix: true })}
                                                    </p>
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteSpace(space.id)}
                                                    disabled={deletingId === space.id}
                                                    className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === space.id ? (
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                            className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                                                        />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 border-t border-border bg-secondary/30">
                            <p className="text-xs text-muted-foreground text-center">
                                💡 Tap on a space to view it in Radar mode
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
