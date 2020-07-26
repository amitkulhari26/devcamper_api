const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    console.log(err.stack.red);
    error.message = err.message;

    // Mongoose Bad Object Id Error
    if (err.name === 'CastError') {
        const message = `Resourse not found`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose Duplicate filed error
    if (err.code === 11000) {
        const message = `Duplicate field entered`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }
    res
        .status(error.statusCode || 500)
        .json({ success: false, error: error.message || 'Internal Server Error' });
};
module.exports = errorHandler;