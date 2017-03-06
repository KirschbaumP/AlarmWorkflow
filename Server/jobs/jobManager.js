var fs = require('fs');
var path = require('path');

var Logger = require("./../shared/logger");
var logger = new Logger("jobManager");

var settingsManager = require('./../internal/settingsManager');
activeJobs = [];

module.exports = {
    initJobs: function (callback) {
        activeJobs = [];
        var files = fs.readdirSync(__dirname);
        var init = function (files, i) {
            var proceed = function (files, i) {
                if (files.length > ++i) {
                    init(files, i);
                }
                else {
                    logger.information("Jobs initialized");
                    callback(activeJobs);
                }
            };
            //file ends with .js and is not parserManager.js or parserUtilities.js
            if (files[i].match(/\.js$/) && files[i].match(/^((?!((jobManager\.js))).)*$/)) {
                try {
                    settingsManager.getSetting(files[i].replace(".js", ""), function (value) {
                        if (!value) {
                            //Initialisierung wenn keine Einstellungen vorhanden sind
                            require("./" + files[i]).initialize(value, function (jobName) {
                                logger.information(jobName + ": successful FIRST-TIME initialization");
                                proceed(files, i);
                            }, function (jobName, err) {
                                logger.information(jobName + ": FIRST-TIME initialization FAILED");
                                logger.error(err);
                                proceed(files, i);
                            });
                        }
                        else if (value.active) {
                            require("./" + files[i]).initialize(value, function (jobName) {
                                activeJobs.push(jobName);
                                logger.information(jobName + ": successful initialized");
                                proceed(files, i);
                            }, function (jobName, err) {
                                logger.warning(jobName + ": initialing FAILED");
                                logger.error(err);
                                proceed(files, i);
                            });
                        }
                        else {
                            proceed(files, i);
                        }
                    });
                }
                catch (exp) {
                    logger.error(exp.toString());
                    proceed(files, i);
                }
            }
            else {
                proceed(files, i);
            }
        };
        if (files.length > 0) {
            init(files, 0);
        }
    },
    getAllJobsInformations: function () {
        var jobs = [];
        var files = fs.readdirSync(__dirname);

        for (var i = 0; i < files.length; i++) {
            //file ends with .js and is not parserManager.js or parserUtilities.js
            if (files[i].match(/\.js$/) && files[i].match(/^((?!((jobManager\.js))).)*$/)) {
                try {
                    var data = require("./" + files[i]).getProperties();

                    data.filename = files[i];
                    jobs.push(data);
                }
                catch (exp) {
                    logger.error(exp.toString());
                }
            }
        }
        return jobs;
    }
    ,
    getJobInformations: function (jobName) {
        return require("./" + jobName).getProperties();
    },
    getActiveJobs:function () {
        return activeJobs;
    }
};