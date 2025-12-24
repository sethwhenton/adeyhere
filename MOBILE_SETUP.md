# Mobile Setup Guide - Adey Here

## 🎉 Capacitor Integration Complete!

Your React web app has been successfully wrapped with **Capacitor** for mobile deployment. This enables native features like background geolocation and push notifications.

---

## 📱 What's Been Set Up

### 1. **Capacitor Core**
- ✅ Capacitor initialized with app ID: `com.adeyhere.app`
- ✅ Android platform added
- ✅ Build output configured to `dist/` directory

### 2. **Native Plugins Installed**
- ✅ `@capacitor/geolocation` - GPS tracking & background location
- ✅ `@capacitor/push-notifications` - Push notification support
- ✅ `@capacitor/haptics` - Vibration feedback
- ✅ `@capacitor/app` - App state management
- ✅ `@capacitor/status-bar` - Status bar customization

### 3. **Android Configuration**
- ✅ Permissions added to `AndroidManifest.xml`:
  - Location (foreground & background)
  - Push notifications
  - Internet & network state
  - Vibration for haptics

### 4. **Utility Files Created**
- ✅ `src/lib/capacitor.ts` - Native feature utilities
- ✅ `src/hooks/useCapacitor.ts` - React hooks for easy integration

### 5. **Build Scripts**
Added to `package.json`:
```json
"mobile:sync": "npm run build && npx cap sync"
"mobile:android": "npm run mobile:sync && npx cap open android"
"mobile:ios": "npm run mobile:sync && npx cap open ios"
"mobile:run:android": "npm run mobile:sync && npx cap run android"
"mobile:run:ios": "npm run mobile:sync && npx cap run ios"
```

---

## 🚀 Testing on Mobile Device

### Option 1: Test on Physical Android Device (Recommended)

#### Prerequisites:
1. **Android Studio** installed ([Download here](https://developer.android.com/studio))
2. **USB Debugging** enabled on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

#### Steps:
1. **Connect your Android device** via USB to your computer

2. **Build and sync the app:**
   ```bash
   npm run mobile:sync
   ```

3. **Open Android Studio:**
   ```bash
   npm run mobile:android
   ```
   OR manually:
   ```bash
   npx cap open android
   ```

4. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select your device from the device dropdown (top toolbar)
   - Click the green "Run" button (▶️)

5. **The app will install and launch on your device!**

### Option 2: Test on Android Emulator

1. **Open Android Studio** and create an emulator:
   - Tools → Device Manager → Create Device
   - Choose a device (e.g., Pixel 6)
   - Download a system image (Android 13+ recommended)
   - Finish setup

2. **Start the emulator** from Android Studio

3. **Run the app:**
   ```bash
   npm run mobile:run:android
   ```

---

## 🧪 Testing Native Features

### Test Geolocation

Add this to your app (e.g., in `App.tsx` or a test component):

```typescript
import { useGeolocation, useCapacitorInit } from '@/hooks/useCapacitor';

function TestGeolocation() {
  // Initialize Capacitor
  useCapacitorInit({
    enableGeolocation: true,
    enablePushNotifications: true
  });

  // Use geolocation
  const { position, requestPermission, getPosition } = useGeolocation();

  return (
    <div>
      <button onClick={requestPermission}>Request Location Permission</button>
      <button onClick={getPosition}>Get Current Position</button>
      {position && (
        <div>
          <p>Lat: {position.coords.latitude}</p>
          <p>Lng: {position.coords.longitude}</p>
          <p>Accuracy: {position.coords.accuracy}m</p>
        </div>
      )}
    </div>
  );
}
```

### Test Haptics

```typescript
import { useHaptics } from '@/hooks/useCapacitor';

function TestHaptics() {
  const { impact, notification } = useHaptics();

  return (
    <div>
      <button onClick={() => impact('light')}>Light Haptic</button>
      <button onClick={() => impact('medium')}>Medium Haptic</button>
      <button onClick={() => impact('heavy')}>Heavy Haptic</button>
      <button onClick={() => notification('success')}>Success Notification</button>
    </div>
  );
}
```

---

## 🔄 Development Workflow

### 1. **Web Development** (Fast iteration)
```bash
npm run dev
```
- Develop features in the browser
- Hot reload works normally
- Native features won't work (will gracefully degrade)

### 2. **Mobile Testing** (When you need to test native features)
```bash
npm run mobile:sync
```
- Builds the app
- Syncs to Android/iOS projects
- Open Android Studio to run on device

### 3. **Live Reload on Device** (Advanced)
For faster mobile development, you can use live reload:

1. Find your computer's local IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.100:5173',
     cleartext: true
   }
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Sync and run on device:
   ```bash
   npm run mobile:run:android
   ```

5. **The app will now reload when you save files!** 🎉

6. **Important:** Remove the `server` config before building for production!

---

## 📦 Building for Production

### Android APK (for testing)
1. Open Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. APK will be in `android/app/build/outputs/apk/debug/`

### Android App Bundle (for Play Store)
1. Open Android Studio
2. Build → Generate Signed Bundle / APK
3. Follow the wizard to create a keystore and sign the app
4. Upload the `.aab` file to Google Play Console

---

## 🍎 iOS Setup (When Ready)

To add iOS support:

1. **Install Xcode** (Mac only)

2. **Add iOS platform:**
   ```bash
   npx cap add ios
   ```

3. **Open in Xcode:**
   ```bash
   npm run mobile:ios
   ```

4. **Configure permissions** in `ios/App/App/Info.plist`:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>We need your location to show nearby spaces and people</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>We need background location to keep you connected to spaces</string>
   ```

---

## 🔧 Troubleshooting

### "dist directory not found"
Run `npm run build` first to create the dist folder.

### Gradle sync fails
- Make sure Android Studio is updated
- File → Invalidate Caches → Invalidate and Restart

### App crashes on device
- Check Android Studio Logcat for errors
- Ensure all permissions are granted on the device

### Geolocation not working
- Check that permissions are granted in device settings
- Make sure you're testing on a physical device (emulators may have issues)
- For background location, you need to request it separately on Android 10+

### Push notifications not working
- Push notifications require additional setup with Firebase (FCM)
- You'll need to create a Firebase project and add `google-services.json`

---

## 📚 Next Steps

1. **Test the app on your device** to ensure native features work
2. **Integrate geolocation** into your MapView component
3. **Add haptic feedback** to interactions (pounces, joins, etc.)
4. **Set up Firebase** for push notifications
5. **Create app icons** and splash screens
6. **Prepare for Play Store** submission

---

## 🎯 Key Files Reference

- **Capacitor Config:** `capacitor.config.ts`
- **Android Manifest:** `android/app/src/main/AndroidManifest.xml`
- **Native Utilities:** `src/lib/capacitor.ts`
- **React Hooks:** `src/hooks/useCapacitor.ts`
- **Build Scripts:** `package.json`

---

## 💡 Tips

- Always run `npm run mobile:sync` after making changes to web code
- Use `useCapacitorInit()` hook in your root App component
- Native features will gracefully degrade on web (check `isNativePlatform()`)
- Test on real devices for accurate geolocation and haptics
- Keep the Capacitor plugins updated: `npm update @capacitor/*`

---

**You're all set! 🚀 Your app is now mobile-ready!**

For questions or issues, check:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Geolocation](https://capacitorjs.com/docs/apis/geolocation)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
