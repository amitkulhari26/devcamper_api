const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../Models/User');
const sendEmail = require('../utils/sendEmail');

//@desc   Register user
//@route  POST /api/v1/auth/register
//@access Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, role, password } = req.body;
    const user = await User.create({
        name, email, password, role
    });
    sendTokenResponse(user, 200, res);
});

//@desc   User Login
//@route  POST /api/v1/auth/login
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


//@ desc  Get current logged in user
//@route  GET /api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc   Forgot password
//@route  POST /api/v1/auth/forgotpassword
//@access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    //Check User
    if (!user) {
        return next(new ErrorResponse(`There is no user with email ${req.body.email}`, 404));
    }

    //Get Reset Token
    const resetToken = user.gerResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    //Create Reset Url
    const resetUrl = `${req.host}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;

    // Create Message

    const message = `You are receiving this email beacuse you  (or someone else) has requsted the reset of a password
    Please make a PUT request to :\n\n ${resetUrl}`;

    try {
        await sendEmail({
            message,
            email: user.email,
            subject: 'Reset password'
        });

        res.status(200).json({ success: true, data: `Email Sent` });
    } catch (error) {

        console.log(error);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse(`Email could not sent`, 500));
    }

    res.status(200).json({
        success: true,
        data: user
    });
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