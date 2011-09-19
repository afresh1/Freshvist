
enyo.kind({
  name: "AFresh1.Freshvist.Preferences",
  kind: enyo.VFlexBox,
  events: {
      onReceive: "",
      onSave: "",
      onBack: ""
  },
  components: [
      {
          name: "getPreferencesCall",
          kind: "PalmService",
          service: "palm://com.palm.systemservice/",
          method: "getPreferences",
          onSuccess: "getPreferencesSuccess",
          onFailure: "getPreferencesFailure"
      },
      {
          name: "setPreferencesCall",
          kind: "PalmService",
          service: "palm://com.palm.systemservice/",
          method: "setPreferences",
          onSuccess: "setPreferencesSuccess",
          onFailure: "setPreferencesFailure"
      },
      {kind: "PageHeader", components: [
        {content: "Freshvist - Preferences", flex: 1},
        {name: "saveButton", kind: "Button",
            content: "Save", onclick: "saveClick"},
        {width: "10px"},
        {name: "backButton", kind: "Button",
            content: "Back", onclick: "backClick"}
      ]},
      {kind: "VFlexBox", components: [
            {kind: "RowGroup", caption: "Login Information", components: [
                {name: "username", kind: "Input", 
                    hint: "Enter your Email Address"},
                {name: "remote_key", kind: "Input",
                hint: "Enter your API Remote Key"}
            ]},
            {kind: "HtmlContent", srcId: "preferencesContent"},
            {kind: (window.PalmSystem ? enyo.WebView : enyo.Iframe), url:
                "https://checkvist.com/auth/profile", height: "450px"}
      ]},
  ],
  create: function() {
      this.inherited(arguments);
      this.$.getPreferencesCall.call(
      {
          "keys": ["Freshvist_username", "Freshvist_remote_key"]
      });
      // keep this updated with the value that's currently saved to the service
      this.username = "";
      this.password = "";
  },
  getPreferencesSuccess: function(inSender, inResponse) {
      this.username = inResponse.Freshvist_username;
      this.remote_key = inResponse.Freshvist_remote_key;

      //enyo.log(this.username, this.remote_key);

      this.showingChanged();
      this.doReceive(this.username, this.remote_key);
  },
  getPreferencesFailure: function(inSender, inResponse) {
      enyo.log("got failure from getPreferences");
  },
  setPreferencesSuccess: function(inSender, inResponse) {
      console.log("got success from setPreferences");
  },
  setPreferencesFailure: function(inSender, inResponse) {
      console.log("got failure from setPreferences");
  },
  showingChanged: function() {
      // reset contents of text input box to last saved value

      if (this.username === undefined) {
          this.username = "";
      }
      if (this.remote_key === undefined) {
          this.remote_key = "";
      }
      this.$.username.setValue(this.username);
      this.$.remote_key.setValue(this.remote_key);
  },
  saveClick: function(inSender, inEvent) {
      var username = this.$.username.getValue();
      var remote_key = this.$.remote_key.getValue();

      this.$.setPreferencesCall.call(
      {
          "Freshvist_username": username,
          "Freshvist_remote_key": remote_key
      });

      this.username = username;
      this.remote_key = remote_key;

      enyo.log(this.username, this.remote_key);

      this.doSave(username, remote_key);
  },
  backClick: function() {
      this.doBack();
  }
});
