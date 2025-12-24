---
description: Deploy and test the mobile app on Android device
---

# Mobile Testing Workflow

## Quick Start - Test on Android Device

### Prerequisites
1. Install Android Studio: https://developer.android.com/studio
2. Enable USB Debugging on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
3. Connect device via USB to computer

### Steps

// turbo-all

1. **Build the web app**
```bash
npm run build
```

2. **Sync to Android**
```bash
npx cap sync android
```

3. **Open in Android Studio**
```bash
npx cap open android
```

4. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select your device from dropdown (top toolbar)
   - Click green Run button (▶️)
   - App will install and launch on your device

### Quick Command (All-in-One)
```bash
npm run mobile:android
```

## Testing Native Features

### Add Test Component to Your App

In `src/App.tsx` or your main component:

```typescript
import { MobileIntegrationTest } from '@/components/MobileIntegrationTest';

// Add this route or component to test
<MobileIntegrationTest />
```

### Features to Test
- ✅ Geolocation (request permission, get position)
- ✅ Haptics (vibration feedback)
- ✅ Push notifications (check console for token)
- ✅ App state (background/foreground)

## Development with Live Reload

For faster iteration on device:

1. **Find your local IP:**
```bash
ipconfig
```
Look for IPv4 Address (e.g., 192.168.1.100)

2. **Update `capacitor.config.ts`:**
```typescript
server: {
  url: 'http://YOUR_IP:5173',
  cleartext: true
}
```

3. **Start dev server:**
```bash
npm run dev
```

4. **Sync and run:**
```bash
npm run mobile:sync
npx cap run android
```

5. **Changes now hot-reload on device! 🎉**

⚠️ **Remember:** Remove `server` config before production build!

## Troubleshooting

### "dist directory not found"
```bash
npm run build
```

### Gradle sync fails
- Update Android Studio
- File → Invalidate Caches → Restart

### App crashes
- Check Logcat in Android Studio
- Verify permissions in device settings

### Geolocation not working
- Grant location permission in device settings
- Test on physical device (not emulator)

## Next Steps

1. Integrate geolocation into MapView
2. Add haptic feedback to interactions
3. Set up Firebase for push notifications
4. Create app icons and splash screens
5. Prepare for Play Store submission

## Useful Commands

```bash
# Build and sync
npm run mobile:sync

# Open Android Studio
npm run mobile:android

# Run on connected device
npm run mobile:run:android

# Check Capacitor status
npx cap doctor

# Update Capacitor plugins
npm update @capacitor/*
```

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Geolocation API](https://capacitorjs.com/docs/apis/geolocation)
- [Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Full Setup Guide](./MOBILE_SETUP.md)
