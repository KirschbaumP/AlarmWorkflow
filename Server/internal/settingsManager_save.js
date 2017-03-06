var mysql = require("./database");


module.exports = {
    getSetting: function (name, callback) {
        mysql.getConnection(function (err, connection) {
            connection.query('SELECT * FROM settings WHERE settingname=?',
                [name], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                        callback({});
                    }
                    connection.release();
                    if (result.length == 0) {
                        callback(null);
                    }
                    else {
                        callback(JSON.parse(result[0].value));
                    }
                });
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