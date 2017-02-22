var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 5,
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBDATABASE
});

module.exports = pool;