var fs = require('fs');
var path = require('path');

var Logger = require("./../shared/logger");
var logger = new Logger("jobManager");

module.exports = {
    initJobs: function () {
        var files = fs.readdirSync(__dirname);

        for (var i = 0; i < files.length; i++) {
            //file ends with .js and is not parserManager.js or parserUtilities.js
            if (files[i].match(/\.js$/) && files[i].match(/^((?!((jobManager\.js))).)*$/)) {
                try {
                    require("./" + files[i]).initialize();
                }
                catch (exp) {
                    logger.error(exp.toString());
                }
            }
        }
    },
    getAllJobsInformations: function () {
        var jobs = [];
        var files = fs.readdirSync(__dirname);

        for (var i = 0; i < files.length; i++) {
            //file ends with .js and is not parserManager.js or parserUtilities.js
            if (files[i].match(/\.js$/) && files[i].match(/^((?!((jobManager\.js))).)*$/)) {
                //try {
                    var data = require("./" + files[i]).getProperties();

                    //TEST
                    //TEST
                    //TEST
                    //require("./" + files[i]).initialize();
                    //TEST
                    //TEST
                    //TEST

                    data.filename = files[i];
                    jobs.push(data);
                //}
                //catch (exp) {
                //    logger.error(exp.toString());
                //}
            }
        }
        return jobs;
    },
    getJobInformations: function (jobName) {
        return require("./" + jobName).getProperties();
    }
};