var mysql_pool = require("./../internal/database");


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

    mysql_pool.getConnection(function (err, connection) {
        connection.query('INSERT INTO logs (message, source, level) VALUES (?,?,?)', [message, source, level], function (error, result, fields) {
            connection.release();
            if (error) throw error;
            console.log("Log: id: " + result.insertId + "; Source: " + source + "; Message: " + message + "; Level: " + getLevel(level));
        });
    });
}

logger.prototype.getAllLogs = function (callback) {
    mysql_pool.getConnection(function (err, connection) {
        connection.query('SELECT * FROM logs ORDER BY timestamp desc', function (error, results, fields) {
            callback(error, results, fields);
            connection.release();
        });
    });
}

logger.prototype.getAllDetailLogs = function (source, callback) {
    mysql_pool.getConnection(function (err, connection) {
        connection.query('SELECT id, message, level, timestamp FROM logs WHERE source=? ORDER BY timestamp DESC', [source], function (error, results, fields) {
            connection.release();
            callback(error, results, fields);
        });
    });
}

module.exports = logger;