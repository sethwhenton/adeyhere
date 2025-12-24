import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MessageCircle, Search as SearchIcon, Package } from 'lucide-react';
import { Announcement } from '@/types';
import { QASection } from './QASection';
import { GroupChat } from './GroupChat';
import { LostAndFound } from './LostAndFound';
import { FindAFriend } from './FindAFriend';

type HubSection = 'main' | 'qa' | 'chat' | 'lostfound' | 'findfriend';

interface CommunityHubProps {
    isOpen: boolean;
    onClose: () => void;
    spaceId: string;
    spaceName: string;
    isHost: boolean;
    currentUserId: string;
    latestAnnouncement?: Announcement;
}

export function CommunityHub({
    isOpen,
    onClose,
    spaceId,
    spaceName,
    isHost,
    currentUserId,
    latestAnnouncement,
}: CommunityHubProps) {
    const [activeSection, setActiveSection] = useState<HubSection>('main');

    const pillars = [
        {
            id: 'qa' as const,
            icon: HelpCircle,
            label: 'Q&A',
            description: 'FAQs & answers',
            color: 'from-purple-500 to-indigo-500',
        },
        {
            id: 'chat' as const,
            icon: MessageCircle,
            label: 'Group Chat',
            description: 'Chat with everyone',
            color: 'from-sky-500 to-blue-500',
        },
        {
            id: 'lostfound' as const,
            icon: Package,
            label: 'Lost & Found',
            description: 'Find or report items',
            color: 'from-amber-500 to-orange-500',
        },
        {
            id: 'findfriend' as const,
            icon: SearchIcon,
            label: 'Find a Friend',
            description: 'See who\'s nearby',
            color: 'from-emerald-500 to-teal-500',
        },
    ];

    const handleBack = () => {
        if (activeSection === 'main') {
            onClose();
        } else {
            setActiveSection('main');
        }
    };

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
                        onClick={handleBack}
                    />

                    {/* Hub Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 h-[90vh] bg-card rounded-t-3xl z-50 flex flex-col shadow-card"
                    >
                        {/* Main Hub View */}
                        {activeSection === 'main' && (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">🏠 Community Hub</h2>
                                        <p className="text-sm text-muted-foreground">{spaceName}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Pinned Announcement Preview */}
                                {latestAnnouncement && (
                                    <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">📢</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">Latest from Host</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {latestAnnouncement.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Four Pillars */}
                                <div className="flex-1 p-4 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        {pillars.map((pillar, index) => (
                                            <motion.button
                                                key={pillar.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                                                onClick={() => setActiveSection(pillar.id)}
                                                className="flex flex-col items-center p-6 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all group"
                                            >
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                    <pillar.icon className="w-7 h-7 text-white" />
                                                </div>
                                                <h3 className="font-semibold text-foreground">{pillar.label}</h3>
                                                <p className="text-xs text-muted-foreground text-center mt-1">
                                                    {pillar.description}
                                                </p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Q&A Section */}
                        {activeSection === 'qa' && (
                            <QASection
                                spaceId={spaceId}
                                isHost={isHost}
                                onBack={() => setActiveSection('main')}
                            />
                        )}

                        {/* Group Chat */}
                        {activeSection === 'chat' && (
                            <GroupChat
                                spaceId={spaceId}
                                currentUserId={currentUserId}
                                onBack={() => setActiveSection('main')}
                            />
                        )}

                        {/* Lost & Found */}
                        {activeSection === 'lostfound' && (
                            <LostAndFound
                                spaceId={spaceId}
                                currentUserId={currentUserId}
                                onBack={() => setActiveSection('main')}
                            />
                        )}

                        {/* Find a Friend */}
                        {activeSection === 'findfriend' && (
                            <FindAFriend
                                spaceId={spaceId}
                                currentUserId={currentUserId}
                                onBack={() => setActiveSection('main')}
                            />
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
