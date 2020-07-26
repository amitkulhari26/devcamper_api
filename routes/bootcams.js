const express = require('express');
const router = express.Router();

// Include other resourse routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');


const Bootcamp = require('../Models/Bootcamp');

const { protect, authorize } = require('../middleware/auth');
const advancedResult = require('../middleware/advancedResult');

//Re-route into other resourse routers
router.use('/:bootcampID/courses', courseRouter);
router.use('/:bootcampID/reviews', reviewRouter);

const { getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp,
    updateBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload } = require('../controller/bootcamps');

router
    .route('/:bootcampID/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;