const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//index page - display ALL campground C(Read)UD
router.get('/', async (req,res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

//route to form to add new campground to database (Create)RUD
router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req,res, next) => {
         // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Thank you for adding a new campground!')
        res.redirect(`/campgrounds/${campground._id}`);
})) 

//route to for to edit existing campgrounds and update to database CR(Update)D 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', "Uh-oh, cannot find that campground"); 
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Campground has been updated!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync( async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground has been deleted!')
    res.redirect("/campgrounds");
}))

//show page - showing details of campgrounds
router.get('/:id', catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!campground) {
        req.flash('error', "Uh-oh, cannot find that campground"); 
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/show', { campground });
}))


module.exports = router;