var logger = require("./../../shared/logger");

module.exports = function (passport, app, isLoggedIn) {
    app.get('/login', function (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        }
        // render the page and pass in any flash data if it exists
        res.render('auth/login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 10;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
};