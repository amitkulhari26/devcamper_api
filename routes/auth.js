const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const { registerUser, login, getMe, forgotPassword } = require('../controller/auth');

router
    .route('/register')
    .post(registerUser);

router.post('/login', login);

router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPassword);

module.exports = router;