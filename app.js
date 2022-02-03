const express = require('express');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})

const app = express();
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));

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
app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', async (req,res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

//route to for to edit existing campgrounds and update to database CR(Update)D 
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})
app.put('/campgrounds/:id', async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
})



//show page - showing details of campgrounds
app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/show', {campground});
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})