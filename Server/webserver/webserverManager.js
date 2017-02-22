var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');
var engine = require('ejs-locals');

var routes = require("./routes/default");
var Logger = require("./../shared/logger");
var logger = new Logger("WebServer");
var morgan = require('morgan');

var jobManager = require('./../jobs/jobManager');

var initialize = function (mysql) {
    require('./internal/auth')(passport);
    logger.debug("Start init Webserver");
    app = express();
    app.use(morgan('dev'));

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    // view engine setup
    app.engine('ejs', engine);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use('/static', express.static(__dirname + '/public'/*, { maxAge: 2592000000 }*/));

    var sessionSecret = process.env.SESSIONSECRET;
    if (!sessionSecret || sessionSecret === "") {
        //TODO: Session secret muss gesetzt werden
    }
    app.use(session({
        secret: sessionSecret,
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(function (req, res, next) {
        res.locals.isAuthenticated = req.isAuthenticated();
        res.locals.user = req.user;
        if(req.user && req.user.isAdmin) {
            res.locals.jobs = jobManager.getAllJobsInformations();
        }
        next();
    });

    routes(passport, app, mysql);

    logger.information("Webserver initialized");
    return app;
}


var start = function (app) {
    logger.debug("Starting Webserver");
    var port = process.env.PORT;
    if (!port.match(/^((6((5((5((3[0-5])|([0-2][0-9])))|([0-4][0-9]{0,2})))|([0-4][0-9]{0,3})))|([0-5]{0,1}[0-9]{1,4}))$/)) {
        port = 3000;
        logger.warning("Der angegebene Port muss zwischen 0 und 65535 liegen");
    }

    app.listen(port, function () {
        logger.information('Webserver listen on port ' + port);
    });
};

module.exports.initialize = initialize;
module.exports.start = start;