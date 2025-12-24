import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adeyhere.app',
  appName: 'Adey Here',
  webDir: 'dist',
  server: {
    // Enable for local development testing on device
    // url: 'http://192.168.1.X:5173',
    // cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0F172A',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0F172A'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
