const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10; // Increase for stronger hashing (at CPU cost)

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };