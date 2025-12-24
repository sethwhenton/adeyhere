import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Package, Search, MessageCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LostFoundPost } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LostAndFoundProps {
    spaceId: string;
    currentUserId: string;
    onBack: () => void;
}

// Mock data for demo
const mockPosts: LostFoundPost[] = [
    {
        id: '1',
        spaceId: '1',
        userId: 'user1',
        userName: 'Alex',
        userAvatar: '🧑',
        type: 'found',
        title: 'Found Keys',
        description: 'Found a set of car keys near the food court. Has a blue keychain.',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400',
        createdAt: new Date(),
        resolved: false,
    },
    {
        id: '2',
        spaceId: '1',
        userId: 'user2',
        userName: 'Jordan',
        userAvatar: '👩',
        type: 'lost',
        title: 'Lost Wallet',
        description: 'Black leather wallet lost near the main stage. Contains ID cards.',
        createdAt: new Date(Date.now() - 3600000),
        resolved: false,
    },
];

export function LostAndFound({ spaceId, currentUserId, onBack }: LostAndFoundProps) {
    const [posts, setPosts] = useState<LostFoundPost[]>(mockPosts);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<LostFoundPost | null>(null);
    const [dmMessage, setDmMessage] = useState('');

    // New post form
    const [newType, setNewType] = useState<'lost' | 'found'>('found');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    const filteredPosts = posts.filter(post => {
        if (filter === 'all') return true;
        return post.type === filter;
    });

    const handleCreatePost = () => {
        if (!newTitle.trim() || !newDescription.trim()) {
            toast.error('Please fill in title and description');
            return;
        }

        const newPost: LostFoundPost = {
            id: Date.now().toString(),
            spaceId,
            userId: currentUserId,
            userName: 'You',
            userAvatar: '😊',
            type: newType,
            title: newTitle.trim(),
            description: newDescription.trim(),
            imageUrl: newImageUrl.trim() || undefined,
            createdAt: new Date(),
            resolved: false,
        };

        setPosts([newPost, ...posts]);
        setNewTitle('');
        setNewDescription('');
        setNewImageUrl('');
        setIsCreating(false);
        toast.success('Post created!');
    };

    const handleSendDM = () => {
        if (!dmMessage.trim() || !selectedPost) return;

        // This would send a message request in a real implementation
        toast.success(`Message sent to ${selectedPost.userName}! They'll see it in their Message Requests.`);
        setDmMessage('');
        setSelectedPost(null);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">📦 Lost & Found</h2>
                    <p className="text-sm text-muted-foreground">Help find lost items</p>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Post
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-border">
                {(['all', 'lost', 'found'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {f === 'all' ? 'All' : f === 'lost' ? '🔍 Lost' : '📦 Found'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Create Post Form */}
                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 space-y-3"
                        >
                            {/* Type Toggle */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setNewType('found')}
                                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${newType === 'found'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-background text-muted-foreground'
                                        }`}
                                >
                                    📦 I Found Something
                                </button>
                                <button
                                    onClick={() => setNewType('lost')}
                                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${newType === 'lost'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-background text-muted-foreground'
                                        }`}
                                >
                                    🔍 I Lost Something
                                </button>
                            </div>

                            <Input
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="What is it? (e.g., Black Wallet)"
                                className="h-12 rounded-xl"
                            />
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Describe it in detail..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none resize-none"
                            />
                            <Input
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Image URL (optional)"
                                className="h-12 rounded-xl"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleCreatePost} className="flex-1 rounded-xl">
                                    Post
                                </Button>
                                <Button
                                    onClick={() => setIsCreating(false)}
                                    variant="secondary"
                                    className="rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Posts - IG Style */}
                {filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl mb-4">
                            📦
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No items yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Report lost or found items here
                        </p>
                    </div>
                ) : (
                    filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-secondary rounded-2xl overflow-hidden"
                        >
                            {/* Image */}
                            {post.imageUrl && (
                                <div className="relative w-full h-48 bg-background">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${post.type === 'found' ? 'bg-amber-500' : 'bg-red-500'
                                        }`}>
                                        {post.type === 'found' ? '📦 FOUND' : '🔍 LOST'}
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-4">
                                {!post.imageUrl && (
                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2 ${post.type === 'found' ? 'bg-amber-500' : 'bg-red-500'
                                        }`}>
                                        {post.type === 'found' ? '📦 FOUND' : '🔍 LOST'}
                                    </div>
                                )}
                                <h3 className="font-semibold text-foreground">{post.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{post.description}</p>

                                {/* User & Actions */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{post.userAvatar}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {post.userName} • {format(new Date(post.createdAt), 'h:mm a')}
                                        </span>
                                    </div>
                                    {post.userId !== currentUserId && (
                                        <Button
                                            onClick={() => setSelectedPost(post)}
                                            size="sm"
                                            variant="secondary"
                                            className="rounded-xl"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            Contact
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* DM Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
                            onClick={() => setSelectedPost(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl z-[60] p-4 shadow-card"
                        >
                            <h3 className="font-semibold text-foreground mb-2">
                                Message {selectedPost.userName}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                About: {selectedPost.title}
                            </p>
                            <textarea
                                value={dmMessage}
                                onChange={(e) => setDmMessage(e.target.value)}
                                placeholder="I think that's mine!"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none resize-none mb-3"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSendDM} className="flex-1 rounded-xl">
                                    Send Message
                                </Button>
                                <Button
                                    onClick={() => setSelectedPost(null)}
                                    variant="secondary"
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
