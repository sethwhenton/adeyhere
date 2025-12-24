# Adey Here

Adey Here is a location-based social web application that turns physical locations into digital communities. It allows users to create and join temporary, geofenced spaces to connect with people nearby in real-time.

## Concept

The core philosophy is centered on hyper-local and temporary connections. Digital interactions are tied to physical presence, making them relevant only to the here and now. When you leave a location, the connection fades, mimicking real-world social dynamics.

## Key Features

- **Anonymous Onboarding**: Frictionless entry with no complex registration.
- **Interactive Map**: View active spaces nearby on a dark-mode map.
- **Radar View**: An abstract visualization of participants within a space.
- **Live Chat**: Public town square for broadcasting messages to everyone in the geofence.
- **Host Controls**: Create spaces, manage participants, and toggle broadcast-only modes.
- **Beacon System**: Signal for help or meetups within a crowded space.

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Mobile**: Capacitor (iOS & Android)
- **Maps**: Leaflet (OpenStreetMap + CartoDB Dark Matter tiles)
- **State Management**: Zustand
- **Backend**: Supabase (Database, Auth, Realtime, Edge Functions)

## Getting Started (Web)

### Prerequisites

- Node.js (Version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Mobile Deployment

This project uses [Capacitor](https://capacitorjs.com/) to wrap the web app for native mobile deployment.

### Prerequisites for Mobile
- **Android**: Android Studio (available on Windows, Mac, Linux).
- **iOS**: Xcode (MAC ONLY). You cannot build for iOS on Windows.

### How to Run on Android (Windows/Mac/Linux)

1. **Build the web assets**:
   This compiles your React code into the `dist` folder.
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   This updates the native Android project with your latest web build and plugins.
   ```bash
   npx cap sync
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Run the App**:
   - Connect an Android device via USB (ensure USB Debugging is on) OR create an Emulator in AVD Manager.
   - Click the **Run** (Play) button in Android Studio.

### How to Run on iOS (Mac Only)

If you have cloned this repository on a Mac, follow these steps to deploy to an iPhone or Simulator.

1. **Add iOS Platform** (if not already present):
   ```bash
   npm install
   npx cap add ios
   ```

2. **Build and Sync**:
   ```bash
   npm run build
   npx cap sync
   ```

3. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

4. **Run the App**:
   - Select a Simulator (e.g., iPhone 15) or connected device from the top bar.
   - Click the **Run** (Play) button.
   - *Note: You may need to sign the app with your Apple ID in the "Signing & Capabilities" tab.*

## Troubleshooting

- **Supabase Reset**: If you encounter database issues, execute the SQL script located in `supabase/reset.sql` via the Supabase Dashboard SQL Editor.
- **Changes not reflecting on mobile**: Ensure you run `npm run build` and `npx cap sync` after every code change before running the native app.
