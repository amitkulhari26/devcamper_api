const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controller/courses');

const Course = require('../Models/Course');
const advancedResult = require('../middleware/advancedResult');

router
    .route('/')
    .get(advancedResult(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getCourses)
    .post(createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;