const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controller/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    //index page - display ALL campground C(Read)UD
        .get(catchAsync(campgrounds.index)) 
    //create and add new campground to db
        // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)) 
        .post(upload.array('image'), (req,res) => {
            console.log(req.body, req.files);
            res.send('Files uploaded');
        })

//route to form to add new campground to database (Create)RUD
router.get('/new', isLoggedIn, campgrounds.renderNewForm)
// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); 

//route for edit existing campgrounds and update to database CR(Update)D 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.route('/:id') 
    //route for updating campground to database CR(Update)D 
        .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    //route to delete campgrounds
        .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
    //show page - showing details of campgrounds
        .get(catchAsync(campgrounds.showCampground));

module.exports = router;