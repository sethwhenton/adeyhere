# Adey Here: Project Context & Master Plan

## 1. Project Overview
**Adey Here** ("Are they here?") is a location-based social web application designed to turn physical spaces into digital communities. It allows users to create temporary, geofenced "Spaces" (events, meetups, cafes) that others can join only when physically nearby.

The core philosophy is **"Hyper-Local & Temporary"**. Connections are relevant *now* and *here*. Once you leave the space or the event ends, the digital connection fades, mimicking real-life social dynamics.

## 2. Technology Stack
*   **Frontend**: React (Vite), TypeScript, TailwindCSS.
*   **State Management**: Zustand.
*   **Animations**: Framer Motion (heavy use for "premium" feel).
*   **Maps**: Leaflet (via `react-leaflet` removed, using raw `leaflet` for performance) with CartoDB Dark Matter tiles.
*   **Backend / BaaS**: Supabase.
    *   **Auth**: Anonymous Sign-in (primary), potentially OAuth in future.
    *   **Database**: PostgreSQL with PostGIS for geospatial queries.
    *   **Realtime**: Supabase Realtime (Channels) for live user positions, chat, and interactions.
    *   **Edge Functions**: Used for cleanup jobs (e.g., expiring spaces) and complex logic.

## 3. Core Features & Architecture

### A. Onboarding & Identity
*   **Frictionless Entry**: Users sign in anonymously with a single click.
*   **Identity**: Users pick a Display Name and an Emoji Avatar. This creates a profile in the `profiles` table.
*   **Persistence**: Identity is stored via Supabase Auth (User ID) and persisted locally.

### B. The Map View (`MapView.tsx`)
*   **Visuals**: Dark-mode map using OpenStreetMap + CartoDB tiles.
*   **User Location**: Tracked via `navigator.geolocation`. Displayed as a pulsing blue dot.
*   **Spaces**: Represented by custom markers showing participant counts.
*   **Geofencing**: Users automatically "detect" when they enter a space's radius (default 50m-200m).
*   **Interaction**: Tapping a space shows a summary card; joining bridges the user to the Radar View.

### C. The Radar View (`RadarView.tsx`)
Once inside a space, the view shifts to a "Radar" interface, abstracting the map away to focus on *people*.
*   **Nodes**: Users are represented as floating nodes.
*   **Physics**: D3-like simulation (custom logic) keeps nodes organizing dynamically.
*   **Interactions**:
    *   **Ghost Mode**: Users can turn invisible.
    *   **Pouncing**: A lightweight interaction (Wave, Wink, High-five) sent to another user. Includes haptic feedback.
    *   **Profile Card**: Tapping a node reveals stats and "Connect" options.

### D. Communication (`TownSquare.tsx`)
*   **Public Chat**: A broadcast channel for everyone in the space.
*   **Broadcast Mode**: Hosts can disable chat for participants, turning it into an announcement channel.
*   **Ephemeral**: Messages are tied to the Space ID and are not meant for long-term history.

### E. Host Authority & Moderation
*   **Creation**: Any user can host a space (duration: 1h - 24h, radius: 50m - 500m).
*   **Controls**:
    *   **Kick/Ban**: Hosts can remove users.
    *   **Broadcast Only**: Toggle chat permissions.
    *   **Analytics**: View live visitor counts and peak activity times.

### F. "Antigravity" Premium Features (Phase 5)
*   **Mesh Network Bridge**: Logic to attempt P2P WebRTC connections (fallback for poor cell reception).
*   **Dynamic Themes**: Users can switch the app's vibe (Neon, Zen, Professional, etc.).
*   **Beacons**: Special signals (SOS, Lost Item, Meetup Point) that pulse visually on the Radar.
*   **Haptic Feedback**: Custom vibration patterns for interactions.

## 4. Data Models (Supabase)
*   **`profiles`**: `id`, `display_name`, `avatar`, `is_ghost`, `location` (lat/lng), `theme`, `beacon_type`.
*   **`spaces`**: `id`, `host_id`, `name`, `center_lat`, `center_lng`, `radius`, `expires_at`, `broadcast_only`.
*   **`participants`**: Linking table (`user_id`, `space_id`, `joined_at`).
*   **`messages`**: Chat logs (`space_id`, `user_id`, `content`, `is_broadcast`).
*   **`interactions`**: "Pounces" (`from_user`, `to_user`, `type`, `seen`).
*   **`reports`**: Moderation flags against users.
*   **`space_bans`**: Blacklist for kicked users prevents re-joining.

## 5. Current State
*   **Version**: Premium V1 (Feature Complete).
*   **Stability**: Map rendering issues (white screen) resolved by moving to raw Leaflet.
*   **UI**: High-polish "Glassmorphism" UI with advanced animations.

## 6. Roadmap: What to Do Next

### Immediate Priorities
1.  **Mobile Wrapper**: Wrap this React web app in Capacitor or React Native (Webview) to get it on the App Store/Play Store. This is critical for background geolocation and push notifications.
2.  **Performance Tuning**: The Radar view needs optimization (Canvas API?) if a space exceeds 50+ concurrent users.
3.  **Monetization**:
    *   **Premium Themes**: Lock certain themes.
    *   **Pro Hosting**: Ability to host spaces larger than 500m or longer than 24h.
4.  **Advanced Mesh**: Fully implement the WebRTC Data Channel fallback for chat when offline.

### Maintenance
*   Monitor Supabase Edge Function logs for "cleanup_spaces" job to ensure dead spaces don't clutter the map.
*   Watch out for `past_events` table growth; implement archiving strategy.
