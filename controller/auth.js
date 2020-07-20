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