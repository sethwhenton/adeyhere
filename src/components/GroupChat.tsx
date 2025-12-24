import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Message } from '@/types';
import { useMessages, useSendMessage, useParticipants } from '@/integrations/supabase/hooks';
import { useRealtimeMessages } from '@/integrations/supabase/realtime';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

interface GroupChatProps {
    spaceId: string;
    currentUserId: string;
    onBack: () => void;
}

export function GroupChat({ spaceId, currentUserId, onBack }: GroupChatProps) {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAppStore();

    const { data: messages = [], isLoading } = useMessages(spaceId);
    const { data: participants = [] } = useParticipants(spaceId);
    const sendMessageMutation = useSendMessage();

    // Real-time subscription
    useRealtimeMessages(spaceId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim() || !currentUser) return;

        try {
            await sendMessageMutation.mutateAsync({
                spaceId,
                userId: currentUserId,
                content: message.trim(),
                isBroadcast: false,
            });
            setMessage('');
        } catch (e) {
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                    <h2 className="text-lg font-bold text-foreground">💬 Group Chat</h2>
                    <p className="text-sm text-muted-foreground">
                        {participants.length} people chatting
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-3xl mb-4">
                            💬
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">Start the conversation!</h3>
                        <p className="text-sm text-muted-foreground">Be the first to say hello</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.userId === currentUserId;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm flex-shrink-0">
                                    {msg.userAvatar || '😊'}
                                </div>
                                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {!isOwn && (
                                        <span className="text-xs text-muted-foreground mb-1 block">
                                            {msg.userName}
                                        </span>
                                    )}
                                    <div
                                        className={`px-4 py-2 rounded-2xl ${isOwn
                                                ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-br-md'
                                                : 'bg-secondary text-foreground rounded-bl-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 h-12 rounded-2xl bg-secondary border-border focus:border-primary"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 shadow-soft disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </>
    );
}
