const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controller/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//adding reviews to campgrounds
router.post('/',validateReview, isLoggedIn, catchAsync(reviews.createReview));

//deleting reviews from campgrounds
router.delete(`/:reviewId`, isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;