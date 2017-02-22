var Logger = require("./../../shared/logger");
var logger = new Logger("WebServer-Routes-Default");

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin)
        return next();
    res.redirect('/');
}

module.exports = function (passport, app, mysql_pool) {
    app.get('/', isLoggedIn, function (req, res) {
        res.render('home/index.ejs');
    });

    require("./auth")(passport, app, mysql_pool, isLoggedIn);
    require("./system/system")(passport, app, mysql_pool, isLoggedIn, isAdmin);
    require("./api/api")(passport, app, mysql_pool, isLoggedIn, isAdmin);
};
