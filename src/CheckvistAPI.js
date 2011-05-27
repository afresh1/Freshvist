enyo.kind({
    name: "AFresh1.Checkvist.API",
    kind: enyo.WebService,
    baseUrl: "https://checkvist.com",
    //onSuccess: "gotCheckvist",
    onFailure: "gotCheckvistFailure",
    gotCheckvistFailure: function(inSender, inResponse) {
        enyo.log("got failure from getCheckvist API");
    },
    get: function(callback, url, args) {
        this.onSuccess = callback;
        this.setUrl( url );
        this.call(args);
    },
    login: function(callback, user, key) {
        this.setMethod("POST");
        this.get(callback, this.baseUrl + "/checklists.json", 
            { username: user, cpass: key });
        this.setMethod("GET");
    },
    getLists: function(callback) {
        this.get( callback, 
                 this.baseUrl + "/checklists.json" );
    },
    getTasks: function(callback, list) {
        this.get( callback, 
                 this.baseUrl + "/checklists/" + list + "/tasks.json" );
    }
});
