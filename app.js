const express = require('express');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas.js');

const mongoose = require('mongoose');
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

//index page - display ALL campground C(Read)UD
app.get('/campgrounds', async (req,res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

//route to form to add new campground to database (Create)RUD
app.get('/campgrounds/new', catchAsync((req,res, next) => {
    res.render('campgrounds/new');
}))

const validateCampground = (req,res,next) => {
    
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {next()}
}

app.post('/campgrounds', validateCampground, catchAsync(async (req,res, next) => {
         // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
        next();
}))

//route to for to edit existing campgrounds and update to database CR(Update)D 
app.get('/campgrounds/:id/edit',  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
    next();

}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req,res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
    next();

}))

app.delete('/campgrounds/:id', catchAsync( async (req,res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
    next();

}))

//show page - showing details of campgrounds
app.get('/campgrounds/:id',  catchAsync( async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
    next();

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