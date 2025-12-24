import { useEffect, useState, useCallback } from 'react';
import { Position } from '@capacitor/geolocation';
import {
    isNativePlatform,
    getPlatform,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    requestLocationPermissions,
    triggerHaptic,
    triggerNotificationHaptic,
    initializeCapacitor,
} from '@/lib/capacitor';

/**
 * Hook to check if app is running on native platform
 */
export const useNativePlatform = () => {
    const [isNative, setIsNative] = useState(false);
    const [platform, setPlatform] = useState<string>('web');

    useEffect(() => {
        setIsNative(isNativePlatform());
        setPlatform(getPlatform());
    }, []);

    return { isNative, platform };
};

/**
 * Hook for geolocation tracking
 */
export const useGeolocation = (options: {
    watch?: boolean;
    enableHighAccuracy?: boolean;
} = {}) => {
    const [position, setPosition] = useState<Position | null>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Request permissions
    const requestPermission = useCallback(async () => {
        try {
            const permission = await requestLocationPermissions();
            const granted = permission.location === 'granted';
            setPermissionGranted(granted);
            return granted;
        } catch (err) {
            setError(err);
            return false;
        }
    }, []);

    // Get current position once
    const getPosition = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const pos = await getCurrentPosition();
            setPosition(pos);
            return pos;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Watch position continuously
    useEffect(() => {
        if (!options.watch) return;

        let watchId: string | null = null;

        const startWatching = async () => {
            try {
                watchId = await watchPosition((pos, err) => {
                    if (err) {
                        setError(err);
                    } else {
                        setPosition(pos);
                        setError(null);
                    }
                });
            } catch (err) {
                setError(err);
            }
        };

        startWatching();

        return () => {
            if (watchId) {
                clearWatch(watchId);
            }
        };
    }, [options.watch]);

    return {
        position,
        error,
        loading,
        permissionGranted,
        requestPermission,
        getPosition,
    };
};

/**
 * Hook for haptic feedback
 */
export const useHaptics = () => {
    const { isNative } = useNativePlatform();

    const impact = useCallback(
        async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
            if (!isNative) return;
            await triggerHaptic(style);
        },
        [isNative]
    );

    const notification = useCallback(
        async (type: 'success' | 'warning' | 'error' = 'success') => {
            if (!isNative) return;
            await triggerNotificationHaptic(type);
        },
        [isNative]
    );

    return { impact, notification };
};

/**
 * Hook for app state (foreground/background)
 */
export const useAppState = (onStateChange?: (isActive: boolean) => void) => {
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isNativePlatform()) return;

        const { setupAppStateListeners } = require('@/lib/capacitor');

        setupAppStateListeners({
            onAppStateChange: (active: boolean) => {
                setIsActive(active);
                onStateChange?.(active);
            },
        });
    }, [onStateChange]);

    return { isActive };
};

/**
 * Hook to initialize Capacitor on app mount
 */
export const useCapacitorInit = (options: {
    enablePushNotifications?: boolean;
    enableGeolocation?: boolean;
    onPushToken?: (token: string) => void;
    onAppStateChange?: (isActive: boolean) => void;
} = {}) => {
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeCapacitor(options);
                setInitialized(true);
            } catch (err) {
                console.error('Failed to initialize Capacitor:', err);
                setError(err);
            }
        };

        init();
    }, []); // Only run once on mount

    return { initialized, error };
};
