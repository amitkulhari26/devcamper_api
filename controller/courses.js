const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../Models/Course');
const Bootcamp = require('../Models/Bootcamp');

//@desc Get courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access Public

exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        let courses = Course.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }

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
    req.body.bootcamp = req.params.bootcampID;
    req.body.oser = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampID);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp is not found with the given ID ${req.params.bootcampID}`, 404));
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authroized to add course to bootcamp ${bootcamp._id}`), 401);
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

    // Make sure user is bootcamp owner
    if (course.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authroized to update course ${course._id}`), 401);
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

    // Make sure user is bootcamp owner
    if (course.user.toSring() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authroized to update course ${course._id}`), 401);
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});