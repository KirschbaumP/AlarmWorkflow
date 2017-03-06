var db = require("./../internal/mongodb");
var Settings = db.Settings;
var Logger = require("./../shared/logger");
var logger = new Logger("SettingsManager");

module.exports = {
    getSetting: function (name, callback) {
        Settings.findOne({settingname: name},function (err, setting) {
            if(err){
                logger.error(err);
                callback({});
            }
            callback(setting);
        });
    },
    setSetting: function (name, jsonValue) {
        mysql.getConnection(function (err, connection) {
            connection.query('REPLACE INTO  settings SET settingname=?, value=?',
                [name, JSON.stringify(jsonValue)], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                });
        });
    },
    setSettingCb: function (name, jsonValue, callback) {
        mysql.getConnection(function (err, connection) {
            connection.query('REPLACE INTO  settings SET settingname=?, value=?',
                [name, JSON.stringify(jsonValue)], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    callback(err1);
                });
        });
    }
};