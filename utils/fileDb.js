const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'users.json');

async function readUsersFile() {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeUsersFile(users) {
  await fs.writeFile(dataPath, JSON.stringify(users, null, 2), 'utf8');
}

module.exports = {
  readUsersFile,
  writeUsersFile,
};  