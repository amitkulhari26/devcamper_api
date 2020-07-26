const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: './config/config.env' });

const app = express();

//To connect Databse
require('./config/db')();
// Routes
require('./starter/routes')(app);

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
