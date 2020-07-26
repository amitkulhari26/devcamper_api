const mongoSanitize = require('express-mongo-sanitize');
const hemlet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

module.exports = (app) => {
    // Mongo sanitize middleware (To sanitize the data)
    app.use(mongoSanitize());

    //Helmet to set extra security headers
    app.use(hemlet());

    //Prevent XSS(cross site scripting) attack
    app.use(xss());

    //Rate limiting
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,  // 10 Min
        max: 100
    });
    app.use(limiter);

    //Prevent http param polution
    app.use(hpp());

    // Enable CORS
    app.use(cors());
};