# Gin Rummy Score Tracker

A PWA (Progressive Web App) for tracking gin rummy games with server-side persistence and automatic cross-device syncing.

## Features

- Track gin rummy game scores
- Save games with date and time on the server
- View game history and statistics
- **Automatic cross-device syncing** - changes on one device appear on other devices in real-time
- Works offline (PWA with service worker caching)
- Multi-device support with shared game history (one account, one history)
- No user authentication required

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

Games are stored server-side in the `data/` directory as JSON files, using a shared static user ID.

All devices use the same shared account (`gin-rummy-personal`), so all scores and game history are automatically synced across all devices.

## Syncing

The app automatically polls the server every 5 seconds to check for updates from other devices:
- When you open the app on one device, it downloads the latest data from the server
- When you make changes on one device, they are saved to the server
- Other devices automatically detect the changes and update within 5 seconds
- Polling pauses when the app is in the background to save battery

This means:
- iOS, Desktop, and Web versions all share the same game history
- No manual sync needed - just open the app on any device and your latest scores appear automatically
- Works seamlessly even when switching between devices mid-game

## Features

- **Score Calculation**: Automatically calculates gin, knock, and undercut scores
- **Game Tracking**: Tracks multiple games with winner determination
- **Statistics**: Shows win counts and game history
- **Persistent Storage**: All games are saved on the server
- **Responsive Design**: Works on desktop and mobile devices
