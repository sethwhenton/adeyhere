import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/geo';
import { CreateSpaceModal } from './CreateSpaceModal';
import { Space } from '@/types';

export function MapView() {
  const { location } = useGeolocation();
  const { spaces, currentUser, joinSpace } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);

  const userLocation = currentUser?.location || location || { lat: 37.7749, lng: -122.4194 };

  // Find nearby spaces
  const nearbySpaces = spaces.filter((space) => {
    const distance = calculateDistance(userLocation, space.center);
    return distance <= space.radius + 500; // Show spaces within reach
  });

  const handleSpaceClick = (space: Space) => {
    const distance = calculateDistance(userLocation, space.center);
    if (distance <= space.radius) {
      setSelectedSpace(space);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-space/5 to-space/20">
        {/* Grid pattern for map feel */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Spaces as pulsing circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {nearbySpaces.map((space, index) => {
          const distance = calculateDistance(userLocation, space.center);
          const isWithin = distance <= space.radius;
          const offsetX = (space.center.lng - userLocation.lng) * 50000;
          const offsetY = (userLocation.lat - space.center.lat) * 50000;

          return (
            <motion.div
              key={space.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className="absolute"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            >
              <motion.button
                onClick={() => handleSpaceClick(space)}
                className={`relative rounded-full cursor-pointer transition-all ${
                  isWithin ? 'hover:scale-105' : 'opacity-60'
                }`}
                style={{
                  width: `${(space.radius / 300) * 200 + 80}px`,
                  height: `${(space.radius / 300) * 200 + 80}px`,
                }}
                whileHover={isWithin ? { scale: 1.05 } : {}}
              >
                {/* Outer pulse ring */}
                <div className="absolute inset-0 rounded-full bg-space/30 space-pulse" />
                
                {/* Inner circle */}
                <div className="absolute inset-4 rounded-full bg-space/40 backdrop-blur-sm flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold text-foreground mb-1 px-4 text-center line-clamp-2">
                    {space.name}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{space.participants.length}</span>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          );
        })}

        {/* User's Blue Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="absolute z-20"
        >
          <div className="relative">
            {/* Accuracy circle */}
            <div className="absolute -inset-4 rounded-full bg-space/20 animate-pulse" />
            
            {/* Blue dot */}
            <div className="w-5 h-5 rounded-full bg-space-deep shadow-glow border-2 border-card" />
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-lg rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center text-xl">
                {currentUser?.avatar || '😊'}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Hey, {currentUser?.displayName}!
                </h2>
                <p className="text-sm text-muted-foreground">
                  {nearbySpaces.length} spaces nearby
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-space-deep font-medium">
              <MapPin className="w-4 h-4" />
              <span>Live</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Host Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-14 px-6 rounded-2xl gradient-space text-primary-foreground font-semibold shadow-glow hover:shadow-soft transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Host a Space
        </Button>
      </motion.div>

      {/* Join Space Card */}
      <AnimatePresence>
        {selectedSpace && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-0 left-0 right-0 z-40 p-4"
          >
            <div className="bg-card rounded-3xl p-5 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {selectedSpace.name}
                  </h3>
                  <p className="text-muted-foreground">
                    Hosted by {selectedSpace.hostName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSpace(null)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{selectedSpace.participants.length} people</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.round(
                      (selectedSpace.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
                    )}h left
                  </span>
                </div>
              </div>

              {/* Participant Avatars */}
              <div className="flex -space-x-2 mb-5">
                {selectedSpace.participants.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-lg"
                  >
                    {p.isGhost ? '👻' : p.avatar}
                  </div>
                ))}
                {selectedSpace.participants.length > 5 && (
                  <div className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-sm font-medium">
                    +{selectedSpace.participants.length - 5}
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  joinSpace(selectedSpace.id);
                  setSelectedSpace(null);
                }}
                className="w-full h-12 rounded-xl gradient-space text-primary-foreground font-semibold shadow-soft"
              >
                Join Space
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
