import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Users, Clock, ChevronRight, Navigation } from 'lucide-react';
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

  // Find nearby spaces (show all for demo)
  const nearbySpaces = spaces.filter((space) => {
    const distance = calculateDistance(userLocation, space.center);
    return distance <= 2000; // Show spaces within 2km
  });

  const handleSpaceClick = (space: Space) => {
    setSelectedSpace(space);
  };

  // Convert geo offset to pixel position (scaled for visual spread)
  const getSpacePosition = (space: Space) => {
    const scale = 80000; // Increase for more spread
    const offsetX = (space.center.lng - userLocation.lng) * scale;
    const offsetY = (userLocation.lat - space.center.lat) * scale;
    return { x: offsetX, y: offsetY };
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Map Background with streets feel */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-space/10" />
        
        {/* Street grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="streets" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Main roads */}
              <line x1="60" y1="0" x2="60" y2="120" stroke="hsl(var(--muted-foreground))" strokeWidth="3" />
              <line x1="0" y1="60" x2="120" y2="60" stroke="hsl(var(--muted-foreground))" strokeWidth="3" />
              {/* Secondary roads */}
              <line x1="30" y1="0" x2="30" y2="120" stroke="hsl(var(--border))" strokeWidth="1" />
              <line x1="90" y1="0" x2="90" y2="120" stroke="hsl(var(--border))" strokeWidth="1" />
              <line x1="0" y1="30" x2="120" y2="30" stroke="hsl(var(--border))" strokeWidth="1" />
              <line x1="0" y1="90" x2="120" y2="90" stroke="hsl(var(--border))" strokeWidth="1" />
            </pattern>
            {/* Building blocks */}
            <pattern id="blocks" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect x="5" y="5" width="22" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.5" />
              <rect x="35" y="5" width="22" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.3" />
              <rect x="65" y="5" width="22" height="18" rx="2" fill="hsl(var(--muted))" opacity="0.4" />
              <rect x="5" y="35" width="22" height="18" rx="2" fill="hsl(var(--muted))" opacity="0.35" />
              <rect x="35" y="35" width="18" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.45" />
              <rect x="65" y="35" width="22" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.3" />
              <rect x="5" y="65" width="18" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.4" />
              <rect x="35" y="68" width="22" height="18" rx="2" fill="hsl(var(--muted))" opacity="0.35" />
              <rect x="65" y="65" width="22" height="22" rx="2" fill="hsl(var(--muted))" opacity="0.5" />
              <rect x="95" y="5" width="20" height="50" rx="2" fill="hsl(var(--muted))" opacity="0.25" />
              <rect x="95" y="65" width="20" height="50" rx="2" fill="hsl(var(--muted))" opacity="0.35" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blocks)" />
          <rect width="100%" height="100%" fill="url(#streets)" />
        </svg>

        {/* Park areas */}
        <div className="absolute top-[15%] left-[10%] w-32 h-24 rounded-2xl bg-success/10 border border-success/20" />
        <div className="absolute bottom-[25%] right-[15%] w-40 h-28 rounded-3xl bg-success/15 border border-success/20" />
        <div className="absolute top-[60%] left-[20%] w-24 h-20 rounded-xl bg-success/10 border border-success/20" />
      </div>

      {/* Spaces container - centered with user at center */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Render spaces */}
        {nearbySpaces.map((space, index) => {
          const distance = calculateDistance(userLocation, space.center);
          const isWithin = distance <= space.radius;
          const position = getSpacePosition(space);
          const size = (space.radius / 300) * 140 + 100;

          return (
            <motion.div
              key={space.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
              className="absolute"
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.button
                onClick={() => handleSpaceClick(space)}
                className="relative rounded-full cursor-pointer group"
                style={{ width: size, height: size }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer pulse ring */}
                <div className="absolute inset-0 rounded-full bg-space/25 space-pulse" />
                <div className="absolute inset-2 rounded-full bg-space/20 space-pulse" style={{ animationDelay: '0.5s' }} />
                
                {/* Inner circle */}
                <div className={`absolute inset-4 rounded-full backdrop-blur-sm flex flex-col items-center justify-center transition-all ${
                  isWithin ? 'bg-space/50 shadow-glow' : 'bg-space/30'
                }`}>
                  <span className="text-sm font-semibold text-foreground mb-0.5 px-3 text-center line-clamp-2 leading-tight">
                    {space.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{space.participants.length}</span>
                  </div>
                  {isWithin && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-space-deep whitespace-nowrap bg-card/80 px-2 py-0.5 rounded-full">
                      Tap to join
                    </span>
                  )}
                </div>
              </motion.button>
            </motion.div>
          );
        })}

        {/* User's Blue Dot - always at center */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="absolute z-20"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            {/* Accuracy circle */}
            <div className="absolute -inset-6 rounded-full bg-space/15 animate-pulse" />
            <div className="absolute -inset-3 rounded-full bg-space/25" />
            
            {/* Blue dot with arrow */}
            <div className="w-6 h-6 rounded-full bg-space-deep shadow-glow border-3 border-card flex items-center justify-center">
              <Navigation className="w-3 h-3 text-card fill-card" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-lg rounded-2xl p-4 shadow-card"
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-space/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-space-deep animate-pulse" />
              <span className="text-sm text-space-deep font-medium">Live</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Space List - scrollable cards at bottom */}
      <div className="absolute bottom-24 left-0 right-0 z-20 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {nearbySpaces.map((space) => {
            const distance = calculateDistance(userLocation, space.center);
            const isWithin = distance <= space.radius;
            
            return (
              <motion.button
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSpaceClick(space)}
                className={`flex-shrink-0 bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-card min-w-[160px] text-left transition-all ${
                  isWithin ? 'ring-2 ring-space' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-space/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-space animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{space.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {space.participants.length}
                  </span>
                  <span>{Math.round(distance)}m</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Host Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/10 backdrop-blur-sm z-35"
              onClick={() => setSelectedSpace(null)}
            />
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
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{Math.round(calculateDistance(userLocation, selectedSpace.center))}m</span>
                  </div>
                </div>

                {/* Participant Avatars */}
                <div className="flex -space-x-2 mb-5">
                  {selectedSpace.participants.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-lg"
                    >
                      {p.isGhost ? '👻' : p.avatar}
                    </div>
                  ))}
                  {selectedSpace.participants.length > 6 && (
                    <div className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-sm font-medium">
                      +{selectedSpace.participants.length - 6}
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
          </>
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
