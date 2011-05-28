enyo.kind({
    name: "AFresh1.Checkvist",
    kind: enyo.VFlexBox,
    components: [
        {name: "api", kind: "AFresh1.Checkvist.API"},
        {kind: "PageHeader", content: "Enyo Checkvist"},
        {kind: "Button", caption: "Reload", onclick: "load"},
        {name: "pane", kind: "SlidingPane", flex: 1, onSelectView: "SlidingSelected",
            components: [
                {name: "lists", width: "320px", components: [
                    { kind: "Scroller", flex: 1, components: [
                        {name: "list", kind: "VirtualRepeater", 
                            onSetupRow: "getListItem", components: [
                                { kind: "Item", layoutKind: "HFlexLayout",
                                    components: [
                                        {name: "listname", flex: 1},
                                        {name: "completed"},
                                        {content: "/"},
                                        {name: "count"}
                                    ]
                                }
                            ], onclick: "listItemClick" }
                    ]},
                    {kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
                        {kind: "SpinnerLarge"}
                    ]}
                ]},
                {name: "tasks", flex: 1, dismissible: true, onResize: "slidingResize", showing: false, components: [
                    { kind: "Scroller", flex: 1, components: [
                        {name: "tasklist", kind: "VirtualRepeater",
                            onSetupRow: "getTaskListItem", components: [
                                { name: "taskItem", kind: "Item", layoutKind: "HFlexLayout",
                                    ondragover: "itemDragOver", ondrop: "itemDragDrop", ondragout: "itemDragOut",
                                    ondragstart: "itemDragStart", ondrag: "itemDrag", ondragfinish: "itemDragFinish",
                                    onmousehold: "itemMouseHold", onmouserelease: "itemMouseRelease",
                                    components: [
                                        {name: "status", kind: "CheckBox", style: "margin-right:10px", onclick: "checkboxClick" },
                                        {name: "content", flex: 1, kind: "RichText" },
                                        { layoutKind: "HFlexLayout", className: "enyo-label", components: [
                                            {name: "update_line" },
                                            {content: " | " },
                                            {name: "updated_at" }
                                        ]}
                                    ]
                                }
                            ]}
                    ]},
                    {name: "taskScrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
                        {name: "taskSpinnerLarge", kind: "SpinnerLarge"}
                    ]}
                ]}
            ]
        },
        {name: "json"}
    ],
    create: function() {
        this.inherited(arguments);

        this.$.api.login({ username: "andrew+checkvist@afresh1.com", remote_key: "GpVkMIwqoDsztUYi0YecZgy56vdgJ61s4fKK7gZ3"});
    },
    loggedIn: function() {
        enyo.log("Logged In", arguments);
        this.load();
    },

    load: function() {
        this.setScrimShowing(true);
        this.$.api.getLists();
    },

    setScrimShowing: function(inShowing) {
        this.$.scrim.setShowing(inShowing);
        this.$.spinnerLarge.setShowing(inShowing);
    },
    setTaskScrimShowing: function(inShowing) {
        this.$.taskScrim.setShowing(inShowing);
        this.$.taskSpinnerLarge.setShowing(inShowing);
    },

    /*
    setItemHighlighted: function(inHighlight) {
            this.$.taskItem.applyStyle("background-color", inHighlight );
    },
    itemDragOver: function(inSender, inEvent) { enyo.log("itemDragOver",arguments); this.setItemHighlighted("lightgreen") },
    itemDragDrop: function(inSender, inEvent) { enyo.log("itemDragDrop",arguments); this.setItemHighlighted("green") },
    itemDragOut: function(inSender, inEvent) { enyo.log("itemDragOut",arguments); this.setItemHighlighted(null) },
    itemDragStart: function(inSender, inEvent) { enyo.log("itemDragStart",arguments); this.setItemHighlighted("blue") },
    itemDrag: function(inSender, inEvent) { enyo.log("itemDrag",arguments); this.setItemHighlighted("lightblue") },
    itemDragFinish: function(inSender, inEvent) { enyo.log("itemDragFinish",arguments); this.setItemHighlighted(null) },
    itemMouseHold: function(inSender, inEvent) { enyo.log("itemMouseHold",arguments); this.setItemHighlighted("red") },
    itemMouseRelease: function(inSender, inEvent) { enyo.log("itemMouseRelease",arguments); this.setItemHighlighted(null) },
    */

    getListItem: function(inSender, inIndex) {
        //enyo.log("getListItem", inIndex);
        var r = this.$.api.lists[inIndex];
        if (r) {
            this.$.listname.setContent(r.name);
            this.$.count.setContent(r.task_count);
            this.$.completed.setContent(r.task_completed);
            return true;
        }
    },

    getTaskListItem: function(inSender, inIndex) {
        //enyo.log("getTaskListItem", inIndex);
        var r = this.$.api.tasks[inIndex];
        if (r) {
            this.$.content.setValue(r.content);
            this.$.update_line.setContent(r.update_line);
            this.$.updated_at.setContent(r.updated_at);
            if (r.status == 1) {
                this.$.status.setChecked(true);
            }
            else if (r.status == 2) {
                this.$.status.setDisabled(true);
            }

            if (r.details.hasOwnProperty("mark")) {
                this.$.taskItem.addClass( r.details.mark );
            }

            return true;
        }
    },

    listItemClick: function(inSender, inEvent) {
        var clickedList = this.$.api.lists[ inEvent.rowIndex ].id;
        this.setTaskScrimShowing(true);
        this.$.api.getTasks(clickedList);
    },

    checkboxClick: function(inSender, inEvent) {
        enyo.log("checkboxClick", arguments);
        var task = this.$.api.tasks[inEvent.rowIndex];
        enyo.log(task);
    },

    gotLists: function(inSender, inResponse, lists) {
        //enyo.log("C.gotLists", arguments);

        this.$.list.render();
        this.setScrimShowing(false);
    },

    gotTasks: function(inSender, inResponse, tasks) {
        //enyo.log("C.gotTasks", arguments);

        this.$.tasklist.render();
        this.setTaskScrimShowing(false);
        this.$.tasks.setShowing(true);
    }
});

