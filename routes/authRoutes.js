const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/authController');


const usernameRule = body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 chars.');
const passwordRule = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars.');

router.post('/register', [usernameRule, passwordRule], register);
router.post('/login', [usernameRule, passwordRule], login);
router.post('/refresh', refresh); // read from cookie
router.post('/logout', logout);

module.exports = router;