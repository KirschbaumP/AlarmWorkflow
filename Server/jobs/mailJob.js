var Logger = require("./../shared/logger");
var logger = new Logger("Job-Mail");
var settings = require("./../internal/settingsManager");
var transporter = null;
var nodemailer = require('nodemailer');

var formatter = require("./../internal/formatter");

var db = require("./../internal/mongodb");
var Settings = db.Settings;

var mail_data = {};


var mailJob = function () {
};

mailJob.prototype.getProperties = function () {
    return {
        id: 'mailJob',
        name: 'Mail Job',
        logName: 'Job-Mail',
        preJob: false,
        settings: [
            {
                id: "smtphost",
                name: "SMTP-Server",
                description: "Der SMTP-Server über den Mails versendet werden.",
                settingType: "string",
                defaultValue: "",
                checktype: "regex",
                checkRegex: /^([\w\däöü]([\w\-äöü]*[\w\däöü]+)*[.]?)*([\w\däöü]([\w\-äöü]*[\w\däöü]+)?)$/i
            },
            {
                id: "smtpport",
                name: "SMTP-Server-Port",
                description: "Port des SMTP-Servers.",
                settingType: "number",
                defaultValue: 587,
                checktype: "function",
                check: function (value) {
                    return value.toString() != "" && value >= 0 && value < 65535;
                }
            },
            {
                id: "smtpuser",
                name: "Benutzername",
                description: "Benutzername zum anmelden am SMTP-Server.",
                settingType: "string",
                defaultValue: "demobenutzer",
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
            {
                id: "smtppass",
                name: "Passwort",
                description: "Passwort zum anmelden am SMTP-Server.",
                settingType: "password",
                defaultValue: "",
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
            {
                id: "smtpssl",
                name: "SSL benutzen",
                description: "Stellt die Verbindung SSL-geschützt her.",
                settingType: "bool",
                defaultValue: true,
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
            {
                id: "mailabsenderadresse",
                name: "Absenderadresse",
                description: "Die Mail-Adresse die dem Empfänger angezeigt wird.",
                settingType: "string",
                defaultValue: "",
                checktype: "regex",
                checkRegex: /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9]*\.[a-z]+(\.[a-z]+)?$/
            },
            {
                id: "mailbetreff",
                name: "Betreff",
                description: "Der Betreff der Mail.",
                settingType: "string",
                defaultValue: "Einsatz",
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
            {
                id: "mailtext",
                name: "Nachrichtentext",
                description: "Die Vorlage der zu versenden Mail.",
                settingType: "text",
                defaultValue: "",
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
            {
                id: "mailattachfax",
                name: "Fax anhängn",
                description: "Ob das Fax an die Mail als Anhang mitgeschickt wird.",
                settingType: "bool",
                defaultValue: true,
                checktype: "function",
                check: function (value) {
                    return true;
                }
            },
        ]
    };
};
mailJob.prototype.initialize = function (settings, success, failed) {
    var info = mailJob.prototype.getProperties();
    if (settings == null) {

        var default_data = {};
        for (var i in info.settings) {
            default_data[info.settings[i].id] = info.settings[i].defaultValue;
        }
        default_data.active = false;
        var save_value = new Settings({settingname: info.id, value: default_data});
        settings.setSettingCb(save_value, function (err1) {
            if (err1) {
                logger.error(err1);
                failed(info.id, err1.toString());
            }
            else {
                success(info.id);
            }
        });
    }
    else {
        var data = settings.value;
        transporter = nodemailer.createTransport({
            host: data.smtphost,
            port: data.smtpport,
            auth: {
                user: data.smtpuser,
                pass: data.smtppass
            }
        });
        transporter.verify(function (err, suc) {
            if (err) {
                logger.error(err);
                failed(info.id, err.toString());
            }
            else if (suc == true) {
                mail_data = {
                    betreff: data.mailbetreff,
                    body: data.mailtext,
                    attach: data.mailattachfax,
                    absender: data.mailabsenderadresse
                };
                success(info.id);
            }
            else {
                failed(info.id, "Authentification failed")
            }
        });
    }
};
mailJob.prototype.doJob = function (operation, recipients, options) {
    if (transporter != null) {
        var mailoptions = {
            from: mail_data.absender,
            subject: mail_data.betreff,
            text: formatter.formatOperation(operation, mail_data.body)
        };
        if (mail_data.attach) {
            mailoptions.attachments = [
                {
                    filename: 'Fax.tif',
                    path: operation.filePath
                }
            ];
        }
        transporter.sendMail(mailoptions, function () {
            //TODO: BREAK: callback parameter überprüfen/nachschauen
            //TODO: Loggen
        });
    }
};

module.exports = new mailJob();