import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Announcement } from '@/types';

interface AnnouncementFeedProps {
    isOpen: boolean;
    onClose: () => void;
    announcements: Announcement[];
    userId: string;
    onMarkAsRead: (announcementId: string) => void;
}

export function AnnouncementFeed({
    isOpen,
    onClose,
    announcements,
    userId,
    onMarkAsRead,
}: AnnouncementFeedProps) {
    // Mark announcements as read when feed opens
    useEffect(() => {
        if (isOpen) {
            announcements
                .filter(a => !a.readBy.includes(userId))
                .forEach(a => onMarkAsRead(a.id));
        }
    }, [isOpen, announcements, userId, onMarkAsRead]);

    const sortedAnnouncements = [...announcements].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Feed Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 h-[90vh] bg-card rounded-t-3xl z-50 flex flex-col shadow-card"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">📢 Announcements</h2>
                                <p className="text-sm text-muted-foreground">
                                    Updates from your host
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Announcements List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {sortedAnnouncements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-3xl mb-4">
                                        📢
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">No announcements yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your host will post updates here
                                    </p>
                                </div>
                            ) : (
                                sortedAnnouncements.map((announcement, index) => (
                                    <motion.div
                                        key={announcement.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, type: 'spring', damping: 20 }}
                                        className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl overflow-hidden shadow-soft"
                                    >
                                        {/* Image */}
                                        {announcement.imageUrl && (
                                            <div className="relative w-full h-48 bg-secondary">
                                                <img
                                                    src={announcement.imageUrl}
                                                    alt="Announcement"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="p-4">
                                            <p className="text-foreground whitespace-pre-wrap mb-3">
                                                {announcement.content}
                                            </p>

                                            {/* Link */}
                                            {announcement.linkUrl && (
                                                <a
                                                    href={announcement.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-colors"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {announcement.linkText || 'View Link'}
                                                    </span>
                                                </a>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-xs text-muted-foreground mt-3">
                                                {format(new Date(announcement.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
