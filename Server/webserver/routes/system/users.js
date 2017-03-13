var bcrypt = require('bcrypt-nodejs');

var form = require('express-form');
var field = form.field;

var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System-Users");

var prefix = "/system/users";
var vprefix = "system/users/";

var mongo = require("./../../../internal/mongodb");
var Users = mongo.Users;

module.exports = function (passport, app, isLoggedIn, isAdmin) {
    app.get(prefix + '/', isAdmin, function (req, res) {
        res.render(vprefix + 'index.ejs');
    });
    app.get(prefix + '/ajax/users', isAdmin, function (req, res) {
        Users.find(function (err, users) {
            if (err) {
                logger.error(err.toString());
                res.json({});
            }
            else if (users) {
                var data = [];
                for (var i in users) {
                    var admin = (users[i].admin == 1 ? "ja" : "nein");
                    var buttons = "<button class='btn-success btn edit' id='" + users[i].id + "'>Ändern</button>";
                    if (req.user.username != users[i].username) {
                        admin += " <a class='btn-success btn' href='/system/users/" + (users[i].admin == 1 ? "removeAdmin" : "addAdmin") + "/" + users[i].id + "'>" + (users[i].admin == 1 ? "Rechte entfernen" : "Rechte hinzufügen") + "</a>";
                        buttons += " <a class='btn-danger btn delete' href='" + prefix + "/remove/" + users[i].id + "'>Löschen</a>";
                    }
                    data.push({
                        id: users[i].id,
                        username: users[i].username,
                        admin: admin,
                        buttons: buttons
                    });
                }
                res.json({data: data});
            }
            else {
                res.json({});
            }
        });
    });

    app.get(prefix + '/removeAdmin/:id', isAdmin, function (req, res) {
        //User can not remove admin rigths of himself
        if (req.user.userId == req.params.id) {
            res.redirect(prefix + '/');
        }
        Users.findByIdAndUpdate(req.params.id, {admin: false}, function (err, user) {
            if (err)logger.error(err.toString());
            res.redirect(prefix + '/');
        });
    });
    app.get(prefix + '/addAdmin/:id', isAdmin, function (req, res) {
        Users.findByIdAndUpdate(req.params.id, {admin: true}, function (err, user) {
            if (err)logger.error(err.toString());
            res.redirect(prefix + '/');
        });
    });

    app.post(prefix + '/edit', isAdmin, form(
        field("id"),
        field("password")
    ), function (req, res) {
        Users.findByIdAndUpdate(req.form.id, {password: bcrypt.hashSync(req.form.password, null, null)}, function (err, user) {
            if (err)logger.error(err.toString());
            res.redirect(prefix + '/');
        });
    });

    app.post(prefix + '/create', isAdmin, form(
        field("username"),
        field("password"),
        field("admin")
    ), function (req, res) {
        Users.count({username: req.form.username}, function (err, count) {
            if (err)logger.error(err.toString());
            if (count == 0) {
                var user = new Users({
                    username: req.form.username,
                    password: bcrypt.hashSync(req.form.password, null, null),
                    admin: req.form.admin === "on"
                });
                user.save(function (err2, data) {
                    if (err2)logger.error(err2.toString());
                    res.json({});
                });
            }
            else {
                res.json({});
            }
        });
    });

    app.get(prefix + '/check/username/:username', isAdmin, function (req, res) {
        Users.count({username: req.params.username}, function (err, count) {
            if (err)logger.error(err.toString());

            res.json({count: count});
        });
    });

    app.get(prefix + '/remove/:id', isAdmin, function (req, res) {
        //User can not delete himself
        if (req.user.userId == req.params.id) {

            res.redirect(prefix + '/');
            return;
        }
        //Delete User
        Users.findById(req.params.id, function (err, user) {
            if (err)logger.error(err.toString());
            if (user) {
                // delete him
                user.remove(function (err2) {
                    if (err2)logger.error(err2.toString());
                    res.redirect(prefix + '/');
                });
            }
            else {
                res.redirect(prefix + '/');
            }
        });
    });
}