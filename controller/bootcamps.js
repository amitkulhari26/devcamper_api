const slugify = require('slugify');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../Models/Bootcamp');

// @desc     All bootcamps
// @routes   GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({
        status: true,
        count: bootcamps.length,
        data: bootcamps
    });
});
// @desc      Get Single bootcamps
// @routes   GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }
    res.status(200).json({
        status: true,
        data: bootcamp
    });
});
// @desc      Create new bootcamp
// @routes   POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        status: true,
        data: bootcamp
    });
});
// @desc     Update bootcamp
// @routes   PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }
    res.status(200).json({
        status: true,
        message: bootcamp
    });
});
// @desc     Delete bootcamp
// @routes   DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }
    res.status(200).json({
        status: true,
        message: bootcamp
    });
});