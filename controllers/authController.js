const { validationResult } = require('express-validator');
const {
  findByUsername,
  createUser,
  saveRefreshToken,
  revokeRefreshToken,
  findByRefreshToken,
} = require('../services/userService');
const { hashPassword, comparePassword } = require('../services/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/jwt');

function setRefreshCookie(res, token) {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}


async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const existing = await findByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const passwordHash = await hashPassword(password);
    const user = await createUser({ username, passwordHash });
    return res.status(201).json({ message: 'User registered successfully.', userId: user.id });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const accessToken = signAccessToken({ userId: user.id, username: user.username });
    const refreshToken = signRefreshToken({ userId: user.id });

   
    await saveRefreshToken(user.id, refreshToken);

    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}


async function refresh(req, res) {
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ message: 'Missing refresh token.' });
  }
  try {
    
    const decoded = verifyRefreshToken(token);

    
    const user = await findByRefreshToken(token);
    if (!user || user.id !== decoded.userId) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    
    const newAccessToken = signAccessToken({ userId: user.id, username: user.username });
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
}


async function logout(req, res) {
  const token = req.cookies?.jwt;
  if (token) {
    try {
      const user = await findByRefreshToken(token);
      if (user) {
        await revokeRefreshToken(user.id);
      }
    } catch (err) {
      console.error('Logout revoke error:', err);
    }
  }
  clearRefreshCookie(res);
  return res.json({ message: 'Logged out.' });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};