const express = require('express');

const router = express.Router();

const { resgisterUser } = require('../controller/auth');

router.post('/register', resgisterUser);