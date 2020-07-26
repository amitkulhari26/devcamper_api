const express = require('express');
const morgan = require('morgan');
const path = require('path');

const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const errorHandler = require('../middleware/error');
const security = require('./security');


// Route Files
const bootcamps = require('../routes/bootcams');
const courses = require('../routes/courses');
const auth = require('../routes/auth');
const users = require('../routes/users');
const reviews = require('../routes/reviews');

module.exports = (app) => {
    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //Dev logging middleaware
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // File upload middleware
    app.use(fileUpload());

    // Cookie parser middleware
    app.use(cookieParser());

    security(app);

    // Serve static file
    app.use(express.static(path.join(__dirname, 'public')));

    // Mount router
    app.use('/api/v1/bootcamps', bootcamps);
    app.use('/api/v1/courses', courses);
    app.use('/api/v1/auth', auth);
    app.use('/api/v1/auth/users', users);
    app.use('/api/v1/reviews', reviews);

    app.use(errorHandler);
};
