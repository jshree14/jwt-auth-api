const { v4: uuidv4 } = require('uuid');
const { readUsersFile, writeUsersFile } = require('../utils/fileDb');

async function findByUsername(username) {
  const users = await readUsersFile();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

async function findById(id) {
  const users = await readUsersFile();
  return users.find(u => u.id === id) || null;
}

async function createUser({ username, passwordHash }) {
  const users = await readUsersFile();
  const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) throw new Error('USERNAME_TAKEN');
  const newUser = {
    id: uuidv4(),
    username,
    passwordHash,
    refreshToken: null, // store current valid refresh token (demo only)
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeUsersFile(users);
  return newUser;
}

async function updateUser(user) {
  const users = await readUsersFile();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) throw new Error('USER_NOT_FOUND');
  users[idx] = user;
  await writeUsersFile(users);
  return user;
}

async function saveRefreshToken(userId, refreshToken) {
  const user = await findById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  user.refreshToken = refreshToken; // In production, store hashed!
  await updateUser(user);
  return true;
}

async function revokeRefreshToken(userId) {
  const user = await findById(userId);
  if (!user) return;
  user.refreshToken = null;
  await updateUser(user);
}

async function findByRefreshToken(refreshToken) {
  const users = await readUsersFile();
  return users.find(u => u.refreshToken === refreshToken) || null;
}

module.exports = {
  findByUsername,
  findById,
  createUser,
  updateUser,
  saveRefreshToken,
  revokeRefreshToken,
  findByRefreshToken,
};