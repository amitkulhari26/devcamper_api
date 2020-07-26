const express = require('express');
const router = express.Router({ mergeParams: true });

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser } = require('../controller/users');

const User = require('../Models/User');

const advancedResult = require('../middleware/advancedResult');
const { protect, authorize } = require('../middleware/auth');

//adding middleware to all the below routes
router.use(protect);
router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResult(User), getUsers)
    .post(createUser);


router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;