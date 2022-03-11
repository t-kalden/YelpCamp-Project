const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas');
const reviews = require('../models/review');

const validateCampground = (req,res,next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {next()}
}

//index page - display ALL campground C(Read)UD
router.get('/', async (req,res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

//route to form to add new campground to database (Create)RUD
router.get('/new', catchAsync((req,res, next) => {
    res.render('campgrounds/new');
}))

router.post('/', validateCampground, catchAsync(async (req,res, next) => {
         // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'Thank you for adding a new campground!')
        res.redirect(`/campgrounds/${campground._id}`);
})) 

//route to for to edit existing campgrounds and update to database CR(Update)D 
router.get('/:id/edit',  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', "Uh-oh, cannot find that campground"); 
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', validateCampground, catchAsync(async (req,res, next) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Campground has been updated!')
    res.redirect(`/campgrounds/${campground._id}`);
    next();
}))

router.delete('/:id', catchAsync( async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground has been deleted!')
    res.redirect("/campgrounds");
}))

//show page - showing details of campgrounds
router.get('/:id',  catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', "Uh-oh, cannot find that campground"); 
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show', { campground });
}))


module.exports = router;