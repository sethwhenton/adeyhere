import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { format } from 'date-fns';
import { useMessages, useSendMessage, useParticipants } from '@/integrations/supabase/hooks';
import { useRealtimeMessages } from '@/integrations/supabase/realtime';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TownSquareProps {
  isOpen: boolean;
  onClose: () => void;
  broadcastOnly?: boolean;
}

export function TownSquare({ isOpen, onClose, broadcastOnly = false }: TownSquareProps) {
  const [message, setMessage] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser, activeSpace } = useAppStore();

  const { data: messages = [], isLoading } = useMessages(activeSpace?.id);
  const { data: participants = [] } = useParticipants(activeSpace?.id);
  const sendMessageMutation = useSendMessage();

  // Real-time subscription for instant message updates
  useRealtimeMessages(activeSpace?.id);

  const isHost = activeSpace?.hostId === currentUser?.id;
  const canSendMessage = isHost || !broadcastOnly;

  const allMessages = messages; // Already sorted in the hook

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = async () => {
    if (message.trim() && activeSpace && currentUser) {
      try {
        await sendMessageMutation.mutateAsync({
          spaceId: activeSpace.id,
          userId: currentUser.id,
          content: message.trim(),
          isBroadcast: showBroadcast && isHost
        });
        setMessage('');
        setShowBroadcast(false);
      } catch (e) {
        toast.error("Failed to send message");
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-card rounded-t-3xl z-50 flex flex-col shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground">Town Square</h2>
                <p className="text-sm text-muted-foreground">
                  {participants.length} people chatting
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {allMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-3xl mb-4">
                    💬
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Start the conversation!</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to say hello
                  </p>
                </div>
              ) : (
                allMessages.map((msg) => {
                  const isOwn = msg.userId === currentUser?.id;
                  const isSystemMessage = msg.userId === 'system';

                  if (isSystemMessage) {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center"
                      >
                        <div className="bg-space/10 text-space-deep px-4 py-2 rounded-full text-sm">
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  }

                  if (msg.isBroadcast) {
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-broadcast/10 border border-broadcast/20 rounded-2xl p-4 broadcast-glow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Megaphone className="w-4 h-4 text-broadcast" />
                          <span className="text-sm font-semibold text-broadcast">
                            Broadcast from {msg.userName}
                          </span>
                        </div>
                        <p className="text-foreground">{msg.content}</p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {format(msg.timestamp, 'h:mm a')}
                        </span>
                      </motion.div>
                    );
                  }

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
                            ? 'bg-space text-primary-foreground rounded-br-md'
                            : 'bg-secondary text-foreground rounded-bl-md'
                            }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {format(msg.timestamp, 'h:mm a')}
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
              {/* Broadcast Only Notice */}
              {broadcastOnly && !isHost && (
                <div className="flex items-center gap-2 px-4 py-3 mb-3 rounded-xl bg-broadcast/10 text-broadcast">
                  <Megaphone className="w-4 h-4" />
                  <span className="text-sm">Chat is in broadcast mode. Only the host can send messages.</span>
                </div>
              )}

              {/* Broadcast toggle for host */}
              {isHost && (
                <button
                  onClick={() => setShowBroadcast(!showBroadcast)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-3 transition-colors ${showBroadcast
                    ? 'bg-broadcast/20 text-broadcast'
                    : 'bg-secondary text-muted-foreground'
                    }`}
                >
                  <Megaphone className="w-4 h-4" />
                  {showBroadcast ? 'Broadcasting to all' : 'Send as broadcast'}
                </button>
              )}

              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder={!canSendMessage ? 'Chat is in broadcast mode...' : showBroadcast ? 'Announce to everyone...' : 'Say something nice...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!canSendMessage}
                  className={`flex-1 h-12 rounded-2xl ${showBroadcast
                    ? 'bg-broadcast/10 border-broadcast/30 focus:border-broadcast'
                    : 'bg-secondary border-border focus:border-primary'
                    } ${!canSendMessage ? 'opacity-50' : ''}`}
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || !canSendMessage}
                  className={`w-12 h-12 rounded-2xl ${showBroadcast
                    ? 'bg-broadcast hover:bg-broadcast/90'
                    : 'gradient-space'
                    } shadow-soft disabled:opacity-50`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
