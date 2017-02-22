var parserUtilities = require("./parserUtilities");
var Operation = require("./../shared/operation");

var fezMuenchenLand = function () {
    this.Keywords = {
        einsatznr: /(EINSATZNR)/gi,
        einsatznr_number: /(\d+)(?=[\s]*Alarm)/gi,
        einsatznr_type: /(T|B|S)/g,
        time: /\d+\.\d+\.\d{4}\s+\d+:\d+/g,
        mitteiler: /(MITTEILER)/gi,
        einsatzort: /(EINSATZORT)/gi,
        strasse: /(STRA(ß|S+)E)/gi,
        streetnumber: /(\d+.*)(?!.*\d)/gi,
        streetname: /(\d+.*)(?!.*\d)/gi,
        abschnitt: /(ABSCHNITT)/gi,
        kreuzung: /(KREUZUNG)/gi,
        ort: /(ORTSTEIL\/ORT)/gi,
        objekt: /(OBJEKT)/gi,
        einsatzplan: /(EINSATZPLAN)/gi,
        meldebild: /(MELDEBILD)/gi,
        hinweis: /(HINWEIS)/gi,
        einsatzmittel: /(GEFORDERTE[\s]*EINSATZMITTEL)/gi,
        koordinaten: /(KOORDINATEN)/gi,
        ende: /(\(ALARMSCHREIBEN[\s]*ENDE\))/gi
    };
};

fezMuenchenLand.prototype.getProperties = function () {
    return {
        name: 'FEZ München Land'
    };
};

fezMuenchenLand.prototype.parse = function (lines) {
    var operation = new Operation();
    for (var i = 0; i < lines.length; i++) {
        // Einsatznummer und Alarmzeit
        if (this.Keywords.einsatznr.test(lines[i])) {
            var operationNumber = lines[i].match(this.Keywords.einsatznr_number);
            var operationType = lines[i].match(this.Keywords.einsatznr_type);
            if (operationNumber.length != 0 && operationType.length != 0) {
                operation.OperationNumber = operationType + ' ' + operationNumber;
            }

            var regexResult = lines[i].match(this.Keywords.time);
            if (regexResult.length != 0) {
                var operationDateTime = regexResult[0].split(" ");
                if (operationDateTime.length > 1) {
                    var operationDate = operationDateTime[0].match(/\d+/g)
                    if (operationDate.length > 2) {
                        var parseDate = operationDate[1] + '-' + operationDate[0] + '-' + operationDate[2];
                        operation.TimeStamp = new Date(Date.parse(parseDate + ' ' + operationDateTime[1]));
                    }
                }
            }
            if (operation.TimeStamp.toString() == "Invalid Date") {
                operation.TimeStamp = operation.TimeStampIncome;
            }
        }
        //Mitteiler
        else if (this.Keywords.mitteiler.test(lines[i])) {
            operation.Messenger = parserUtilities.getLineValue(lines[i], this.Keywords.mitteiler);
        }
        //Einsatzort
        else if (this.Keywords.einsatzort.test(lines[i])) {
            operation.Location = parserUtilities.getLineValue(lines[i], this.Keywords.einsatzort);
        }
        //Straße
        else if (this.Keywords.strasse.test(lines[i])) {
            var result = parserUtilities.getLineValue(lines[i], this.Keywords.strasse);
            operation.StreetNumber = result.match(this.Keywords.streetnumber)[0].trim();
            operation.Street = result.replace(operation.StreetNumber, "").trim();
        }
        //Abschnitt
        else if (this.Keywords.abschnitt.test(lines[i])) {
            operation.Abschnitt = parserUtilities.getLineValue(lines[i], this.Keywords.abschnitt);
        }
        //Kreuzung
        else if (this.Keywords.kreuzung.test(lines[i])) {
            operation.Intersection = parserUtilities.getLineValue(lines[i], this.Keywords.kreuzung);
        }
        //Ort
        else if (this.Keywords.ort.test(lines[i])) {
            operation.City = parserUtilities.getLineValue(lines[i], this.Keywords.ort);
        }
        //Koordinaten
        else if (this.Keywords.koordinaten.test(lines[i])) {
            //TODO GK-Koordinaten
            //operation.Location = parserUtilities.getLineValue(lines[i], this.Keywords.abschnitt);
        }
        //Objekt
        else if (this.Keywords.objekt.test(lines[i])) {
            operation.Property = parserUtilities.getLineValue(lines[i], this.Keywords.objekt);
        }
        //Einsatzplan
        else if (this.Keywords.einsatzplan.test(lines[i])) {
            operation.OperationPlan = parserUtilities.getLineValue(lines[i], this.Keywords.einsatzplan);
        }
        //Meldebild
        else if (this.Keywords.meldebild.test(lines[i])) {
            operation.Picture = parserUtilities.getLineValue(lines[i], this.Keywords.meldebild);
        }
        //Hinweis
        else if (this.Keywords.hinweis.test(lines[i])) {
            operation.Comment = parserUtilities.getLineValue(lines[i], this.Keywords.hinweis);
        }
        //Einsatzmittel
        else if (this.Keywords.einsatzmittel.test(lines[i])) {
            for (var j = i++; j < lines.length; j++) {
                i++;
                if (this.Keywords.ende.test(lines[j])) {
                    return operation;
                }
                operation.Resources.push(lines[j]);
            }
        }

    }

    return operation;
};

module.exports = new fezMuenchenLand();