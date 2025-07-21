require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const { verifyAccessToken } = require('./services/jwt');

const app = express(); // <--- DEFINE APP HERE FIRST!

// Config
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5000';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);

// Debug route (token test)
app.get('/auth/debug', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    return res.json({ valid: true, decoded });
  } catch (err) {
    return res.status(403).json({ valid: false, error: err.message });
  }
});


app.get('/', (req, res) => {
  res.json({ message: 'JWT Auth API running' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Server error.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
