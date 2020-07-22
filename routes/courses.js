const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controller/courses');

const Course = require('../Models/Course');
const advancedResult = require('../middleware/advancedResult');

const { protect, authorize } = require('../middleware/auth');


router
    .route('/')
    .get(advancedResult(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;