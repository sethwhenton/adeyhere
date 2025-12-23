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
- **Maps**: Leaflet (OpenStreetMap + CartoDB Dark Matter tiles)
- **State Management**: Zustand
- **Backend**: Supabase (Database, Auth, Realtime, Edge Functions)

## Getting Started

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

## License

This project is for personal use and development.
