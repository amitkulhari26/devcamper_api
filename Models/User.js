const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an name']
    },
    email: {
        type: String,
        required: [true, 'email id is required'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password for user

UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

// Sign JWT token
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, Buffer.from(process.env.JWT_SECRET, 'base64'), {
        expiresIn: process.env.JWT_EXPIRE
    });
};

//Password match
UserSchema.methods.passwordMatch = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Genrate and hash password token
UserSchema.methods.gerResetPasswordToken = function () {
    // Genrate Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log(resetToken);

    // Hash token and set to reset token
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    //Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);