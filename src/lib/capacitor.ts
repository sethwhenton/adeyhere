import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Capacitor Native Features Utility
 * Handles all native mobile functionality for Adey Here
 */

export const isNativePlatform = () => {
    return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
    return Capacitor.getPlatform(); // 'ios', 'android', or 'web'
};

// ==================== GEOLOCATION ====================

/**
 * Request location permissions
 */
export const requestLocationPermissions = async () => {
    try {
        const permission = await Geolocation.requestPermissions();
        return permission;
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        throw error;
    }
};

/**
 * Check current location permission status
 */
export const checkLocationPermissions = async () => {
    try {
        const permission = await Geolocation.checkPermissions();
        return permission;
    } catch (error) {
        console.error('Error checking location permissions:', error);
        throw error;
    }
};

/**
 * Get current position
 */
export const getCurrentPosition = async (): Promise<Position> => {
    try {
        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
        return position;
    } catch (error) {
        console.error('Error getting current position:', error);
        throw error;
    }
};

/**
 * Watch position changes (for real-time tracking)
 */
export const watchPosition = (
    callback: (position: Position | null, error?: any) => void
) => {
    const watchId = Geolocation.watchPosition(
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        },
        (position, error) => {
            callback(position, error);
        }
    );

    return watchId;
};

/**
 * Clear position watch
 */
export const clearWatch = async (watchId: string) => {
    await Geolocation.clearWatch({ id: watchId });
};

// ==================== PUSH NOTIFICATIONS ====================

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async () => {
    if (!isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
    }

    try {
        // Request permission
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            throw new Error('User denied permissions!');
        }

        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        return permStatus;
    } catch (error) {
        console.error('Error initializing push notifications:', error);
        throw error;
    }
};

/**
 * Setup push notification listeners
 */
export const setupPushNotificationListeners = (callbacks: {
    onRegistration?: (token: string) => void;
    onRegistrationError?: (error: any) => void;
    onNotificationReceived?: (notification: any) => void;
    onNotificationActionPerformed?: (notification: any) => void;
}) => {
    // On successful registration
    PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        callbacks.onRegistration?.(token.value);
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        callbacks.onRegistrationError?.(error);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        callbacks.onNotificationReceived?.(notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification);
        callbacks.onNotificationActionPerformed?.(notification);
    });
};

/**
 * Send a local notification (for testing or immediate feedback)
 */
export const sendLocalNotification = async (title: string, body: string) => {
    if (!isNativePlatform()) return;

    // Note: Local notifications require @capacitor/local-notifications plugin
    // For now, this is a placeholder
    console.log('Local notification:', { title, body });
};

// ==================== HAPTICS ====================

/**
 * Trigger haptic feedback
 */
export const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNativePlatform()) return;

    try {
        const impactStyle = {
            light: ImpactStyle.Light,
            medium: ImpactStyle.Medium,
            heavy: ImpactStyle.Heavy
        }[style];

        await Haptics.impact({ style: impactStyle });
    } catch (error) {
        console.error('Error triggering haptic:', error);
    }
};

/**
 * Trigger notification haptic (for important events)
 */
export const triggerNotificationHaptic = async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNativePlatform()) return;

    try {
        await Haptics.notification({ type: type.toUpperCase() as any });
    } catch (error) {
        console.error('Error triggering notification haptic:', error);
    }
};

// ==================== APP STATE ====================

/**
 * Setup app state listeners (background/foreground)
 */
export const setupAppStateListeners = (callbacks: {
    onAppStateChange?: (isActive: boolean) => void;
    onBackButton?: () => void;
    onUrlOpen?: (url: string) => void;
}) => {
    if (!isNativePlatform()) return;

    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        callbacks.onAppStateChange?.(isActive);
    });

    // Listen for back button (Android)
    App.addListener('backButton', () => {
        console.log('Back button pressed');
        callbacks.onBackButton?.();
    });

    // Listen for URL opens (deep linking)
    App.addListener('appUrlOpen', (data) => {
        console.log('App opened with URL:', data.url);
        callbacks.onUrlOpen?.(data.url);
    });
};

// ==================== STATUS BAR ====================

/**
 * Set status bar style
 */
export const setStatusBarStyle = async (isDark: boolean) => {
    if (!isNativePlatform()) return;

    try {
        await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    } catch (error) {
        console.error('Error setting status bar style:', error);
    }
};

/**
 * Set status bar background color
 */
export const setStatusBarColor = async (color: string) => {
    if (!isNativePlatform() || getPlatform() !== 'android') return;

    try {
        await StatusBar.setBackgroundColor({ color });
    } catch (error) {
        console.error('Error setting status bar color:', error);
    }
};

// ==================== UTILITY ====================

/**
 * Initialize all Capacitor features
 */
export const initializeCapacitor = async (options: {
    enablePushNotifications?: boolean;
    enableGeolocation?: boolean;
    onPushToken?: (token: string) => void;
    onAppStateChange?: (isActive: boolean) => void;
} = {}) => {
    if (!isNativePlatform()) {
        console.log('Running on web platform, native features disabled');
        return;
    }

    console.log('Initializing Capacitor on platform:', getPlatform());

    // Setup status bar
    await setStatusBarStyle(true);
    await setStatusBarColor('#0F172A');

    // Setup app state listeners
    setupAppStateListeners({
        onAppStateChange: options.onAppStateChange
    });

    // Initialize geolocation if requested
    if (options.enableGeolocation) {
        try {
            const permission = await requestLocationPermissions();
            console.log('Location permission:', permission);
        } catch (error) {
            console.error('Failed to get location permission:', error);
        }
    }

    // Initialize push notifications if requested
    if (options.enablePushNotifications) {
        try {
            await initializePushNotifications();
            setupPushNotificationListeners({
                onRegistration: options.onPushToken
            });
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
        }
    }

    console.log('Capacitor initialization complete');
};
