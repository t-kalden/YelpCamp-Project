const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *60) + 10;
        const camp = new Campground({
            author: '62349b2fe67f78521438aa38',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae incidunt ipsam suscipit quas totam provident iste blanditiis culpa impedit, expedita dicta magnam, veniam molestias, magni consectetur aliquam doloremque praesentium eius.",
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log("DATA ADDED TO DATABASE");
    mongoose.connection.close();
    console.log("DATABASE CONNECTION CLOSED");
}) .catch(e => {
    console.log('ERROR: CONNECTION COULD NOT CLOST');
    console.log(e);
})