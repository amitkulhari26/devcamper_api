const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const { registerUser, login, getMe } = require('../controller/auth');

router
    .route('/register')
    .post(registerUser);

router.post('/login', login);

router.get('/me', protect, getMe);

module.exports = router;