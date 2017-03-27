var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB);

var Schema = mongoose.Schema;


var logsSchema = new Schema({
    message: String,
    source: String,
    level: Number,
    timestamp: {type: Date, default: Date.now}
});
logsSchema.methods.getLevel = function () {
    switch (this.level) {
        case 0:
            return "DEBUG";
        case 1:
            return "INFORMATION";
        case 2:
            return "WARNING";
        case 3:
            return "ERROR";
        case 4:
            return "FATAL";
        default:
            return "UNKNOWN";
    }
}
var Logs = mongoose.model('logs', logsSchema);

var settingsSchema = new Schema({
    settingsname: {type: String, required: true, unique: true},
    value: Schema.Types.Mixed
});
var Settings = mongoose.model('settings', settingsSchema);

var userSchema = new Schema({
    username: String,
    password: String,
    admin: Boolean
});
var Users = mongoose.model('users', userSchema);

var operationsSchema = new Schema({
    /*
     Gets/sets the timestamp of when the operation materialized ("incoming" timestamp).
     For the actual alarm timestamp, use the property <see cref="P:Timestamp"/>.
     */
    TimeStampIncome: Date,

    /*
     Gets/sets the date and time of the actual alarm.
     */
    TimeStamp: Date,

    /*
     Gets or sets the Einsatznummer object.
     */
    OperationNumber: String,

    /*
     Gets or sets the Mitteiler object
     */
    Messenger: String,

    /*
     Gets/sets the priority of this operation.
     */
    Priority: Number,

    /*
     Gets/sets the location name.
     */
    Location: String,
    ZipCode: String,
    City: String,
    Street: String,
    StreetNumber: String,
    GeoLatitude: String,
    GeoLongitude: String,
    Abschnitt: String,
    Intersection: String,

    /*
     Gets/sets the name of the property (company, site, house etc.).
     */
    Property: String,
    Comment: String,

    /*
     Gets the Meldebild object.
     */
    Picture: String,
    OperationPlan: String,
    Resources: Array
});
var Operations = mongoose.model('operations', operationsSchema);

/*
 Addressbook
 */
var kontaktSchema = new Schema({
    vorname: String,
    nachname: String,
    details: Array
});
var Kontakte = mongoose.model('kontakte ', kontaktSchema);

module.exports = {
    connection: mongoose,
    Logs: Logs,
    Settings: Settings,
    Users: Users,
    Operations: Operations,
    Kontakte: Kontakte
};