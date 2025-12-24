import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Link as LinkIcon, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AnnouncementCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (announcement: {
        content: string;
        imageUrl?: string;
        linkUrl?: string;
        linkText?: string;
    }) => Promise<void>;
}

export function AnnouncementCreator({ isOpen, onClose, onPublish }: AnnouncementCreatorProps) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!content.trim()) {
            toast.error('Please write a message');
            return;
        }

        setIsPublishing(true);
        try {
            await onPublish({
                content: content.trim(),
                imageUrl: imageUrl.trim() || undefined,
                linkUrl: linkUrl.trim() || undefined,
                linkText: linkText.trim() || undefined,
            });

            // Reset form
            setContent('');
            setImageUrl('');
            setLinkUrl('');
            setLinkText('');
            setShowImageInput(false);
            setShowLinkInput(false);

            toast.success('Announcement published! 📢');
            onClose();
        } catch (error) {
            toast.error('Failed to publish announcement');
        } finally {
            setIsPublishing(false);
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
                        onClick={onClose}
                    />

                    {/* Creator Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-3xl z-50 shadow-card overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">📢 Create Announcement</h2>
                                <p className="text-sm text-muted-foreground">
                                    Share updates with everyone in your Space
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-4 space-y-4">
                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your announcement..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground mt-1 text-right">
                                    {content.length}/500
                                </p>
                            </div>

                            {/* Image URL */}
                            <AnimatePresence>
                                {showImageInput && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Image URL
                                        </label>
                                        <Input
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="h-12 rounded-xl"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Link URL */}
                            <AnimatePresence>
                                {showLinkInput && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Link URL
                                            </label>
                                            <Input
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                placeholder="https://example.com"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Link Text (optional)
                                            </label>
                                            <Input
                                                value={linkText}
                                                onChange={(e) => setLinkText(e.target.value)}
                                                placeholder="View Schedule"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Toggle Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowImageInput(!showImageInput)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${showImageInput
                                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-sm">Image</span>
                                </button>
                                <button
                                    onClick={() => setShowLinkInput(!showLinkInput)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${showLinkInput
                                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    <span className="text-sm">Link</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border">
                            <Button
                                onClick={handlePublish}
                                disabled={!content.trim() || isPublishing}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold shadow-soft hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Publish Announcement
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
