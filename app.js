const express = require('express');
const app = express();
const path = require('path');
const Campground = require('./models/campground');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req,res) => {
    res.render('home');
})

app.get('/makecampground', async (req,res) => {
    const camp = new Campground({title: 'MY BACKYARD TESTING', description: 'testing db'});
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})