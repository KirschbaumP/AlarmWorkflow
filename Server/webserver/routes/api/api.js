var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Api");

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    require("./alarm")(passport, app, mysql_pool, isLoggedIn, isAdmin);
};