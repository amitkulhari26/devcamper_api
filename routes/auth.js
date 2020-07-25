const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const { registerUser, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword } = require('../controller/auth');

router
    .route('/register')
    .post(registerUser);

router.post('/login', login);

router.get('/me', protect, getMe);

router.put('/updatedetails', protect, updateDetails);

router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;