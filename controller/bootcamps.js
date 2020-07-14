const Bootcamp = require('../Models/Bootcamp');

// @desc     All bootcamps
// @routes   GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            status: true,
            count: bootcamps.length,
            data: bootcamps
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }

};
// @desc      Get Single bootcamps
// @routes   GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }

};
// @desc      Create new bootcamp
// @routes   POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        res.status(400).json({
            success: false
        });
    }

};
// @desc     Update bootcamp
// @routes   PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            status: true,
            message: bootcamp
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }

};
// @desc     Delete bootcamp
// @routes   DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            status: true,
            message: bootcamp
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
};