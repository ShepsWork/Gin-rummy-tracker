# Gin Rummy Score Tracker

A PWA (Progressive Web App) for tracking gin rummy games with server-side persistence.

## Features

- Track gin rummy game scores
- Save games with date and time on the server
- View game history and statistics
- Works offline (PWA with service worker caching)
- Local-first persistence in browser storage
- Optional multi-device sync when a server API is configured

## Installation and Running

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /api/user-id` - Get or generate a unique user ID
- `GET /api/data` - Load all user data (games, currentGame, playerNames)
- `POST /api/data` - Save all user data
- `POST /api/games` - Add a new completed game
- `DELETE /api/games/:gameId` - Delete a specific game
- `DELETE /api/games` - Clear all games

## Data Storage

Games are always stored locally in browser storage.

If a sync API is available, data is also saved server-side in the `data/` directory as JSON files, one file per user ID.

The app uses a shared user ID by default (`gin-rummy-personal`) so multiple devices can sync when pointed at the same server API.

## GitHub Pages

GitHub Pages only hosts static files and does not run `server.js`.  
When running on GitHub Pages:

- Local persistence still works.
- To enable cross-device sync, set **Server sync URL** in app settings to a hosted API endpoint that serves this repo's `/api` routes.

## Features

- **Score Calculation**: Automatically calculates gin, knock, and undercut scores
- **Game Tracking**: Tracks multiple games with winner determination
- **Statistics**: Shows win counts and game history
- **Persistent Storage**: All games are saved on the server
- **Responsive Design**: Works on desktop and mobile devices
