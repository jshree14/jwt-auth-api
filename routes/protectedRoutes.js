const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);


router.get('/profile', (req, res) => {
 
  res.json({
    message: `Hello, ${req.user.username}! This is your protected profile data.`,
    user: req.user,
  });
});

module.exports = router;