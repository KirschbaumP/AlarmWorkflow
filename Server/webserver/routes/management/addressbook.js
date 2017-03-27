var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-Management-Addressbook");

var form = require('express-form');
var field = form.field;

var db = require("./../../../internal/mongodb");
var Kontakt = db.Kontakte;

var prefix = "/management/addressbook";
var vprefix = "management/addressbook/";

module.exports = function (passport, app, isLoggedIn, isAdmin) {
    app.get(prefix + '/', isLoggedIn, function (req, res) {
        res.render(vprefix + 'index.ejs', {});
    });
    app.get(prefix + '/list', isLoggedIn, function (req, res) {
        Kontakt.find({}, function (err, kontakte) {
            if (err)                logger.log(err.toString());
            var kontakte2 = JSON.parse(JSON.stringify(kontakte));
            for (var i in kontakte) {
                kontakte2[i].buttons = "<a class='btn-danger btn delete' href='" + prefix + "/remove/" + kontakte2[i]._id + "'>Löschen</a>";
            }
            res.json({data: kontakte2});
        });
    });
    app.post(prefix + '/create', isAdmin, form(
        field("vorname"),
        field("nachname")
    ), function (req, res) {
        var kontakt = new Kontakt({
            vorname: req.form.vorname,
            nachname: req.form.nachname,
            details:[]
        });
        kontakt.save(function (err, data) {
            if (err)logger.error(err.toString());
            res.json({});
        });
    });
    app.get(prefix + '/details/:id', isLoggedIn, function (req, res) {
        res.render(vprefix + 'details.ejs', {});
    });
    app.get(prefix + '/remove/:id', isLoggedIn, function (req, res) {
        Kontakt.findById(req.params.id, function (err, kontakt) {
            if (err)logger.error(err.toString());
            if (kontakt) {
                kontakt.remove(function (err2) {
                    if (err2)logger.error(err2.toString());
                    res.redirect(prefix + '/');
                });
            }
            else {
                res.redirect(prefix + '/');
            }
        });
    });
};