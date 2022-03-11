const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const app = express();


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})

app.use(express.urlencoded({ extended : true }));
//calling method_override
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
//calling ejs-mate for boilerplate 
app.engine('ejs', ejsMate);
const sessionConfig = {
    secret:'Secret',
    resave:false,
    saveUninitalized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req,res) => {
    res.render('home');
})

app.use((req,res,next)=> {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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