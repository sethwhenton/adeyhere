# 🚀 Quick Reference - Mobile Testing

## ✅ Setup Complete!

Your app is now mobile-ready with Capacitor. Here's what to do next:

---

## 📱 Test on Your Android Device NOW

### 1️⃣ Connect Your Phone
- Enable USB Debugging (Settings → Developer Options)
- Connect via USB cable
- Allow USB debugging when prompted

### 2️⃣ Run These Commands

```bash
# Open Android Studio with your project
npm run mobile:android
```

### 3️⃣ In Android Studio
- Wait for Gradle sync (1-2 minutes first time)
- Select your device from dropdown
- Click green Run button (▶️)
- App installs and launches! 🎉

---

## 🧪 Test Native Features

Add this to your app to test features:

```typescript
import { MobileIntegrationTest } from '@/components/MobileIntegrationTest';

// Add to your routes or main component
<MobileIntegrationTest />
```

This component lets you test:
- ✅ Geolocation
- ✅ Haptics (vibration)
- ✅ Push notifications
- ✅ Platform detection

---

## 🔄 Quick Commands

```bash
# Build web app
npm run build

# Sync to mobile
npx cap sync android

# Open Android Studio
npm run mobile:android

# All-in-one (build + sync + open)
npm run mobile:android
```

---

## 🎯 Integrate into Your Existing App

### Initialize Capacitor in App.tsx

```typescript
import { useCapacitorInit } from '@/hooks/useCapacitor';

function App() {
  // Initialize once at app root
  useCapacitorInit({
    enableGeolocation: true,
    enablePushNotifications: true,
    onPushToken: (token) => {
      console.log('Push token:', token);
      // Send to your backend
    }
  });

  return (
    // Your app content
  );
}
```

### Use Geolocation in MapView

```typescript
import { useGeolocation, useHaptics } from '@/hooks/useCapacitor';

function MapView() {
  const { position, requestPermission } = useGeolocation({ watch: true });
  const { impact } = useHaptics();

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (position) {
      // Update map with user's location
      console.log('User at:', position.coords.latitude, position.coords.longitude);
    }
  }, [position]);

  const handleJoinSpace = () => {
    impact('medium'); // Haptic feedback
    // Join space logic
  };

  return (
    // Your map component
  );
}
```

### Add Haptics to Interactions

```typescript
import { useHaptics } from '@/hooks/useCapacitor';

function RadarView() {
  const { impact, notification } = useHaptics();

  const handlePounce = () => {
    impact('light'); // Subtle feedback
    // Send pounce
  };

  const handleJoin = () => {
    notification('success'); // Success haptic
    // Join logic
  };

  return (
    // Your radar view
  );
}
```

---

## 📋 Files Created

- ✅ `src/lib/capacitor.ts` - Native utilities
- ✅ `src/hooks/useCapacitor.ts` - React hooks
- ✅ `src/components/MobileIntegrationTest.tsx` - Test component
- ✅ `capacitor.config.ts` - Capacitor config
- ✅ `android/` - Android project
- ✅ `MOBILE_SETUP.md` - Full documentation
- ✅ `.agent/workflows/mobile-testing.md` - Workflow guide

---

## 🎨 App Icons & Splash Screen (TODO)

1. Create app icon (1024x1024 PNG)
2. Use [Capacitor Asset Generator](https://github.com/capacitor-community/capacitor-assets)
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate
   ```

---

## 🔐 Permissions Configured

✅ Location (foreground & background)
✅ Push notifications
✅ Internet access
✅ Vibration (haptics)
✅ Network state

---

## 🐛 Troubleshooting

**App won't install?**
- Check USB debugging is enabled
- Try `adb devices` to see if device is connected

**Gradle errors?**
- File → Invalidate Caches → Restart in Android Studio

**Location not working?**
- Grant permission in device settings
- Check GPS is enabled

**White screen?**
- Check browser console in Android Studio
- Verify build completed: `npm run build`

---

## 📚 Documentation

- Full guide: `MOBILE_SETUP.md`
- Workflow: `.agent/workflows/mobile-testing.md`
- Capacitor docs: https://capacitorjs.com/docs

---

## 🎯 Next Steps

1. ✅ Test on device (do this now!)
2. ⬜ Integrate geolocation into MapView
3. ⬜ Add haptics to all interactions
4. ⬜ Set up Firebase for push notifications
5. ⬜ Create app icons
6. ⬜ Test background geolocation
7. ⬜ Prepare for Play Store

---

**Ready to test? Run:** `npm run mobile:android` 🚀
