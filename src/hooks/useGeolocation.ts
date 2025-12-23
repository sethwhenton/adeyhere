import { useState, useEffect } from 'react';
import { Location } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

// Default location (San Francisco) for demo purposes
const DEFAULT_LOCATION: Location = {
  lat: 37.7749,
  lng: -122.4194,
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });
  const { currentUser, updateUserLocation } = useAppStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: DEFAULT_LOCATION,
        error: 'Geolocation not supported',
        loading: false,
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setState({
          location: newLocation,
          error: null,
          loading: false,
        });

        // Update local store
        updateUserLocation(newLocation);

        // Update database every position change (with debouncing in production)
        if (currentUser?.id) {
          try {
            await supabase
              .from('profiles')
              .update({ location: newLocation })
              .eq('id', currentUser.id);
          } catch (error) {
            console.error('Failed to update location in database:', error);
          }
        }
      },
      (error) => {
        // Use default location if permission denied or error
        setState({
          location: DEFAULT_LOCATION,
          error: error.message,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentUser?.id, updateUserLocation]);

  return state;
}
