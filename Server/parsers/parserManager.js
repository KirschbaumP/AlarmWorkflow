var fs = require('fs');
var path = require('path');

var Logger = require("./../shared/logger");
var logger = new Logger("parserManager");

module.exports = {
    parse: function (file, parserName, callback, error) {
        var parser = null;
        try {
            parser = require("./" + parserName);
        }
        catch (ex) {
            console.log(ex);
            error("Fehler: Keinen Parser gefunden");
            return;
        }
        if (parser == null) {
            error("Fehler: Keinen Parser gefunden");
            return;
        }
        else {
            var rawlines = fs.readFileSync(file).toString().split("\n");
            //Remove all empty lines
            var lines = [];
            for (i in rawlines) {
                rawlines[i] = rawlines[i].trim()
                if (rawlines[i] !== "") {
                    lines.push(rawlines[i]);
                }
            }
            //Parse the Lines
            parser.parse(lines, function (operation) {
                //Save operation to DB
                operation.save(function (err, new_operation) {
                    if (err) {
                        logger.error(err.toString());
                        error(err.toString());
                    }
                    else {
                        callback(new_operation);
                    }
                });
            });
        }
    },
    getAllParserInformations: function () {
        var parser = [];
        var files = fs.readdirSync(__dirname);

        for (var i = 0; i < files.length; i++) {
            //file ends with .js and is not parserManager.js or parserUtilities.js
            if (files[i].match(/\.js$/) && files[i].match(/^((?!((parserManager\.js)|(parserUtilities\.js))).)*$/)) {
                try {
                    var data = require("./" + files[i]).getProperties();
                    data.filename = files[i];
                    parser.push(data);
                }
                catch (exp) {
                    logger.error(exp);
                }
            }
        }
        return parser;
    }
};