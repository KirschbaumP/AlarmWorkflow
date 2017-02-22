var operation = function () {
    this.Id = null;

    /*
     Gets/sets the timestamp of when the operation materialized ("incoming" timestamp).
     For the actual alarm timestamp, use the property <see cref="P:Timestamp"/>.
     */
    this.TimeStampIncome = new Date();

    /*
     Gets/sets the date and time of the actual alarm.
     */
    this.TimeStamp = null;

    /*
     Gets or sets the Einsatznummer object.
     */
    this.OperationNumber = "";

    /*
     Gets or sets the Mitteiler object
     */
    this.Messenger = "";

    /*
     Gets/sets the priority of this operation.
     */
    this.Priority = null;

    /*
     Gets/sets the location name.
     */
    this.Location = "";
    this.ZipCode = "";
    this.City = "";
    this.Street = "";
    this.StreetNumber = "";
    this.GeoLatitude  = "";
    this.GeoLongitude  = "";
    this.Abschnitt = "";
    this.Intersection = "";

    /*
     Gets/sets the name of the property (company, site, house etc.).
     */
    this.Property   = "";
    this.Comment   = "";

    /*
     Gets the Meldebild object.
     */
    this.Picture   = "";
    this.OperationPlan  = "";
    this.Resources = [];

    /*
     Gets/sets whether or not this operation is acknowledged, that means that this operation is no longer necessary to be displayed in the UI as "fresh".
     If this is set to "false" then this operation will always been shown in the UI. By default, an operation is set to "acknowledged"
     either if the user manually acknowledges it or after a defined timespan (usually 8 hours).
     */
    this.IsAcknowledged  = true;
};

operation.prototype.getGeCoordinates = function () {
    //TODO: Geolocate
};

module.exports = operation;