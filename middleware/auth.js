const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
const { User } = require('../Models/User');

// Protect route
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    // Set token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Set token from cookie
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exist
    if (!token) {
        return next(new ErrorResponse(`Not authorised to access this resourse`, 401));
    }

    try {
        const decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));

        req.user = await User.findById(decoded.id);

        next();

    } catch (error) {
        return next(new ErrorResponse(`Not authorised to access this resourse`, 401));
    }

});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`Not authorised to access this resourse for ${req.user.role}`, 403));
        }
        next();
    };
};