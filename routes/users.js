const express = require('express');
const _ = require('passport-local-mongoose');
const user = require('../models/user');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport')
const users = require('../controller/users');
router.get('/register', users.renderRegisterForm);

router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLogin);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect:'/login'} ), users.login)

router.get('/logout', users.logout)

module.exports = router;