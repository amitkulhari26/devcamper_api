const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../Models/Bootcamp');
const geocoder = require('../utils/gecoder');

// @desc     All bootcamps
// @routes   GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;
    // Copying an Object
    let reqQuery = { ...req.query };

    let removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach((param) => { delete reqQuery[param]; });

    queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|lt|gte|lte|in)\b/g, match => `$${match}`);
    // Finding resourses
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
    // Select Fields
    if (req.query.select) {
        let selectFields = req.query.select.split(',').join(' ');
        query.select(selectFields);
    }

    // Sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query.sort(sortBy);
    } else {
        query.sort('-createdAt');
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endindex = page * limit;
    query.skip(startIndex).limit(endindex);
    const totalDocuments = await Bootcamp.countDocuments();

    const pagination = {};
    if (startIndex > 0) {
        pagination.prev = page - 1;
        pagination.limit = limit;
    }
    if (endindex < totalDocuments) {
        pagination.next = page + 1;
        pagination.limit = limit;
    }

    // Execute Query
    const bootcamps = await query;

    res.status(200).json({
        status: true,
        pagination,
        count: bootcamps.length,
        data: bootcamps
    });
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
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`), 404);
    }
    bootcamp.remove();
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
