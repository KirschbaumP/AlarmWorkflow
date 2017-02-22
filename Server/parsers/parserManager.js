var fs = require('fs');
var path = require('path');

var Logger = require("./../shared/logger");
var logger = new Logger("parserManager");

module.exports = {
    setParser: function (name) {
        this.parser = require("./" + name);
    },
    getCurrentParserProperties: function () {
        return this.parser.getProperties();
    },
    parse: function (file) {
        if (!this.parser) {
            throw "Parser nicht initialisiert!!!";
        }

        //TODO: Pfad absolut???
        var rawlines = fs.readFileSync(path.join("fax", file)).toString().split("\n");
        //Remove all empty lines
        var lines = [];
        for (i in rawlines) {
            rawlines[i] = rawlines[i].trim()
            if (rawlines[i] !== "") {
                lines.push(rawlines[i]);
            }
        }
        //Parse the Lines
        var operation = this.parser.parse(lines);

        return operation;
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