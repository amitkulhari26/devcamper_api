const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
const { User } = require('../Models/User');

// Protect route
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        console.log(req.headers.authorization.split(' ')[1]);
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exist
    if (!token) {
        return next(new ErrorResponse(`Not authorise to access this resourse`, 401));
    }

    try {
        const decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));

        req.user = await User.findById(decoded.id);
        next();

    } catch (error) {
        return next(new ErrorResponse(`Not authorise to access this resourse`, 401));
    }

});