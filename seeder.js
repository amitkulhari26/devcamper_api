const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const Bootcamp = require('./Models/Bootcamp');
const Course = require('./Models/Course');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
});
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));

//Insert data
const importBootcamps = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        console.log('Data imported'.green.inverse);
        process.exit(1);
    } catch (error) {
        console.log(error);
    }
};

//Insert data
const deleteBootcamps = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        console.log('Data destroyed'.red.inverse);
        process.exit(1);
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === '-i') {
    importBootcamps();
} else if (process.argv[2] === '-d') {
    deleteBootcamps();
}