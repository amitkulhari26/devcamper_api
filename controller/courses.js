const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../Models/Course');
const Bootcamp = require('../Models/Bootcamp');

//@desc Get courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }
    let courses = await query;
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

//@desc Get Course By Id
//@route GET /api/v1/courses/:id
//@access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });
    if (!course) {
        return next(new ErrorResponse(`Course with given id ${req.params.id} not found`, 404));
    }
    res.status(200).json({
        success: true,
        data: course
    });
});

//@desc  Add Course 
//@route POST /api/v1/bootcamps/:bootcampID/courses/
//@access Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    console.log(req.params.bootcampID);
    req.body.bootcamp = req.params.bootcampID;
    const bootcamp = await Bootcamp.findById(req.params.bootcampID);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp is not found with the given ID ${req.params.bootcampID}`, 404));
    }
    const course = await Course.create(req.body);
    res.status(201).json({
        success: true,
        data: course
    });
});

//@desc Update a course
//@routes PUT /api/v1/courses/:id
//@access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`Course with given id ${req.params.id}not found`, 404));
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: course
    });
});

//@desc Delete a course
//@route DELETE /api/v1/courses/:id
//@access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`Course with given ID ${req.params.id} not found`, 404));
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: {}
    });
});