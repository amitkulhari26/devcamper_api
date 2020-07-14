const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const bootcamps = require('./routes/bootcams');

const app = express();

app.use('/api/v1/bootcamps', bootcamps);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on ${PORT}`);
});