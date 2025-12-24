import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
// Don't import from react-leaflet anymore
import { MapPin, Plus, Users, Clock, ChevronRight, Locate, Calendar, Info, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/lib/geo';
import { CreateSpaceModal } from './CreateSpaceModal';
import { ManageSpacesModal } from './ManageSpacesModal';
import { Space } from '@/types';
import { useSpaces, useJoinSpace } from '@/integrations/supabase/hooks';
import { useRealtimeSpaces } from '@/integrations/supabase/realtime';
import { useGeofencing } from '@/hooks/useGeofencing';
import { GeofenceAlert } from './GeofenceAlert';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';
import { formatDistanceToNow } from 'date-fns';

// Note: leaflet CSS is imported in main.tsx

export function MapView() {
  const { location } = useGeolocation();
  const { currentUser, setActiveSpace, activeSpace } = useAppStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [geofenceAlert, setGeofenceAlert] = useState<{ id: string; name: string } | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  // Refs for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const spaceMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const radiusCirclesRef = useRef<Map<string, L.Circle>>(new Map());

  // Default to San Francisco if no location yet
  const userLocation = currentUser?.location || location || { lat: 37.7749, lng: -122.4194 };

  // Queries
  const { data: spacesData, isLoading: isLoadingSpaces } = useSpaces(userLocation.lat, userLocation.lng);
  const joinMutation = useJoinSpace();
  useRealtimeSpaces();

  // Find nearby spaces (Memoized to prevent infinite loops)
  const nearbySpaces = useMemo(() => (spacesData || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    hostId: s.host_id,
    hostName: s.host?.display_name || 'Unknown',
    hostAvatar: s.host?.avatar || '😊',
    center: { lat: s.center_lat, lng: s.center_lng },
    radius: s.radius,
    createdAt: new Date(s.created_at),
    expiresAt: new Date(s.expires_at),
    participantCount: s.participants?.[0]?.count || 0,
    description: s.description || '',
  })), [spacesData]);

  // Filter spaces hosted by current user
  const userHostedSpaces = useMemo(() =>
    nearbySpaces.filter((space: any) => currentUser && space.hostId === currentUser.id),
    [nearbySpaces, currentUser]);

  // Handle space click - if inside radius, go to radar; otherwise show popup
  const handleSpaceClick = (space: any) => {
    const distance = calculateDistance(userLocation, space.center);
    if (distance <= space.radius) {
      // User is inside the space perimeter - go directly to radar
      setActiveSpace({
        id: space.id,
        name: space.name,
        hostId: space.hostId,
        hostName: space.hostName,
        center: space.center,
        radius: space.radius,
        createdAt: space.createdAt,
        expiresAt: space.expiresAt,
        participants: []
      });
    } else {
      // User is outside - show detailed popup
      setSelectedSpace(space);
    }
  };

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
          .on('click', () => handleSpaceClick(space));

        spaceMarkersRef.current.set(space.id, marker);
      }

      // Add/Update radius circles
      if (radiusCirclesRef.current.has(space.id)) {
        const circle = radiusCirclesRef.current.get(space.id)!;
        circle.setLatLng([space.center.lat, space.center.lng]);
        circle.setRadius(space.radius);
      } else {
        const circle = L.circle([space.center.lat, space.center.lng], {
          radius: space.radius,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 10',
        }).addTo(map);
        radiusCirclesRef.current.set(space.id, circle);
      }
    });

    // Remove old radius circles not in current data
    radiusCirclesRef.current.forEach((circle, id) => {
      if (!currentIds.has(id)) {
        circle.remove();
        radiusCirclesRef.current.delete(id);
      }
    });
  }, [nearbySpaces, selectedSpace]);


  // Memoize spaces for geofencing to prevent infinite loops
  const geofencingSpaces = useMemo(() => nearbySpaces.map(s => ({
    id: s.id,
    name: s.name,
    center: s.center,
    radius: s.radius,
  })), [nearbySpaces]);

  // Geofencing: Track entry/exit events
  useGeofencing({
    spaces: geofencingSpaces,
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

      {/* Host/Manage Button - Hidden when modal is open OR space is selected */}
      {!showCreateModal && !showManageModal && !selectedSpace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-28 inset-x-0 flex justify-center z-[400] pointer-events-none"
        >
          {activeSpace ? (
            <Button
              onClick={() => setActiveSpace(activeSpace)}
              className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-glow hover:shadow-soft transition-all pointer-events-auto"
            >
              <MapPin className="w-6 h-6 mr-2 stroke-[3]" />
              View Space
            </Button>
          ) : userHostedSpaces.length > 0 ? (
            <Button
              onClick={() => setShowManageModal(true)}
              className="h-14 px-8 rounded-2xl gradient-space text-primary-foreground font-bold text-lg shadow-glow hover:shadow-soft transition-all pointer-events-auto"
            >
              <Layers className="w-6 h-6 mr-2 stroke-[3]" />
              Manage Spaces
            </Button>
          ) : (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-14 px-8 rounded-2xl gradient-space text-primary-foreground font-bold text-lg shadow-glow hover:shadow-soft transition-all pointer-events-auto"
            >
              <Plus className="w-6 h-6 mr-2 stroke-[3]" />
              Host a Space
            </Button>
          )}
        </motion.div>
      )}

      {/* Space Detail Card (for spaces outside perimeter) */}
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
                {/* Header with Host Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-space flex items-center justify-center text-2xl">
                      {selectedSpace.hostAvatar || '😊'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-0.5">
                        {selectedSpace.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Hosted by {selectedSpace.hostName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSpace(null)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Description (if available) */}
                {selectedSpace.description && (
                  <div className="mb-4 p-3 bg-secondary/50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{selectedSpace.description}</p>
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                    <Users className="w-4 h-4" />
                    <span>{selectedSpace.participantCount} people</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.max(0, Math.round(
                        (selectedSpace.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
                      ))}h left
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                    <MapPin className="w-4 h-4" />
                    <span>{Math.round(calculateDistance(userLocation, selectedSpace.center))}m away</span>
                  </div>
                </div>

                {/* Created time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created {formatDistanceToNow(selectedSpace.createdAt, { addSuffix: true })}</span>
                </div>

                {/* Distance Warning */}
                {calculateDistance(userLocation, selectedSpace.center) > selectedSpace.radius && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                      📍 You're {Math.round(calculateDistance(userLocation, selectedSpace.center) - selectedSpace.radius)}m away from this space's perimeter
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  disabled={isJoining || calculateDistance(userLocation, selectedSpace.center) > selectedSpace.radius}
                  onClick={async () => {
                    if (!currentUser) return;
                    setIsJoining(true);
                    try {
                      await joinMutation.mutateAsync({
                        spaceId: selectedSpace.id,
                        userId: currentUser.id
                      });
                      setActiveSpace({
                        id: selectedSpace.id,
                        name: selectedSpace.name,
                        hostId: selectedSpace.hostId,
                        hostName: selectedSpace.hostName,
                        center: selectedSpace.center,
                        radius: selectedSpace.radius,
                        createdAt: selectedSpace.createdAt,
                        expiresAt: selectedSpace.expiresAt,
                        participants: []
                      });
                      setSelectedSpace(null);
                    } catch (e) {
                      toast.error("Failed to join space");
                    } finally {
                      setIsJoining(false);
                    }
                  }}
                  className={`w-full h-12 rounded-xl font-semibold shadow-soft ${calculateDistance(userLocation, selectedSpace.center) > selectedSpace.radius
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'gradient-space text-primary-foreground'
                    }`}
                >
                  {isJoining ? (
                    <Loader2 className="animate-spin" />
                  ) : calculateDistance(userLocation, selectedSpace.center) > selectedSpace.radius ? (
                    'Get Closer to Join'
                  ) : (
                    <>Join Space <ChevronRight className="w-5 h-5 ml-2" /></>
                  )}
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

      {/* Geofence Entry Alert - Only verify if space still exists */}
      {geofenceAlert && !dismissedAlerts.has(geofenceAlert.id) && nearbySpaces.some(s => s.id === geofenceAlert.id) && (
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
                setActiveSpace({
                  id: space.id,
                  name: space.name,
                  hostId: space.hostId,
                  hostName: space.hostName,
                  center: space.center,
                  radius: space.radius,
                  createdAt: space.createdAt,
                  expiresAt: space.expiresAt,
                  participants: []
                });
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

      {/* Manage Spaces Modal */}
      <ManageSpacesModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        spaces={userHostedSpaces}
        onSpaceDeleted={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
