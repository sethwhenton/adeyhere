import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementBellProps {
    announcements: Announcement[];
    userId: string;
    onOpen: () => void;
}

export function AnnouncementBell({ announcements, userId, onOpen }: AnnouncementBellProps) {
    // Count unread announcements
    const unreadCount = announcements.filter(a => !a.readBy.includes(userId)).length;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpen}
            className="relative p-3 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all"
        >
            <Megaphone className="w-5 h-5 text-foreground" />

            {/* Unread Badge */}
            <AnimatePresence>
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-sky-400 text-white text-xs font-bold flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
