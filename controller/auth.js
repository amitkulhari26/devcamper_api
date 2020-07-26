const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../Models/User');
const crypto = require('crypto');
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

//@ desc  Update User details for logged in user
//@route  PUR /api/v1/auth/updatedetails
//@access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {

    const fieldsToUpdate = {
        email: req.body.email,
        name: req.body.name
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

//@ desc  Update password
//@route  PUT /api/v1/auth/updatepassword
//@access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new ErrorResponse(`No User found`, 404));
    }

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Current password is incorrect`, 401));
    }
    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
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
    const resetUrl = `${req.host}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

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


//@desc    Reset Password
//@route   PUT /api/v1/auth/resetpassword/:resetToken
//@access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.find({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
        return next(new ErrorResponse(`Invalid token`, 400));
    }

    //Set Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.save();

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