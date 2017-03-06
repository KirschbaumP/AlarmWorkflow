var db = require("./../internal/mongodb");
var Logs = db.Logs;

var getLevel = function (level) {
    switch (level) {
        case 0:
        default:
            return "DEBUG";
        case 1:
            return "INFORMATION";
        case 2:
            return "WARNING";
        case 3:
            return "ERROR";
        case 4:
            return "FATAL";
    }
}

var logger = function (source) {
    this.source = source;
}

logger.prototype.debug = function (messgage) {
    this.log(messgage, 0);
}
logger.prototype.information = function (messgage) {
    this.log(messgage, 1);
}
logger.prototype.warning = function (messgage) {
    this.log(messgage, 2);
}
logger.prototype.error = function (messgage) {
    this.log(messgage, 3);
}
logger.prototype.fatal = function (messgage) {
    this.log(messgage, 4);
}

logger.prototype.log = function (message, level) {
    var source = this.source;
    var log = new Logs({
        message: message,
        level: level,
        source: source
    });
    log.save(function (err) {
        if (err) throw err;
    });
}

logger.prototype.getAllLogs = function (callback) {
    Logs.find({}, function (error, result) {
        callback(error, result);
    });
}

logger.prototype.getAllDetailLogs = function (source, callback) {
    Logs.find({source: source}, function (error, result) {
        callback(error, result);
    });
}

module.exports = logger;