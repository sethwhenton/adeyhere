import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, MessageCircle, Package, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/store/appStore';
import { useCreateSpace } from '@/integrations/supabase/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpaceFeatures {
  groupChat: boolean;
  lostAndFound: boolean;
  qa: boolean;
}

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState([200]);
  const [duration, setDuration] = useState([3]);
  const [features, setFeatures] = useState<SpaceFeatures>({
    groupChat: true,
    lostAndFound: true,
    qa: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, setActiveSpace } = useAppStore();
  const createMutation = useCreateSpace();

  const toggleFeature = (feature: keyof SpaceFeatures) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleCreate = async () => {
    if (name.trim() && currentUser) {
      setIsSubmitting(true);
      try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + duration[0]);

        const newSpace = await createMutation.mutateAsync({
          name: name.trim(),
          center: currentUser.location,
          radius: radius[0],
          hostId: currentUser.id,
          hostName: currentUser.displayName,
          expiresAt,
          description: description.trim(),
        });

        // Set the active space in store to enter Radar view
        setActiveSpace({
          id: newSpace.id,
          name: newSpace.name,
          hostId: newSpace.host_id,
          hostName: currentUser.displayName,
          center: { lat: newSpace.center_lat, lng: newSpace.center_lng },
          radius: newSpace.radius,
          createdAt: new Date(newSpace.created_at),
          expiresAt: new Date(newSpace.expires_at),
          participants: [] // Will be fetched by RadarView
        });

        setName('');
        setDescription('');
        setRadius([200]);
        setDuration([3]);
        onClose();
        toast.success("Your space is live! 🎉");
      } catch (error) {
        toast.error("Failed to create space");
      } finally {
        setIsSubmitting(false);
      }
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-card rounded-3xl p-6 shadow-card max-w-lg mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Host a Space</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Space Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Sunday Jazz in the Park"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-secondary/50 border-border focus:border-primary"
                  maxLength={40}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Tell people what your space is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:outline-none resize-none text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/150</p>
              </div>

              {/* Radius Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Reach radius
                  </label>
                  <span className="text-sm font-semibold text-space-deep">
                    {radius[0]}m
                  </span>
                </div>
                <Slider
                  value={radius}
                  onValueChange={setRadius}
                  min={50}
                  max={300}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  People within this range can discover and join your space
                </p>
              </div>

              {/* Duration Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Duration
                  </label>
                  <span className="text-sm font-semibold text-space-deep">
                    {duration[0]} hour{duration[0] > 1 ? 's' : ''}
                  </span>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Feature Toggles */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Features
                </label>
                <div className="space-y-2">
                  {/* Group Chat Toggle */}
                  <button
                    onClick={() => toggleFeature('groupChat')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${features.groupChat
                      ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                      : 'bg-secondary text-muted-foreground border border-transparent'
                      }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Group Chat</p>
                      <p className="text-xs opacity-70">Real-time chat for everyone</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${features.groupChat ? 'bg-sky-500' : 'bg-secondary-foreground/30'}`}>
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow mt-0.5"
                        style={{ marginLeft: features.groupChat ? 18 : 2 }}
                      />
                    </div>
                  </button>

                  {/* Lost & Found Toggle */}
                  <button
                    onClick={() => toggleFeature('lostAndFound')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${features.lostAndFound
                      ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                      : 'bg-secondary text-muted-foreground border border-transparent'
                      }`}
                  >
                    <Package className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Lost & Found</p>
                      <p className="text-xs opacity-70">Help find lost items</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${features.lostAndFound ? 'bg-sky-500' : 'bg-secondary-foreground/30'}`}>
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow mt-0.5"
                        style={{ marginLeft: features.lostAndFound ? 18 : 2 }}
                      />
                    </div>
                  </button>

                  {/* Q&A Toggle */}
                  <button
                    onClick={() => toggleFeature('qa')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${features.qa
                      ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                      : 'bg-secondary text-muted-foreground border border-transparent'
                      }`}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Q&A</p>
                      <p className="text-xs opacity-70">FAQs for attendees</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${features.qa ? 'bg-sky-500' : 'bg-secondary-foreground/30'}`}>
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow mt-0.5"
                        style={{ marginLeft: features.qa ? 18 : 2 }}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-secondary/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-space/30 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-space animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {name || 'Your Space'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hosted by you • {radius[0]}m radius
                    </p>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isSubmitting}
                className="w-full h-12 rounded-xl gradient-space text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Go Live 🎉"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

