const express = require('express');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds')

const mongoose = require('mongoose');
const review = require('./models/review');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})


const app = express();
app.use(express.urlencoded({ extended : true }));
//calling method_override
app.use(methodOverride('_method'));
//calling ejs-mate for boilerplate 
app.engine('ejs', ejsMate);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req,res) => {
    res.render('home');
})

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {next()} 
}

app.use('/campgrounds', campgrounds);

//adding reviews to campgrounds
app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//deleting reviews from campgrounds
app.delete(`/campgrounds/:id/reviews/:reviewId`, catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


//show page - showing details of campgrounds
app.get('/campgrounds/:id',  catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {campground});
}))

//error handling
app.all('*', (req,res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
app.use((err,req,res,next)=> {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh, no! Something went wrong'
    res.status(statusCode).render('error', {err});
})


app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})