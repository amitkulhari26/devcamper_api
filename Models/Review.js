const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a review title'],
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 10'],
        min: 1,
        max: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

});

//Prevent user from submitting for more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static Methods (Run only on Model) to get average rating for bootcamp and save in the boootcamp
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        { $match: { bootcamp: bootcampId } },
        {
            $group: { _id: "$bootcamp", avgRating: { $avg: "$tuition" } }
        }
    ]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].avgRating
        });
    } catch (error) {
        console.log(error);
    }
};
// Post-save mongoose middleware
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
});
// Pre-remove mongoose middleware
ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);