// @desc     All bootcamps
// @routes   GET /api/v1/bootcamps
// @access   Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({
        status: true,
        message: "Show all bootcamps"
    });
};
// @desc      Get Single bootcamps
// @routes   GET /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({
        status: true,
        message: `Show bootcamps ${req.params.id}`
    });
};
// @desc      Create new bootcamp
// @routes   POST /api/v1/bootcamps
// @access   Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({
        status: true,
        message: `create bootcamp`
    });
};
// @desc     Update bootcamp
// @routes   PUT /api/v1/bootcamps/:id
// @access   Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({
        status: true,
        message: `update bootcamp ${req.params.id}`
    });
};
// @desc     Delete bootcamp
// @routes   DELETE /api/v1/bootcamps/:id
// @access   Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({
        status: true,
        message: `Delete bootcamp ${req.params.id}`
    });
};