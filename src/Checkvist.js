enyo.kind({
    name: "AFresh1.Checkvist",
    kind: enyo.VFlexBox,
    components: [
        {name: "api", kind: "AFresh1.Checkvist.API"},
        {kind: "PageHeader", content: "Enyo Checkvist"},
        {kind: "Button", caption: "Load", onclick: "load"},
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
        this.lists = [];
        this.tasks = {};
        this.currentList = 0;
    },

    load: function() {
        this.setScrimShowing(true);
        this.$.api.login("gotCheckvist", "afresh1", "!K\\J/ReR]O" );
    },

    setScrimShowing: function(inShowing) {
        this.$.scrim.setShowing(inShowing);
        this.$.spinnerLarge.setShowing(inShowing);
    },
    setTaskScrimShowing: function(inShowing) {
        this.$.taskScrim.setShowing(inShowing);
        this.$.taskSpinnerLarge.setShowing(inShowing);
    },

    setItemHighlighted: function(inHighlight) {
            this.$.taskItem.applyStyle("background-color", inHighlight );
    },

    itemDragOver: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted("lightgreen") },
    itemDragDrop: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted("green") },
    itemDragOut: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted(null) },
    itemDragStart: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted("blue") },
    itemDrag: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted("lightblue") },
    itemDragFinish: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted(null) },
    itemMouseHold: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted("red") },
    itemMouseRelease: function(inSender, inEvent) { enyo.log(inSender); this.setItemHighlighted(null) },


    getListItem: function(inSender, inIndex) {
        var r = this.lists[inIndex];
        if (r) {
            this.$.listname.setContent(r.name);
            this.$.count.setContent(r.task_count);
            this.$.completed.setContent(r.task_completed);
            return true;
        }
    },

    getTaskListItem: function(inSender, inIndex) {
        if (! this.currentList) {
            return false;
        }

        var r = this.tasks[this.currentList][inIndex];
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
                this.$.content.parent.addClass( r.details.mark );
            }

            return true;
        }
    },

    listItemClick: function(inSender, inEvent) {
        this.currentList = this.lists[ inEvent.rowIndex ].id;
        this.setTaskScrimShowing(true);

        if (this.tasks.hasOwnProperty( this.currentList )) {
            this.$.tasks.setShowing(true);
            this.$.tasklist.render();
            this.setTaskScrimShowing(false);
        }
        else {
            this.$.api.getTasks("gotTasks", this.currentList);
        }
    },

    checkboxClick: function(inSender, inEvent) {
        var task = this.tasks[this.currentList][inEvent.rowIndex];
    },

    gotCheckvist: function(inSender, inResponse, inRequest) {
        this.lists = inResponse;
        this.$.list.render();
        this.setScrimShowing(false);
    },

    gotTasks: function(inSender, inResponse, inRequest) {
        this.tasks[ inResponse[0].checklist_id ] = inResponse;
        this.$.tasks.setShowing(true);
        this.$.tasklist.render();
        this.setTaskScrimShowing(false);
        //this.$.json.setContent(enyo.json.stringify(inResponse));
        enyo.log(inResponse[12]);
    }
});

