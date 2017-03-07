var db = require("./../internal/mongodb");
var Settings = db.Settings;
var Logger = require("./../shared/logger");
var logger = new Logger("SettingsManager");

module.exports = {
    getSetting: function (name, callback) {
        console.log(name);
        Settings.findOne({settingsname: name}, function (err, setting) {
            if (err) {
                logger.error(err);
                callback({});
            }
            console.log(setting);
            if (setting) {
                callback(setting);
                console.log("1");
            }
            else {
                callback(new Settings({settingsname: name, value: {}}));
                console.log("2");
            }
        });
    },
    setSetting: function (value) {
        setSettingCb(name, value, function () {
        });
    },
    setSettingCb: function (value, callback) {
        value.save(function (err) {
            if (err) {
                logger.error(err.toString());
                console.log(err.toString());
            }
            callback();
        });
    }
};