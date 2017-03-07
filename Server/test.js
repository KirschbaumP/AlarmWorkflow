var mongo = require("./internal/mongodb");
var Settings = mongo.Settings;
console.log("1");
var ss = new Settings({settingsname: "TEST", value: {abc: 123}});
console.log("2");
ss.save(function (err1) {
    if (err1) throw err1;
    console.log("3");

    ss.value={abc:321};

    Settings.findByIdAndUpdate(ss._id, ss, {upsert: true})
        .populate('friends')
        .exec(function (err, user) {
            if (err) throw err;
            console.log(user);
            console.log("4");

            // Emit load event

        });


});