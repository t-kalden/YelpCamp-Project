const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Campground = require('../models/campground');
const Review = require('../models/review');

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {next()} 
}

//adding reviews to campgrounds
router.post('/',validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review Added!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//deleting reviews from campgrounds
router.delete(`/:reviewId`, catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;