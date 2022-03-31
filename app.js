if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoDBStore = require('connect-mongo')(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const  secret = process.env.SECRET || 'thisshouldbeabettersecret';
//routes
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

//models
const User = require('./models/user');

// const { authenticate } = require('passport/lib');
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("err", console.error.bind(console, "CONNECTION ERROR: "));
db.once("open", () => {
    console.log("CONNECTED TO DATABASE");
})

const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})
store.on('error', function(e) {
    console.log("Session Store Error");
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave:false,
    saveUninitalized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//calling ejs-mate for boilerplate 
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended : true }));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method')); //calling method_override
app.use(mongoSanitize());
app.use(session(sessionConfig));
app.use(flash());

//helmet
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dplz0x0mm/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dplz0x0mm/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dplz0x0mm/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dplz0x0mm/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dplz0x0mm/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.pexels.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dplz0x0mm/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

//pasport
app.use(passport.initialize()); // initilizing passport
app.use(passport.session()); // initilizing passport session
passport.use(new LocalStrategy(User.authenticate())); // authenticating user using passport

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use((req,res,next)=> {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//use routes
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);


app.get('/', (req,res) => {
    res.render('home');
})

//error handling
app.all('*', (req,res, next) => {
    return next(new ExpressError('Page Not Found', 404));
    res.send('404!!!');
})
app.use((err,req,res,next)=> {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh, no! Something went wrong'
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})