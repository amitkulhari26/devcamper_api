const express = require('express');

const router = express.Router();

const { registerUser, login } = require('../controller/auth');

router
    .route('/register')
    .post(registerUser);

router.post('/login', login);

module.exports = router;