var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Api-Alarm");
var jobManager = require("./../../../jobs/jobManager");
var parserManager = require("./../../../parsers/parserManager");

var form = require('express-form');
var field = form.field;

var prefix = "/api/alarm";

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    app.post(prefix + '/new', form(
        field("txt"),
        field("tif"),
        field("parser")
    ), function (req, res) {
        if (req.form.isValid) {
            // Parse Fax
            parserManager.parse(req.form.txt, req.form.parser, function (operation) {
                operation.source = "fax";
                // Set FilePaths
                operation.txtFile = req.form.txt;
                operation.tifFile = req.form.tif;

                // Execute Jobs
                // TODO:Execute Jobs


                res.json(operation);
            }, function (err) {
                res.json({result: "error", message: err});
            });
        }
        else {
            res.json({result: "error", message: "Parameter fehlen"});
        }
    });
};