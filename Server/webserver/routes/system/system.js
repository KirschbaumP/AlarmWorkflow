var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System");

module.exports = function (passport, app, isLoggedIn, isAdmin) {
        require("./users")(passport, app, isLoggedIn, isAdmin);
        require("./jobs")(passport, app, isLoggedIn, isAdmin);
};