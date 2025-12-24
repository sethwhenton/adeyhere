import { useState } from 'react';
import { ArrowLeft, Search, UserPlus, MessageCircle, X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Friend } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export function FriendsView() {
    const { setViewMode } = useAppStore();
    const [friends, setFriends] = useState<Friend[]>([]); // Start empty to show "No friends yet" state
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock generic results for demonstration when searching
    const mockResults = searchQuery.length > 1 ? [
        { id: '1', friendName: 'Alice Wonderland', friendAvatar: '🎩', status: 'pending' },
        { id: '2', friendName: 'Bob Builder', friendAvatar: '👷', status: 'pending' },
    ] : [];

    const handleBack = () => {
        if (isSearching) {
            setIsSearching(false);
            setSearchQuery('');
        } else {
            setViewMode('map');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 py-4 h-[72px] flex items-center">
                <AnimatePresence mode="wait">
                    {!isSearching ? (
                        <motion.div
                            key="normal-header"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 w-full"
                        >
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-foreground">Friends</h1>
                            <div className="ml-auto flex gap-2">
                                <button
                                    onClick={() => setIsSearching(true)}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <button className="p-2 hover:bg-secondary rounded-full transition-colors">
                                    <UserPlus className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="search-header"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 w-full"
                        >
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex-1 relative">
                                <Input
                                    autoFocus
                                    placeholder="Search people..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 bg-secondary/50 border-transparent focus:border-primary rounded-xl"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="p-4">
                {isSearching && searchQuery ? (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground px-2">Suggestions</p>
                        {mockResults.length > 0 ? (
                            mockResults.map((result: any) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">
                                        {result.friendAvatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground truncate">{result.friendName}</h4>
                                        <p className="text-xs text-muted-foreground">Not in your friends list</p>
                                    </div>
                                    <button className="p-2 hover:bg-secondary rounded-full transition-colors text-primary">
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No results found</p>
                        )}
                    </div>
                ) : friends.length === 0 && !isSearching ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center mt-24 text-center"
                    >
                        <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-inner">
                            👥
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">No friends yet</h3>
                        <p className="text-muted-foreground max-w-xs leading-relaxed">
                            When you meet people in spaces, add them as friends to keep in touch here!
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-1">
                        {friends.map((friend) => (
                            <motion.div
                                key={friend.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl overflow-hidden">
                                    {friend.friendAvatar || '👤'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground truncate">{friend.friendName}</h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {friend.status === 'accepted' ? 'Available' : 'Pending'}
                                    </p>
                                </div>
                                <button className="p-2 hover:bg-background rounded-full transition-colors border border-border/50">
                                    <MessageCircle className="w-5 h-5 text-space" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
