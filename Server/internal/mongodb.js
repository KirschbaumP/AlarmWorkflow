/*var mysql = require('mysql');
 var pool  = mysql.createPool({
 connectionLimit : 5,
 host: process.env.DBHOST,
 port: process.env.DBPORT,
 user: process.env.DBUSER,
 password: process.env.DBPASS,
 database: process.env.DBDATABASE
 });

 module.exports = pool;
 */

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB);

var Schema = mongoose.Schema;


var logsSchema = new Schema({
    message: String,
    source: String,
    level: Number,
    timestamp: {type: Date, default: Date.now}
});
logsSchema.methods.getLevel = function () {
    switch (this.level) {
        case 0:
            return "DEBUG";
        case 1:
            return "INFORMATION";
        case 2:
            return "WARNING";
        case 3:
            return "ERROR";
        case 4:
            return "FATAL";
        default:
            return "UNKNOWN";
    }
}
var Logs = mongoose.model('logs', logsSchema);

var settingsSchema = new Schema({
    settingsname: {type: String, required: true, unique: true},
    value: Schema.Types.Mixed
});
var Settings = mongoose.model('settings', settingsSchema);

module.exports = {
    connection: mongoose,
    Logs: Logs,
    Settings: Settings,
};