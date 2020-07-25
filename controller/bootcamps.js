const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../Models/Bootcamp');
const geocoder = require('../utils/gecoder');

// @desc     All bootcamps
// @routes   GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});
// @desc      Get Single bootcamps
// @routes    GET /api/v1/bootcamps/:id
// @access    Public
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
// @routes    POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;

    // Check for published bootcamps
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    // if user is not an admin, they can only add only one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The User with ID ${req.user.id} has already published a bootcamp`, 400));
    }

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
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authroized to update to bootcamp`), 401);
    }

    // update bootcamp
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: true,
        message: bootcamp
    });
});
// @desc     Delete bootcamp
// @routes   DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authroized to Delete to bootcamp`), 401);
    }

    // Delete bootcamp
    await bootcamp.remove();

    res.status(200).json({
        status: true,
        message: bootcamp
    });
});

// @desc     Get bootcamp within radius
// @routes   get /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    // Calc radius using radian
    // Divide radius by Earth radius
    // Earth radius =3,963 mi (6,378 km)

    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    });
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

//@desc Upload photo for bootcamp
//@route PUT /api/v1/:bootcampID/photo
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.bootcampID);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp found with the bootcamp ID ${req.params.id}`, 404));
    }
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a Photo`, 400));
    }

    const file = req.files.photo;

    // Check if file is photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`File Image should be less than ${process.env.MAX_FILE_UPLOAD} MB`, 400));
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authroized to Delete to bootcamp`), 401);
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err);
            return next(new ErrorResponse('Problem with photo upload', 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.bootcampID, {
            photo: file.name
        });
        res.status(200).json({
            success: true,
            date: file.name
        });
    });


});
