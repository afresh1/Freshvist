enyo.kind({
    name: "AFresh1.Freshvist",
    kind: enyo.VFlexBox,
    components: [
        {kind: "AppMenu", components: [
            {kind: "EditMenu"},
            {caption: "Refresh Lists", onclick: "loadLists" },
            {caption: "Preferences", onclick: "showPreferences"},
            {kind: "HelpMenu", target: "http://freshvist.afresh1.com/help.html" }
        ]},
        {kind: "Pane", flex: 1, components: [
            {name: "splash", flex: 1, components: [
                {kind: "HtmlContent", srcId: "splashContent", 
                    onLinkClick: "htmlContentLinkClick" 
                },
                {kind: "HFlexBox", components: [
                    {kind: "Spacer", flex: 1},
                    {kind: "Button", caption: "Preferences", onclick: "showPreferences"},
                    {kind: "Spacer", flex: 1}
                ]}
            ]},
            {
                name: "preferences",
                className: "enyo-bg",
                kind: "AFresh1.Freshvist.Preferences",
                onReceive: "preferencesRecieved",
                onSave: "preferencesRecieved",
                onBack: "goBack"
            },
            {name: "main", kind: "SlidingPane", flex: 1, onSelectView: "SlidingSelected",
                components: [
                    {name: "lists", width: "320px", components: [
                        {kind: "Header", content: "Your Active Lists"},
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
                        ]}
                    ]},
                    {name: "tasks", flex: 1, dismissible: true, onResize: "slidingResize", showing: false, components: [
                        {name: "taskheader", kind: "Header", content: "Your Tasks"},
                        { name: "taskScroller", kind: "Scroller", flex: 1, components: [
                            {name: "tasklist", kind: "VirtualRepeater",
                                onSetupRow: "getTaskListItem", components: [
                                    { name: "taskItem", kind: "Item", layoutKind: "VFlexLayout",
                                        components: [
                                            { layoutKind: "HFlexLayout",
                                                style: "font-size: x-small; margin-top: -10px",
                                                className: "enyo-label", components: [
                                                {kind: "Spacer", flex: 1},
                                                {name: "update_line" },
                                                {content: " | " },
                                                {name: "updated_at" }
                                            ]},
                                            {layoutKind: "HFlexLayout", components: [
                                                {name: "link", 
                                                    kind: "IconButton", 
                                                    showing: false, 
                                                    style: "margin-left: -5px; margin-right: 0px",
                                                    icon: "images/btn_share.png",
                                                    onclick: "loadListLinkClick"
                                                },
                                                {name: "status", kind: "CheckBox", onclick: "checkboxClick" },
                                                {name: "arrow", kind: enyo.CustomButton, style: "min-width:25px;margin-right:5px", 
                                                    toggling: false, showing: true, onclick: "arrowClick"  },
                                                {name: "content", flex: 1,
                                                    kind: "RichText", 
                                                    style: "margin-top: -15px; margin-bottom: -15px", 
                                                    onchange: "contentChanged" }
                                            ]}
                                        ]
                                    }
                                ]
                            },
                        ]},
                        {kind: "Toolbar", components: [
                            {slidingHandler: true, kind: "GrabButton"},
                            {kind: "Spacer"},
                            {kind: "ToolButtonGroup", components: [
                                {icon: "images/menu-icon-new.png", onclick: "addTask"},
                                {icon: "images/menu-icon-refresh.png", onclick: "loadTasks"}
                            ]},
                            {kind: "Spacer"},
                            {kind: "Spinner", align: "right"}
                        ]},
                        {name: "taskScrim", kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
                            {name: "taskSpinnerLarge", kind: "SpinnerLarge"}
                        ]}
                    ]}
                ]
            },
            {kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
                {kind: "SpinnerLarge"}
            ]}
        ]
    },
            {name: "errorBox", kind: "ModalDialog", components: [
                {name: "errorMessage", content: "Problem logging in, check your login details." },
                    //style: "padding-left: 10px"},
                {layoutKind: "HFlexLayout", pack: "center", components: [
                    {kind: "Button", caption: "OK", onclick: "confirmClick"}
                ]}
            ]}
    ],
    create: function() {
        this.inherited(arguments);

        this.api = checkvist_api();
        this.cv = { lists: [], tasks: [], curList: false, curTask: false };
    },

    preferencesRecieved: function(inSender, username, remote_key) {
        this.login(username, remote_key);
    },

    login: function(username, remote_key) {
        if (username && remote_key) {
            this.api.login({ 
                username: username,
                remote_key: remote_key,
                onSuccess: this.loggedIn.bind(this),
                onError: this.loginFailed.bind(this)
            });
        }
        else {
            //this.showPreferences();
        }

    },

    loggedIn: function() {
        this.$.pane.selectViewByName("main");
        this.loadLists();
    },

    loginFailed: function(req, e) {
        enyo.log(req, e);
        //this.$.errorMessage.setContent(req.statusText);
        enyo.log(req.statusText);

        this.showPreferences();
        this.$.errorBox.openAtCenter();
    },

    confirmClick: function() {
        this.$.errorBox.close();
    },

    showPreferences: function() {
        this.$.pane.selectViewByName("preferences");
    },

    goBack: function(inSender, inEvent) {
        this.$.pane.back(inEvent);
        //this.$.pane.selectViewByName("main");
    },


    loadLists: function() {
        this.setScrimShowing(true);
        this.api.getLists({ 
            onSuccess: this.gotLists.bind(this),
            onError: function() {
                setTimeout(this.loadLists,1500);
            }.bind(this)
        });
    },

    loadList: function(listId) {
        enyo.log("loadList: " + listId);
        this.setTaskScrimShowing(true);
        this.api.getList({
            id: listId,
            onSuccess: function(list) {
                this.cv.curList = list;
                this.loadTasks();
            }.bind(this)
        });
    },

    loadTasks: function() {
        this.setTaskScrimShowing(true);
        if (this.cv.curList) {
            this.cv.curList.getTasks({ onSuccess: this.gotTasks.bind(this) });
        }
    },

    addTask: function() {
        if(this.cv.curList) {
            this.cv.curList.addTask({
                onSuccess: function(task) {
                    enyo.log(task);
                    this.cv.tasks.push(task);
                    this.$.tasklist.render();
                    this.$.spinner.hide();
                }.bind(this)
            });
            this.$.spinner.show();
        }
    },

    setScrimShowing: function(inShowing) {
        this.$.scrim.setShowing(inShowing);
        this.$.spinnerLarge.setShowing(inShowing);
    },
    setTaskScrimShowing: function(inShowing) {
        this.$.taskScrim.setShowing(inShowing);
        this.$.taskSpinnerLarge.setShowing(inShowing);
    },

    findParent: function(task) {
        var i, tasks = this.cv.tasks;
        for (i = 0; i < tasks.length; i++) {
            if (tasks[i].id == task.parent_id) {
                return tasks[i];
            }
        }
    },

    findIndent: function(task_id) {
        var i, task, indent = 0, tasks = this.cv.tasks;
        for (i = 0; i < tasks.length; i++) {
            if (tasks[i].id == task_id) {
                task = tasks[i];
                break;
            }
        }
        if (task && task.parent_id) {
            indent += 1;
            indent += this.findIndent(task.parent_id);
        }
        return indent;
    },

    getListItem: function(inSender, inIndex) {
        //enyo.log("getListItem", inIndex);
        var r = this.cv.lists[inIndex];
        if (r) {
            this.$.listname.setContent(r.name);
            this.$.count.setContent(r.task_count);
            this.$.completed.setContent(r.task_completed);
            return true;
        }
    },

    getTaskListItem: function(inSender, inIndex) {
        //enyo.log("getTaskListItem", inIndex);
        var indent, client, parent, r = this.cv.tasks[inIndex];
        if (r) {
            if (r.showing === undefined) {
                r.showing = !r.collapsed;
            }

            parent = this.findParent(r);
            r.showing = parent ? parent.showing && !parent.collapsed : true;

            client = this.$.taskItem.parent;
            client.addClass("parent_" + r.parent_id);
            client.addClass("parent_" + r.id);
            client.addClass("task_" + r.id);

            this.$.taskItem.setShowing( r.showing );

            indent = this.findIndent(r.id);
            this.$.arrow.applyStyle("margin-left", (indent * 15) + "px");

            if (r.tasks.length) {
                //enyo.log(this.$.taskItem, r, "is indented more");
                this.$.arrow.setToggling(true);
                this.$.arrow.addClass("enyo-menuitem-arrow");
                if (!r.collapsed) {
                    this.$.arrow.addClass("enyo-button-down");
                }
            }

            if (r.list_id) {
                enyo.log(r.content);
                //XXX Need to change the checkbox to some sort of icon?
                this.$.status.setShowing(false);
                this.$.link.setShowing(true);
            }
            else if (r.status == 1) {
                this.$.status.setChecked(true);
            }
            else if (r.status == 2) {
                this.$.status.setDisabled(true);
            }


            this.$.content.setValue(r.content);
            this.$.update_line.setContent(r.update_line);
            this.$.updated_at.setContent(r.updated_at);

            if (r.details.hasOwnProperty("mark")) {
                this.$.taskItem.addClass( r.details.mark );
            }
            
            return true;
        }
    },

    htmlContentLinkClick: function(inSender, inURL) {
        enyo.log(inURL);
        enyo.windows.activate(inURL, "CheckvistBrowser");
    },

    listItemClick: function(inSender, inEvent) {
        var clickedList = this.cv.lists[ inEvent.rowIndex ];
        if (clickedList) {
            if (this.cv.tasks.length 
                && this.cv.tasks[0].checklist_id == clickedList.id) {
                this.$.tasks.setShowing(true);
                return false;
            }
            this.setTaskScrimShowing(true);
            this.cv.curList = clickedList;
            clickedList.getTasks({ onSuccess: this.gotTasks.bind(this) });
            //this.$.taskScroller.scrollTo(1,1);
        }
    },

    loadListLinkClick: function(inSender, inEvent) {
        //enyo.log("loadListLinkClick", arguments);
        var task = this.cv.tasks[inEvent.rowIndex];
        if (task.list_id) {
            this.loadList(task.list_id);
        }
    },

    checkboxClick: function(inSender, inEvent) {
        enyo.log("checkboxClick", arguments);
        var task = this.cv.tasks[inEvent.rowIndex];
        enyo.log(task);
        if (task.status === 1) {
            task.reopen({onSuccess: this.gotUpdatedTasks.bind(this) });
            this.$.spinner.show();
        }
        else if (task.status === 0) {
            task.close({ onSuccess: this.gotUpdatedTasks.bind(this) });
            this.$.spinner.show();
        }
    },

    arrowClick: function(inSender, inEvent) {
        var i,parent;
        enyo.log("arrowClick", arguments);
        var task = this.cv.tasks[inEvent.rowIndex];

        task.collapsed = task.collapsed ? false : true;
  
        for (i=0;i<this.cv.tasks.length;i++) {
            task = this.cv.tasks[i];
            parent = this.findParent(task);
            task.showing = parent ? parent.showing && !parent.collapsed : true;
        }

        this.$.tasklist.render();
    },

    contentChanged: function(inSender, inEvent) {
        enyo.log("contentChanged", inSender.getValue());
        var task = this.cv.tasks[inEvent.rowIndex];

        task.content = inSender.getValue(); 

        task.update({
            content: task.content,
            list_id: task.list_id,
            parent_id: task.parent_id,
            position: task.position,
            onSuccess: this.gotUpdatedTasks.bind(this)
        });
        this.$.spinner.show();
    },


    gotLists: function(lists) {
        //enyo.log("C.gotLists", arguments);

        this.cv.lists = lists;

        this.$.list.render();
        this.setScrimShowing(false);
    },

    gotTasks: function(tasks) {
        //enyo.log("C.gotTasks", arguments);
        var i, j, tmp, bp = {}, num = 0;

        for (i = 0; i < tasks.length; i++) {
            j = tasks[i].parent_id;
            if (!bp[j]) {
                bp[j] = [];
                num++;
            }

            bp[j].push(tasks[i]);
        }

        tasks = bp[0];
        delete bp[0];
        num--;
        while (num) {
            tmp = [];
            for (i = 0; i < tasks.length; i++) {
                tmp.push(tasks[i])
                if (bp[ tasks[i].id ]) {
                    tmp = tmp.concat(bp[ tasks[i].id ]);
                    delete bp[ tasks[i].id ];
                    num--;
                }
            }
            tasks = tmp;
        }

        this.cv.tasks = tasks;

        enyo.log(this.cv.curList.name);
        this.$.taskheader.setContent( this.cv.curList.name );
        this.$.tasklist.render();
        this.setTaskScrimShowing(false);
        this.$.tasks.setShowing(true);
        this.$.taskScroller.scrollIntoView();
    },

    gotUpdatedTasks: function(tasks) {
        enyo.log('got updated tasks');
        enyo.log(tasks);
        var i, j;
        for (i = 0; i < tasks.length; i++) {
            enyo.log('updating task: ' + tasks[i].id);
            enyo.log(tasks[i]);
            for (j = 0; j < this.cv.tasks.length; j++) {
                if (tasks[i].id === this.cv.tasks[j].id) {
                    enyo.log('found updated task: ' + tasks[i].id);
                    enyo.log(tasks[i].status + ' cmp ' +
                             this.cv.tasks[j].status);
                    this.cv.tasks[j] = tasks[i];
                }
            }
        }
        this.$.tasklist.render();
        this.$.spinner.hide();
    }
});

