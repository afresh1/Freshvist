enyo.kind({
    name: "AFresh1.Checkvist.API",
    kind: enyo.Service,
    components: [
        {name: "ws", kind: enyo.WebService, 
            onSuccess: "gotCheckvist", onFailure: "gotCheckvistFailure" }
    ],

    published: {
        baseUrl: "https://checkvist.com",
        onLoggedIn: "loggedIn",
        onGotLists: "gotLists",
        onGotTasks: "gotTasks",
    },

    constructor: function() {
        this.inherited(arguments);

        this.login_args = {};
        this.token = '';

        this.lists = [];
        this.tasks = [];
        this.lists_by_id = {};
    },

    gotCheckvist: function(inSender, inResponse, inEvent) {
        enyo.log("unhandled success in CheckvistAPI", arguments);
    },
    gotCheckvistFailure: function(inSender, inResponse) {
        enyo.log("got failure from getCheckvist API");
    },


    _request: function(inUrl, inArgs) {
        enyo.log("Request", inUrl);

        this.$.ws.setUrl(inUrl);

        var args = inArgs || {};
        if (this.token) { args.token = this.token }
        this.$.ws.call(args);
    },
    _get:  function(url) {
        this.$.ws.setMethod("GET");
        this._request(url);
    },
    _post: function(url, args) {
        this.$.ws.setMethod("POST");
        this._request(url, args);
    },

    login: function(args) {
        this.login_args = args || this.login_args;

        this.$.ws.onSuccess = "gotLogin";
        this._post(this.baseUrl + "/auth/login.json", this.login_args, "loggedin");
    },
    gotLogin: function(inSender, inResponse, inRequest) { 
        this.token = inResponse;
        this.dispatchResponse(this.onLoggedIn, this.token);
    },

    getLists: function() {
        this.$.ws.onSuccess = "gotLists";
        this._get(this.baseUrl + "/checklists.json");
    },
    gotLists: function(inSender, inResponse, inEvent) { 
        var i;
        this.lists = inResponse;
        for (i = 0; i < inResponse.length; i++) {
            if (! this.lists_by_id.hasOwnProperty(inResponse[i].id) ) {
                this.lists_by_id[ inResponse[i].id ] = {};
            }
            this.lists_by_id[ inResponse[i].id ].data = inResponse[i];
        }
        this.dispatchResponse(this.onGotLists, inResponse);
    },

    getTasks: function(list) {
        if (this.lists_by_id.hasOwnProperty(list) 
         && this.lists_by_id[list].hasOwnProperty("tasks")) {
            this.tasks = this.lists_by_id[list].tasks;
            this.dispatchResponse(this.onGotTasks, this.tasks);
            return true;
        }
        this.$.ws.onSuccess = "gotTasks";
        this._get( this.baseUrl + "/checklists/" + list + "/tasks.json");
    },
    gotTasks: function(inSender, inResponse, inEvent) { 
        this.tasks = inResponse;
        this.lists_by_id[ inResponse[0].checklist_id ].tasks = this.tasks;
        this.dispatchResponse(this.onGotTasks, this.tasks);
    }
});
