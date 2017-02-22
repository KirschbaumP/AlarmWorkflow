var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Api-Alarm");
var jobManager = require("./../../../jobs/jobManager");

var form = require('express-form');
var field = form.field;

var prefix = "/api/alarm";

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    app.post(prefix + '/new', form(
        field("txt"),
        field("tif")
    ), function (req, res) {
       // req.form.id
        console.log(req.form.txt);
        console.log(req.form.tif);
        res.json({result:"OK"});
    });
};