var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Api");

module.exports = function (passport, app, isLoggedIn, isAdmin) {
    require("./alarm")(passport, app, isLoggedIn, isAdmin);
};