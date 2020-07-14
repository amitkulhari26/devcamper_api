const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({ path: './config/config.env' });
// Connect to db
connectDB();
// Route Files
const bootcamps = require('./routes/bootcams');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcamps);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}`);
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});