var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System-Jobs");
var jobManager = require("./../../../jobs/jobManager");
var settingManager = require("./../../../internal/settingsManager");

var prefix = "/system/jobs";
var vprefix = "system/jobs/";

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    app.get(prefix + '/log/:job', isAdmin, function (req, res) {
        logger.getAllDetailLogs(req.params.job, function (error, rows, fields) {
            if (error) logger.error(error);

            var data = [];
            for (var i in rows) {
                data.push({
                    time: rows[i].timestamp,
                    level: rows[i].level,
                    message: rows[i].message
                });
            }

            res.json({data: data});
        })
    });
    ;
    app.get(prefix + '/check', isAdmin, function (req, res) {
        var jobInfos = jobManager.getJobInformations(req.query.job);
        var settings = jobInfos.settings.filter(function (value) {
            return value.id == req.query.setting;
        })

        if (settings) {
            var setting = settings[0];
            if (setting.checktype == "regex") {
                res.json({
                    result: setting.checkRegex.test(req.query.value),
                    setting: req.query.setting
                });
            }
            else if (setting.checktype == "function") {
                res.json({
                    result: setting.check(req.query.value),
                    setting: req.query.setting
                });
            }
            else {
                res.json({result: "error1"});
            }
        }
        else {
            res.json({result: "error2"});
        }
    });


    app.get(prefix + '/:job/', isAdmin, function (req, res) {
        var jobs = jobManager.getAllJobsInformations();
        var job = {};
        for (var i = 0; i < jobs.length; i++) {
            if (jobs[i].id == req.params.job) {
                job = jobs[i];
                break;
            }
        }

        settingManager.getSetting("mailjob", function (settings) {
            res.render(vprefix + 'details.ejs', {
                job: job,
                settings: settings,
                getValue: function (num) {
                    var item = job.settings[num];
                    return settings[item.id] ? settings[item.id] : item.defaultValue;
                }
            });
        })
    });

    app.post(prefix + '/save/:job', isAdmin, function (req, res) {
        var jobInfos = jobManager.getJobInformations(req.params.job);
        settingManager.getSetting(req.params.job, function (data) {
            for (var i in req.body) {
                var tempSettigs = jobInfos.settings.filter(function (value) {
                    return i == value.id
                });
                if (tempSettigs) {
                    switch (tempSettigs[0].settingType) {
                        case "string":
                        case "password":
                        case "text":
                            data[i] = req.body[i];
                            break;

                        case "number":
                            data[i] = parseInt(req.body[i]);
                            break;

                        case "bool":
                            data[i] = JSON.parse(req.body[i]);
                            break;

                        case "list":
                            break;

                        default:

                    }
                }
            }
            settingManager.setSettingCb(req.params.job, data,function (err) {
                if(err)
                    res.json({result: "error"});
                else
                    res.json({result: "success"});
            });
        });
    });
};