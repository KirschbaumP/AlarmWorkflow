// Load Configuration
var mysql_pool = require("./internal/database");

// Start Webserver
var webServer = require("./webserver/webserverManager");

var app = webServer.initialize(mysql_pool);


webServer.start(app);