const express = require('express');

// Include other resourse routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resourse routers

const { getBootcamp,
    getBootcamps,
    createBootcamp,
    deleteBootcamp,
    updateBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload } = require('../controller/bootcamps');

const advancedResult = require('../middleware/advancedResult');

const Bootcamp = require('../Models/Bootcamp');

router.use('/:bootcampID/courses', courseRouter);

router.route('/:bootcampID/photo').put(bootcampPhotoUpload);

router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router
    .route('/')
    .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;