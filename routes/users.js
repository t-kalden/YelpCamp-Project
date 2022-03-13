const express = require('express');
const user = require('../models/user');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

router.get('/register', (req,res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async(req,res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user,password);
        req.flash('success', 'You have been registered');
        res.redirect('/campgrounds');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req,res) => {
    res.render('user/login');
})

router.post('/login', (req,res) => {

})

module.exports = router;