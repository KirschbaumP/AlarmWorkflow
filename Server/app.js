// Load Configuration
var db = require("./internal/database");

// Start Webserver
var webServer = require("./webserver/webserverManager");

var app = webServer.initialize(db);

var jobs = require('./jobs/jobManager');
jobs.initJobs(function (activeJobs) {
    webServer.start(app);
});