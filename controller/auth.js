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
    //Genrate Token
    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        token
    });
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
    //Genrate Token
    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        token
    });
});