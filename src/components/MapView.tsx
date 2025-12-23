import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
// Don't import from react-leaflet anymore
import { MapPin, Plus, Users, Clock, ChevronRight, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/geo';
import { CreateSpaceModal } from './CreateSpaceModal';
import { Space } from '@/types';
import { useSpaces, useJoinSpace } from '@/integrations/supabase/hooks';
import { useRealtimeSpaces } from '@/integrations/supabase/realtime';
import { useGeofencing } from '@/hooks/useGeofencing';
import { GeofenceAlert } from './GeofenceAlert';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';

// Note: leaflet CSS is imported in main.tsx

export function MapView() {
  const { location } = useGeolocation();
  const { currentUser, setActiveSpace, activeSpace } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [geofenceAlert, setGeofenceAlert] = useState<{ id: string; name: string } | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Refs for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const spaceMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Default to San Francisco if no location yet
  const userLocation = currentUser?.location || location || { lat: 37.7749, lng: -122.4194 };

  // Queries
  const { data: spacesData, isLoading: isLoadingSpaces } = useSpaces(userLocation.lat, userLocation.lng);
  const joinMutation = useJoinSpace();
  useRealtimeSpaces();

  // Find nearby spaces (Mapped safely)
  const nearbySpaces = (spacesData || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    hostId: s.host_id,
    hostName: s.host?.display_name || 'Unknown',
    center: { lat: s.center_lat, lng: s.center_lng },
    radius: s.radius,
    expiresAt: new Date(s.expires_at),
    participantCount: s.participants?.[0]?.count || 0,
  }));

  // --- Initialize Map ---
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([userLocation.lat, userLocation.lng], 15);

    // Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // Initialize once
  }, []);

  // --- Update User Location Marker & View ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Create custom user icon
    const userIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-glow"></div>
          </div>
        `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    }

    // Optionally fly to user if they moved significantly? 
    // For now let's just pan if it's the first load or explicit user action.
    // We'll trust user to pan otherwise.
  }, [userLocation.lat, userLocation.lng]);

  // --- Update Space Markers ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers not in current data
    const currentIds = new Set(nearbySpaces.map(s => s.id));
    spaceMarkersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        spaceMarkersRef.current.delete(id);
      }
    });

    // Add/Update markers
    nearbySpaces.forEach(space => {
      const isSelected = selectedSpace?.id === space.id;
      // Icon Construction
      const iconHtml = `
            <div class="relative flex items-center justify-center transform transition-transform ${isSelected ? 'scale-125' : 'scale-100'}">
              <div class="absolute w-12 h-12 bg-space/30 rounded-full animate-pulse"></div>
              <div class="relative w-8 h-8 rounded-full bg-space border-2 border-white shadow-xl flex items-center justify-center text-secondary font-bold text-xs backdrop-blur-md">
                ${space.participantCount}
              </div>
              <div class="absolute -bottom-6 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                ${space.name}
              </div>
            </div>
        `;

      const spaceIcon = L.divIcon({
        className: 'bg-transparent',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (spaceMarkersRef.current.has(space.id)) {
        const marker = spaceMarkersRef.current.get(space.id)!;
        marker.setLatLng([space.center.lat, space.center.lng]);
        marker.setIcon(spaceIcon);
        // Update click handler? Leaflet markers don't easily update handlers, but we can wrapping the click logic
        // or just reconstructing. For simplicity let's assume robust enough.
      } else {
        const marker = L.marker([space.center.lat, space.center.lng], { icon: spaceIcon })
          .addTo(map)
          .on('click', () => setSelectedSpace(space));

        spaceMarkersRef.current.set(space.id, marker);
      }
    });
  }, [nearbySpaces, selectedSpace]);


  // Geofencing: Track entry/exit events
  useGeofencing({
    spaces: nearbySpaces.map(s => ({
      id: s.id,
      name: s.name,
      center: s.center,
      radius: s.radius,
    })),
    userLocation,
    onEnter: async (spaceId, spaceName) => {
      // Show alert if not already dismissed and not currently in a space
      if (!dismissedAlerts.has(spaceId) && !activeSpace) {
        setGeofenceAlert({ id: spaceId, name: spaceName });
      }

      // Record visit in past_events
      if (currentUser?.id) {
        try {
          await supabase.from('past_events').upsert({
            user_id: currentUser.id,
            space_id: spaceId,
            space_name: spaceName,
            visited_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to record visit:', error);
        }
      }
    },
    onExit: async (spaceId, spaceName) => {
      toast(`You've left "${spaceName}"`, {
        description: 'Visit again anytime!',
      });

      // Update left_at timestamp
      if (currentUser?.id) {
        try {
          await supabase
            .from('past_events')
            .update({ left_at: new Date().toISOString() })
            .eq('user_id', currentUser.id)
            .eq('space_id', spaceId);
        } catch (error) {
          console.error('Failed to update exit time:', error);
        }
      }

      // Auto-exit from active space if user is beyond boundary
      if (activeSpace?.id === spaceId) {
        setActiveSpace(null);
      }
    },
  });

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Map Container (Raw Leaflet) */}
      <div className="absolute inset-0 z-0" ref={mapContainerRef} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-[400] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-lg rounded-2xl p-4 shadow-card pointer-events-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center text-xl">
              {currentUser?.avatar || '😊'}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                Hey, {currentUser?.displayName}!
              </h2>
              <p className="text-sm text-muted-foreground">
                {nearbySpaces.length} active spaces
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="outline"
            className="w-12 h-12 rounded-full bg-white border-2 border-blue-500 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-blue-50 hover:border-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] transition-all transform hover:scale-105"
            onClick={handleRecenter}
          >
            <Locate className="w-6 h-6 stroke-[3]" />
          </Button>
        </motion.div>
      </div>

      {/* Host Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-24 inset-x-0 flex justify-center z-[400] pointer-events-none"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-14 px-8 rounded-2xl gradient-space text-primary-foreground font-bold text-lg shadow-glow hover:shadow-soft transition-all pointer-events-auto"
        >
          <Plus className="w-6 h-6 mr-2 stroke-[3]" />
          Host a Space
        </Button>
      </motion.div>

      {/* Join Space Card */}
      <AnimatePresence mode="wait">
        {selectedSpace && (
          <motion.div
            key="space-modal-container"
            className="absolute inset-0 z-[450]"
          >
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setSelectedSpace(null)}
            />

            {/* Card */}
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 p-4"
            >
              <div className="bg-card rounded-3xl p-5 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
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
                    <span>{selectedSpace.participantCount} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.max(0, Math.round(
                        (selectedSpace.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
                      ))}h left
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{Math.round(calculateDistance(userLocation, selectedSpace.center))}m</span>
                  </div>
                </div>

                <Button
                  disabled={isJoining}
                  onClick={async () => {
                    if (!currentUser) return;
                    setIsJoining(true);
                    try {
                      await joinMutation.mutateAsync({
                        spaceId: selectedSpace.id,
                        userId: currentUser.id
                      });
                      setActiveSpace(selectedSpace);
                      setSelectedSpace(null);
                    } catch (e) {
                      toast.error("Failed to join space");
                    } finally {
                      setIsJoining(false);
                    }
                  }}
                  className="w-full h-12 rounded-xl gradient-space text-primary-foreground font-semibold shadow-soft"
                >
                  {isJoining ? <Loader2 className="animate-spin" /> : <>Join Space <ChevronRight className="w-5 h-5 ml-2" /></>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Geofence Entry Alert */}
      {geofenceAlert && !dismissedAlerts.has(geofenceAlert.id) && (
        <GeofenceAlert
          spaceId={geofenceAlert.id}
          spaceName={geofenceAlert.name}
          spaceCenter={nearbySpaces.find(s => s.id === geofenceAlert.id)?.center || userLocation}
          participantCount={nearbySpaces.find(s => s.id === geofenceAlert.id)?.participantCount || 0}
          expiresAt={nearbySpaces.find(s => s.id === geofenceAlert.id)?.expiresAt}
          userLocation={userLocation}
          onJoin={async () => {
            if (!currentUser) return;
            setIsJoining(true);
            try {
              const space = nearbySpaces.find(s => s.id === geofenceAlert.id);
              if (space) {
                await joinMutation.mutateAsync({
                  spaceId: space.id,
                  userId: currentUser.id,
                });
                setActiveSpace(space);
              }
              setGeofenceAlert(null);
            } catch (e) {
              toast.error('Failed to join space');
            } finally {
              setIsJoining(false);
            }
          }}
          onDismiss={() => {
            setDismissedAlerts(prev => new Set(prev).add(geofenceAlert.id));
            setGeofenceAlert(null);
          }}
        />
      )}
    </div>
  );
}
