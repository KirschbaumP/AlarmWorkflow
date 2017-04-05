var logger = require("./../../shared/logger");
var form = require('express-form');
var field = form.field;

module.exports = function (passport, app, isLoggedIn) {
    app.get('/login', function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        }
        var redirect= req.query.origin||"/";
        // render the page and pass in any flash data if it exists
        res.render('auth/login.ejs', {message: req.flash('loginMessage'), redirect:redirect});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            //successRedirect: '/', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }), form(
        field("redirect")
        ),
        function (req, res) {
            console.log("AAAA");
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 10;
            } else {
                req.session.cookie.expires = false;
            }
            var redirect1 = req.body.redirect;
            var redirect = req.form.redirect;

            console.log("REDIRECT1: "+redirect1);
            console.log("REDIRECT: "+redirect);
            res.redirect(redirect);
        });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
};