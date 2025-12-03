const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('public')); // serve static files from /public

// Serve index.html explicitly on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware to log and show player data from cookies
app.use((req, res, next) => {
  const playerData = req.cookies.playerData ? JSON.parse(req.cookies.playerData) : null;
  console.log('PlayerData from cookie:', playerData);
  req.playerData = playerData || {};
  next();
});

// API endpoint to save player data
app.post('/save', (req, res) => {
  const data = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  const cookieOptions = {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('playerData', JSON.stringify(data), cookieOptions);
  res.json({ message: 'Player data saved successfully' });
});

// API endpoint to load player data
app.get('/load', (req, res) => {
  res.json(req.playerData || {});
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
