var bcrypt = require('bcrypt-nodejs');

var form = require('express-form');
var field = form.field;

var Logger = require("./../../../shared/logger");
var logger = new Logger("WebServer-Routes-System-Users");

var prefix = "/system/users";
var vprefix = "system/users/";

module.exports = function (passport, app, mysql_pool, isLoggedIn, isAdmin) {
    app.get(prefix + '/', isAdmin, function (req, res) {
        res.render(vprefix + 'index.ejs');
    });
    app.get(prefix + '/ajax/users', isAdmin, function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('SELECT id, username, admin FROM users', function (error, rows, fields) {
                connection.release();
                if (error) {
                    logger.error(error);
                    res.json({});
                }
                if (err) {
                    logger.error(err);
                    res.json({});
                }

                var data = [];
                for (var i in rows) {
                    var admin = (rows[i].admin == 1 ? "ja" : "nein");
                    var buttons = "<button class='btn-success btn edit' id='" + rows[i].id + "'>Ändern</button>";
                    if (req.user.username != rows[i].username) {
                        admin += " <a class='btn-success btn' href='/system/users/" + (rows[i].admin == 1 ? "removeAdmin" : "addAdmin") + "/" + rows[i].id + "'>" + (rows[i].admin == 1 ? "Rechte entfernen" : "Rechte hinzufügen") + "</a>";
                        buttons += " <a class='btn-danger btn delete' href='" + prefix + "/remove/" + rows[i].id + "'>Löschen</a>";
                    }
                    data.push({
                        id: rows[i].id,
                        username: rows[i].username,
                        admin: admin,
                        buttons: buttons
                    });
                }
                res.json({data: data});
            });
        });
    });

    app.get(prefix + '/removeAdmin/:id', isAdmin, function (req, res) {
        //User can not remove admin rigths of himself
        if(req.user.userId == req.params.id){
            res.redirect(prefix + '/');
            return;
        }
        mysql_pool.getConnection(function (err, connection) {
            connection.query('UPDATE users SET admin=? WHERE id=?',
                [0, req.params.id], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.redirect(prefix + '/');
                });
        });
    });
    app.get(prefix + '/addAdmin/:id', isAdmin, function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('UPDATE users SET admin=? WHERE id=?',
                [1, req.params.id], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.redirect(prefix + '/');
                });
        });
    });

    app.post(prefix + '/edit', isAdmin, form(
        field("id"),
        field("password")
    ), function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('UPDATE users SET password=? WHERE id=?',
                [bcrypt.hashSync(req.form.password, null, null), req.form.id], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.redirect(prefix + '/');
                });
        });
    });

    app.post(prefix + '/edit', isAdmin, form(
        field("id"),
        field("password")
    ), function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('UPDATE users SET password=? WHERE id=?',
                [bcrypt.hashSync(req.form.password, null, null), req.form.id], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.redirect(prefix + '/');
                });
        });
    });

    app.post(prefix + '/create', isAdmin, form(
        field("username"),
        field("password"),
        field("admin")
    ), function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('INSERT INTO users (username, password, admin) VALUES (?, ?, ?)',
                [req.form.username, bcrypt.hashSync(req.form.password, null, null), req.form.admin === "on" ? 1 : 0], function (err1, result) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.json({});
                });
        });
    });

    app.get(prefix + '/check/username/:username', isAdmin, function (req, res) {
        mysql_pool.getConnection(function (err, connection) {
            connection.query('SELECT * FROM users WHERE username=?',
                [req.params.username], function (err1, rows) {
                    if (err1) {
                        logger.error(err1);
                    }
                    connection.release();
                    res.json({count: rows.length});
                });
        });
    });

    app.get(prefix + '/remove/:id', isAdmin, function (req, res) {
        //User can not delete himself
        if(req.user.userId == req.params.id){

            res.redirect(prefix + '/');
            return;
        }
        //Delete User
        mysql_pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM users WHERE id=?', [req.params.id], function (err1, rows) {
                if (err1) {
                    logger.error(err1);
                }
                connection.release();
                res.redirect(prefix + '/');
            });
        });
    });
}