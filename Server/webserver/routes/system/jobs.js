var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System-Jobs");
var jobManager = require("./../../../jobs/jobManager");
var settingManager = require("./../../../internal/settingsManager");

var prefix = "/system/jobs";
var vprefix = "system/jobs/";

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    app.get(prefix + '/', isAdmin, function (req, res) {
        res.render(vprefix + 'index.ejs', {});
    });
    app.get(prefix + '/list', isAdmin, function (req, res) {
        var data = [];

        var jobs = jobManager.getAllJobsInformations();
        var iteration = function (jobs, i) {
            var proceed = function (jobs, i) {
                if (jobs.length > ++i) {
                    iteration(jobs, i);
                }
                else {
                    res.json({data: data});
                }
            };
            settingManager.getSetting(jobs[i].id, function (value) {
                var button = "";
                if (value) {
                    if (value.value.active) {
                        button = "<a href='/system/jobs/disable/" + jobs[i].id + "' class='btn btn-large btn-warning'>Deaktivieren</a>";
                    }
                    else {
                        button = "<a href='/system/jobs/enable/" + jobs[i].id + "' class='btn btn-large btn-success'>Aktivieren</a>";
                    }
                }

                data.push({
                    job: "<a href='/system/jobs/" + jobs[i].id + "'>" + jobs[i].name + "</a>",
                    buttons: button
                });
                proceed(jobs, i);
            });
        };
        if (jobs.length > 0) {
            iteration(jobs, 0);
        }
    });

    app.get(prefix + '/disable/:job', isAdmin, function (req, res) {
        settingManager.getSetting(req.params.job, function (value) {
            if (value) {
                value.active = false;
                settingManager.setSettingCb(req.params.job, value, function (err) {
                    res.redirect(prefix + '/');
                });
            }
        });
    });

    app.get(prefix + '/enable/:job', isAdmin, function (req, res) {
        settingManager.getSetting(req.params.job, function (value) {
            if (value) {
                value.value.active = true;
                settingManager.setSettingCb(req.params.job, value, function (err) {
                    res.redirect(prefix + '/');
                });
            }
        });
    });

    app.get(prefix + '/log/:job', isAdmin, function (req, res) {
        logger.getAllDetailLogs(req.params.job, function (error, rows) {
            if (error) logger.error(error);

            var data = [];
            for (var i in rows) {
                data.push({
                    time: rows[i].timestamp.toLocaleString(),
                    level: rows[i].getLevel(),
                    message: rows[i].message
                });
            }

            res.json({data: data});
        });
    });

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

        settingManager.getSetting(job.id, function (settings) {
            res.render(vprefix + 'details.ejs', {
                job: job,
                settings: settings.value,
                getValue: function (num) {
                    var item = job.settings[num];
                    return this.settings[item.id] ? this.settings[item.id] : item.defaultValue;
                }
            });
        })
    });

    app.post(prefix + '/save/:job', isAdmin, function (req, res) {
        var jobInfos = jobManager.getJobInformations(req.params.job);
        settingManager.getSetting(req.params.job, function (settings) {
            var data = settings.value;
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
            console.log(data);
            settings.value = data;
            console.log(settings);
            settingManager.setSettingCb(settings, function (err) {
                if (err)
                    res.json({result: "error"});
                else
                    res.json({result: "success"});
            });
        });
    });
};