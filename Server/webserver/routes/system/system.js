var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System");

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
        require("./users")(passport, app, mysql_pool, isLoggedIn, isAdmin);
        require("./jobs")(passport, app, mysql_pool, isLoggedIn, isAdmin);
};