import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users } from 'lucide-react';
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

export function CreateSpaceModal({ isOpen, onClose }: CreateSpaceModalProps) {
  const [name, setName] = useState('');
  const [radius, setRadius] = useState([200]);
  const [duration, setDuration] = useState([3]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, setActiveSpace } = useAppStore();
  const createMutation = useCreateSpace();

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
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
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

              {/* Space Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  What's happening?
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
              <div className="mb-8">
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
