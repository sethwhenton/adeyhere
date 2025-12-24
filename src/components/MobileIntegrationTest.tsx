import { useEffect } from 'react';
import { useCapacitorInit, useGeolocation, useHaptics, useNativePlatform } from '@/hooks/useCapacitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, MapPin, Vibrate, Bell, CheckCircle2 } from 'lucide-react';

/**
 * Mobile Integration Test Component
 * Use this to verify that Capacitor native features are working
 */
export function MobileIntegrationTest() {
    const { isNative, platform } = useNativePlatform();
    const { impact, notification } = useHaptics();
    const { position, requestPermission, getPosition, permissionGranted } = useGeolocation();

    // Initialize Capacitor when component mounts
    const { initialized, error } = useCapacitorInit({
        enableGeolocation: true,
        enablePushNotifications: true,
        onPushToken: (token) => {
            console.log('Push token received:', token);
            // TODO: Send this token to your backend
        },
        onAppStateChange: (isActive) => {
            console.log('App state changed:', isActive ? 'foreground' : 'background');
        }
    });

    useEffect(() => {
        if (initialized && isNative) {
            console.log('✅ Capacitor initialized successfully on', platform);
        }
    }, [initialized, isNative, platform]);

    return (
        <div className="container mx-auto p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Mobile Integration Status
                    </CardTitle>
                    <CardDescription>
                        Test native mobile features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Platform Info */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Platform:</span>
                        <Badge variant={isNative ? 'default' : 'secondary'}>
                            {platform}
                        </Badge>
                        {isNative && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                    </div>

                    {/* Initialization Status */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Capacitor:</span>
                        <Badge variant={initialized ? 'default' : 'destructive'}>
                            {initialized ? 'Initialized' : 'Not Initialized'}
                        </Badge>
                        {error && (
                            <span className="text-sm text-destructive">
                                Error: {error.message}
                            </span>
                        )}
                    </div>

                    {!isNative && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ You're running on web. Native features are disabled.
                                Build and run on a mobile device to test native features.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Geolocation Test */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Geolocation Test
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            onClick={requestPermission}
                            variant="outline"
                            disabled={!isNative}
                        >
                            Request Permission
                        </Button>
                        <Button
                            onClick={getPosition}
                            disabled={!isNative || !permissionGranted}
                        >
                            Get Position
                        </Button>
                    </div>

                    {permissionGranted && (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Permission Granted
                        </Badge>
                    )}

                    {position && (
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="font-medium">Latitude:</span>
                                    <p className="font-mono">{position.coords.latitude.toFixed(6)}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Longitude:</span>
                                    <p className="font-mono">{position.coords.longitude.toFixed(6)}</p>
                                </div>
                                <div>
                                    <span className="font-medium">Accuracy:</span>
                                    <p className="font-mono">{position.coords.accuracy.toFixed(2)}m</p>
                                </div>
                                <div>
                                    <span className="font-medium">Altitude:</span>
                                    <p className="font-mono">
                                        {position.coords.altitude?.toFixed(2) ?? 'N/A'}m
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Timestamp: {new Date(position.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Haptics Test */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Vibrate className="w-5 h-5" />
                        Haptics Test
                    </CardTitle>
                    <CardDescription>
                        Test vibration feedback (device only)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => impact('light')}
                            variant="outline"
                            disabled={!isNative}
                        >
                            Light
                        </Button>
                        <Button
                            onClick={() => impact('medium')}
                            variant="outline"
                            disabled={!isNative}
                        >
                            Medium
                        </Button>
                        <Button
                            onClick={() => impact('heavy')}
                            variant="outline"
                            disabled={!isNative}
                        >
                            Heavy
                        </Button>
                        <Button
                            onClick={() => notification('success')}
                            variant="outline"
                            disabled={!isNative}
                        >
                            Success
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Push Notifications Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Push Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Push notifications are initialized automatically. Check the console for the device token.
                        To send push notifications, you'll need to set up Firebase Cloud Messaging (FCM).
                    </p>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle>📱 How to Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>
                            <strong>Build the app:</strong> Run <code className="px-1 py-0.5 bg-muted rounded">npm run build</code>
                        </li>
                        <li>
                            <strong>Sync to Android:</strong> Run <code className="px-1 py-0.5 bg-muted rounded">npm run mobile:sync</code>
                        </li>
                        <li>
                            <strong>Open Android Studio:</strong> Run <code className="px-1 py-0.5 bg-muted rounded">npm run mobile:android</code>
                        </li>
                        <li>
                            <strong>Connect your device</strong> via USB with debugging enabled
                        </li>
                        <li>
                            <strong>Click Run (▶️)</strong> in Android Studio
                        </li>
                        <li>
                            <strong>Test the features</strong> on your device!
                        </li>
                    </ol>
                    <p className="text-muted-foreground mt-4">
                        See <code>MOBILE_SETUP.md</code> for detailed instructions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
