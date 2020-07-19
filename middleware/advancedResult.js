const advancedResult = (model, populate) => async (req, res, next) => {
    let query;
    // Copying an Object
    let reqQuery = { ...req.query };

    let removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach((param) => { delete reqQuery[param]; });

    queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|lt|gte|lte|in)\b/g, match => `$${match}`);
    // Finding resourses
    query = model.find(JSON.parse(queryStr));
    // Select Fields
    if (req.query.select) {
        let selectFields = req.query.select.split(',').join(' ');
        query.select(selectFields);
    }

    // Sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query.sort(sortBy);
    } else {
        query.sort('-createdAt');
    }
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endindex = page * limit;
    query.skip(startIndex).limit(endindex);
    const totalDocuments = await model.countDocuments();
    // Execute Query
    if (populate) {
        query = query.populate(populate);
    }
    const results = await query;
    const pagination = {};
    if (startIndex > 0) {
        pagination.prev = page - 1;
        pagination.limit = limit;
    }
    if (endindex < totalDocuments) {
        pagination.next = page + 1;
        pagination.limit = limit;
    }

    res.advancedResults = {
        succes: true,
        count: results.length,
        pagination,
        data: results
    };
    next();

};
module.exports = advancedResult;