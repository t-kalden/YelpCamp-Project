const express = require('express');
const _ = require('passport-local-mongoose');
const user = require('../models/user');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport')
const users = require('../controller/users');

//register routes
router.route('/register')
    //render register form
        .get(users.renderRegisterForm)
    //register new user
        .post(catchAsync(users.register))

//login routes
router.route('/login')
    //render login form 
        .get(users.renderLogin)
    //check login credientials 
        .post(passport.authenticate('local', { failureFlash: true, failureRedirect:'/login'} ), users.login)

//logout
router.get('/logout', users.logout)

module.exports = router;