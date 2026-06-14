# Gin Rummy Score Tracker

A PWA (Progressive Web App) for tracking gin rummy games with server-side persistence.

## Features

- Track gin rummy game scores
- Save games with date and time on the server
- View game history and statistics
- Works offline (PWA with service worker caching)
- Multi-device support with per-user server storage

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

Games are stored server-side in the `data/` directory as JSON files, one file per user ID.

Each user is identified by a UUID that is generated on first use and stored in `localStorage`.

## Features

- **Score Calculation**: Automatically calculates gin, knock, and undercut scores
- **Game Tracking**: Tracks multiple games with winner determination
- **Statistics**: Shows win counts and game history
- **Persistent Storage**: All games are saved on the server
- **Responsive Design**: Works on desktop and mobile devices
