const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../Models/User');

//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, role, password } = req.body;
    const user = await User.create({
        name, email, password, role
    });
    sendTokenResponse(user, 200, res);
});

//@desc User Login
//@route POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // Check email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide email and password`, 400));
    }
    const user = await User.findOne({ email }).select('+password');
    // Check User
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matchs
    const isMatch = await user.passwordMatch(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});
// Get Token from model  create cookie and  send it to client 
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const option = {
        expires: new Date(Date.now() + process.env_JWT_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        option.secure = true;
    }
    res
        .status(statusCode)
        .cookie('token', token, option)
        .json({
            success: true,
            token
        });
};

//@ desc get current logged in user
//@route GET /api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});