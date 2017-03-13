var db = require("./../../internal/mongodb");
var Users = db.Users;
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var Logger = require("./../../shared/logger");
var logger = new Logger("Webserver-Auth");

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Users.findById(id, function (err, data) {
            if (err) logger.error(err.toString());

            var user = {
                userId: data._id,
                username: data.username,
                isAdmin: data.admin
            };
            done(err, user);
        });
    });


    passport.use(
        'local-signup',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                Users.count({}, function (err, c) {
                    if (err) {
                        logger.error(err.toString());
                        return done(error);
                    }

                    if (!c || (c && c != 0)) {
                        return done(null, false, req.flash('signupMessage', 'Dieser Benutzername wird schon benutzt.'));
                    }

                    var user = new Users({
                        username: username,
                        password: bcrypt.hashSync(password, null, null),
                        admin: false
                    });
                    user.save(function (err2, newUser) {
                        if (err2) {
                            logger.error(err2.toString());
                            return done(error);
                        }

                        console.log(newUser);
                        console.log(user);

                        return done(null, newUser);
                    })

                });
            })
    );

    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done) {
                Users.findOne({username: username},function (err, user) {
                    if (err) {
                        logger.error(err.toString());
                        return done(error);
                    }
                    if(!user){
                        return done(null, false, req.flash('loginMessage', 'Oops! Der Benutzername oder das Passwort ist falsch'));
                    }

                    if (!bcrypt.compareSync(password, user.password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Der Benutzername oder das Passwort ist falsch'));

                    return done(null, user);

                });
            })
    );
};