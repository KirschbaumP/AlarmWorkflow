var Logger = require("./../../shared/logger");
var logger = new Logger("WebServer-Routes-Default");
var urlencode = require('urlencode');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login?origin=' + urlencode(req.route.path));
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin)
        return next();
    res.redirect('/login?origin='+urlencode(req.route.path));
}

module.exports = function (passport, app) {
    app.get('/', isLoggedIn, function (req, res) {
        res.render('home/index.ejs');
    });

    require("./auth")(passport, app, isLoggedIn);
    require("./system/system")(passport, app, isLoggedIn, isAdmin);
    require("./management/management")(passport, app, isLoggedIn, isAdmin);
    require("./api/api")(passport, app, isLoggedIn, isAdmin);
};
