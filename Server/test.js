var parserManager = require("./parsers/parserManager");
parserManager.setParser("fezMuenchenLand");

//console.log(parserManager.getCurrentParserProperties());
//console.log(parserManager.parse("test.txt"));

console.log(parserManager.getAllParserInformations());