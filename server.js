import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataDir = path.join(__dirname, 'data');
const getDataFile = (userId) => path.join(dataDir, `${userId}.json`);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate or get user ID from request
// Defaults to 'gin-rummy-personal' for cross-device sync
const getUserId = (req) => {
  const userId = req.headers['x-user-id'] || 'gin-rummy-personal';
  return userId;
};

// Load user data
const loadUserData = (userId) => {
  const filePath = getDataFile(userId);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error loading data for user ${userId}:`, error);
  }
  return { games: [], currentGame: [], playerNames: { knocker: 'Player 1', opponent: 'Player 2' } };
};

// Save user data
const saveUserData = (userId, data) => {
  const filePath = getDataFile(userId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data for user ${userId}:`, error);
    throw error;
  }
};

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get user ID (for first-time users)
app.get('/api/user-id', (req, res) => {
  const userId = uuidv4();
  res.json({ userId });
});

// Get all data for a user
app.get('/api/data', (req, res) => {
  const userId = getUserId(req);
  const data = loadUserData(userId);
  res.json({ userId, ...data });
});

// Save all data for a user
app.post('/api/data', (req, res) => {
  const userId = getUserId(req);
  const { games, currentGame, playerNames } = req.body;

  if (typeof games !== 'object' || typeof currentGame !== 'object' || typeof playerNames !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    saveUserData(userId, { games, currentGame, playerNames });
    res.json({ success: true, userId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Add a new game
app.post('/api/games', (req, res) => {
  const userId = getUserId(req);
  const game = req.body;

  if (!game || typeof game !== 'object') {
    return res.status(400).json({ error: 'Invalid game data' });
  }

  try {
    const data = loadUserData(userId);
    data.games.push(game);
    saveUserData(userId, data);
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// Delete a game
app.delete('/api/games/:gameId', (req, res) => {
  const userId = getUserId(req);
  const gameId = parseInt(req.params.gameId, 10);

  try {
    const data = loadUserData(userId);
    data.games = data.games.filter(g => g.id !== gameId);
    saveUserData(userId, data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// Clear all games
app.delete('/api/games', (req, res) => {
  const userId = getUserId(req);

  try {
    const data = loadUserData(userId);
    data.games = [];
    saveUserData(userId, data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear games' });
  }
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gin Rummy Tracker server running on http://localhost:${PORT}`);
});
