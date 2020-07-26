const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../Models/Review');
const Bootcamp = require('../Models/Bootcamp');

//@desc   Get reviews
//@route  GET /api/v1/reviews
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@access Public

exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        let reviews = Review.find({ bootcamp: req.params.bootcampId });
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

//@desc   Get review
//@route  GET /api/v1/reviews/:id
//@access Public

exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review
        .findById(req.params.id)
        .populate({
            path: 'bootcamp',
            select: 'name description'
        });

    //Check review
    if (!review) {
        return next(new ErrorResponse(`No review found with ID ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: review
    });
});

//@desc   Create review
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@access Private

exports.createReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcmapId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    //Check bootcamp
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp found with the ID of ${req.params.bootcampId}`, 404));
    }

    const review = await Review.create(req.body);

    res.status(200).json({
        success: true,
        data: review
    });
});

//@desc   Update review
//@route  PUT /api/v1/reviews/:id
//@access Private

exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id);
    //Check review
    if (!review) {
        return next(new ErrorResponse(`No review found with the ID of ${req.params.id}`, 404));
    }

    // Make sure review belongs to user

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authrosize to update the review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

//@desc   Delete review
//@route  DELETE /api/v1/reviews/:id
//@access Private

exports.deleteReview = asyncHandler(async (req, res, next) => {

    const review = await Review.findById(req.params.id);
    //Check review
    if (!review) {
        return next(new ErrorResponse(`No review found with the ID of ${req.params.id}`, 404));
    }

    // Make sure review belongs to user

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authrosize to update the review`, 401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});