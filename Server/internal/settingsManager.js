var db = require("./mongodb");
var Settings = db.Settings;
var Logger = require("./../shared/logger");
var logger = new Logger("SettingsManager");

module.exports = {
    getSetting: function (name, callback) {
        Settings.findOne({settingsname: name}, function (err, setting) {
            if (err) {
                logger.error(err);
                callback({});
            }
            if (setting) {
                callback(setting);
            }
            else {
                callback(new Settings({settingsname: name, value: {}}));
            }
        });
    },
    setSetting: function (value) {
        setSettingCb(name, value, function () {
        });
    },
    setSettingCb: function (value, callback) {
        var data = value.value;
        value.value = null;
        value.value = data;
        value.save(function (err) {
            if (err) {
                logger.error(err.toString());
            }
            callback();
        });
    }
};