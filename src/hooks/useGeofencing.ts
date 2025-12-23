import { useEffect, useState, useRef } from 'react';
import { calculateDistance } from '@/lib/geo';
import { Location } from '@/types';

interface GeofenceEvent {
    spaceId: string;
    spaceName: string;
    type: 'enter' | 'exit';
}

interface UseGeofencingOptions {
    spaces: Array<{
        id: string;
        name: string;
        center: Location;
        radius: number;
    }>;
    userLocation: Location | null;
    onEnter?: (spaceId: string, spaceName: string) => void;
    onExit?: (spaceId: string, spaceName: string) => void;
}

/**
 * Hook to monitor geofence entry/exit events
 * Returns spaces the user is currently inside
 */
export function useGeofencing({
    spaces,
    userLocation,
    onEnter,
    onExit,
}: UseGeofencingOptions) {
    const [insideSpaces, setInsideSpaces] = useState<Set<string>>(new Set());
    const previousInsideSpaces = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!userLocation) return;

        const currentlyInside = new Set<string>();

        spaces.forEach((space) => {
            const distance = calculateDistance(userLocation, space.center);
            const entryThreshold = space.radius + 300; // 300m buffer for entry detection
            const exitThreshold = space.radius + 50; // 50m buffer before exit

            // Check if user is within entry range
            if (distance <= entryThreshold) {
                currentlyInside.add(space.id);

                // Trigger entry event if just entered
                if (!previousInsideSpaces.current.has(space.id)) {
                    onEnter?.(space.id, space.name);

                    // Haptic feedback if supported
                    if ('vibrate' in navigator) {
                        navigator.vibrate([100, 50, 100]);
                    }
                }
            }

            // Check if user has exited (beyond exit threshold)
            if (distance > exitThreshold && previousInsideSpaces.current.has(space.id)) {
                onExit?.(space.id, space.name);

                // Gentle haptic for exit
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            }
        });

        setInsideSpaces(currentlyInside);
        previousInsideSpaces.current = currentlyInside;
    }, [userLocation, spaces, onEnter, onExit]);

    return {
        insideSpaces: Array.from(insideSpaces),
        isInsideAny: insideSpaces.size > 0,
    };
}
