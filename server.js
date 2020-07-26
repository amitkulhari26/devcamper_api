const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');

const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const hemlet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Connect to db
connectDB();

// Route Files
const bootcamps = require('./routes/bootcams');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

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

// Mongo sanitize middleware (To sanitize the data)
app.use(mongoSanitize());

//Helmet to set extra security headers
app.use(hemlet());

//Prevent XSS(cross site scripting) attack
app.use(xss());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,  // 10 Min
    max: 1
});
app.use(limiter);

//Prevent http param polution
app.use(hpp());

// Enable CORS
app.use(cors());

// Serve static file
app.use(express.static(path.join(__dirname, 'public')));

// Mount router
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    server.close(() => {
        process.exit(1);
    });
});
