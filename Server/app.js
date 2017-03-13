// Start Webserver
var webServer = require("./webserver/webserverManager");

var app = webServer.initialize();

var jobs = require('./jobs/jobManager');
jobs.initJobs(function (activeJobs) {
    webServer.start(app);
});