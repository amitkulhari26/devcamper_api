const express = require('express');
const router = express.Router({ mergeParams: true });

const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controller/reviews');

const Review = require('../Models/Review');

const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');


router
    .route('/')
    .get(advancedResult(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('user', 'admin'), createReview);

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;