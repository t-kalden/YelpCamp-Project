const User = require('../models/user');

//render register form
module.exports.renderRegisterForm = (req,res) => {
    res.render('users/register');
}

//register new user
module.exports.register = async(req,res,next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'You have been registered');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

//render login
module.exports.renderLogin = (req,res) => {
    res.render('users/login');
}

//login user
module.exports.login = (req,res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//logout user
module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success','Signed out! Goodbye!');
    res.redirect('/campgrounds');
}