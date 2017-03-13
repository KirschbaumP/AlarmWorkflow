var mongo = require("./internal/mongodb");
var Users = mongo.Users;
console.log("1");
var user = new Users({
    username: "admin",
    password: "$2a$10$8QWkq1BlNCIb55m8XrxHoeijUW4mcNkplJf1PWK7VcIs56K0YR2xa",
    admin: true
});
console.log("2");

console.log(user);
user.save(function (err1, val1) {
    if (err1) throw err1;
    console.log(val1);
})