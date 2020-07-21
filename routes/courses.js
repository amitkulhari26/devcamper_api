const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controller/courses');

const Course = require('../Models/Course');
const advancedResult = require('../middleware/advancedResult');

const { protect } = require('../middleware/auth');


router
    .route('/')
    .get(advancedResult(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(protect, createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

module.exports = router;