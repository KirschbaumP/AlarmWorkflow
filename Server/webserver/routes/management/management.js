var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Management");

module.exports = function (passport, app, isLoggedIn, isAdmin) {
    require("./addressbook")(passport, app, isLoggedIn, isAdmin);
    //require("./profils")(passport, app, isLoggedIn, isAdmin);
    //require("./events")(passport, app, isLoggedIn, isAdmin);
};