var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

Template.createShowing.rendered = function() {
  if (firstRender) {
    // Released in app-body.js
    listFadeInHold = LaunchScreen.hold();

    // Handle for launch screen defined in app-body.js
    listRenderHold.release();

    firstRender = false;
  }

  this.find('.js-title-nav')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        this.remove();
      });
    }
  };
};

Template.createShowing.helpers({
  editing: function() {
    return Session.get(EDITING_KEY);
  },

  todosReady: function() {
    return Router.current().todosHandle.ready();
  },

  todos: function(listId) {
    return Todos.find();
      //return Todos.find({listId: listId}, {sort: {createdAt : -1}});
  },
  
  createDebug: function() {
    console.log("create-showing showingID = " + Router.current().showingID);
  },
    
  getShowingDate: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingDate;
      }
  },
    
  getShowingTime: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingTime;
      }
  },
    
  getShowingAddress: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingAddress;
      }
  },
  
  getShowingCity: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingCity;
      }
  },
    
  getShowingZip: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingZip;
      }
  },
    
  getShowingMLS: function() {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
        return showing.showingMLS;
      }
  },
    
  isDisabled: function () {
      if (Router.current().showingID) {
        var showing = Todos.findOne(Router.current().showingID);
          if (showing.showingOwner === Meteor.userId()) {
              return false;
          }
      } else {
          return false
      }
      return true;
  }    
});

var editList = function(list, template) {
  Session.set(EDITING_KEY, true);

  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

var saveList = function(list, template) {
  Session.set(EDITING_KEY, false);
  Lists.update(list._id, {$set: {name: template.$('[name=name]').val()}});
}

var deleteList = function(list) {
  // ensure the last public list cannot be deleted.
  if (! list.userId && Lists.find({userId: {$exists: false}}).count() === 1) {
    return alert("Sorry, you cannot delete the final public list!");
  }

  var message = "Are you sure you want to delete the list " + list.name + "?";
  if (confirm(message)) {
    // we must remove each item individually from the client
    Todos.find({listId: list._id}).forEach(function(todo) {
      Todos.remove(todo._id);
    });
    Lists.remove(list._id);

    Router.go('home');
    return true;
  } else {
    return false;
  }
};

var toggleListPrivacy = function(list) {
  if (! Meteor.user()) {
    return alert("Please sign in or create an account to make private lists.");
  }

  if (list.userId) {
    Lists.update(list._id, {$unset: {userId: true}});
  } else {
    // ensure the last public list cannot be made private
    if (Lists.find({userId: {$exists: false}}).count() === 1) {
      return alert("Sorry, you cannot make the final public list private!");
    }

    Lists.update(list._id, {$set: {userId: Meteor.userId()}});
  }
};

Template.createShowing.events({
  'click .js-cancel': function() {
    Session.set(EDITING_KEY, false);
  },

  'keydown input[type=text]': function(event) {
    // ESC
    if (27 === event.which) {
      event.preventDefault();
      $(event.target).blur();
    }
  },

  'blur input[type=text]': function(event, template) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (Session.get(EDITING_KEY))
      saveList(this, template);
  },

  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveList(this, template);
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  'change .list-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editList(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteList(this, template);
    } else {
      toggleListPrivacy(this, template);
    }

    event.target.selectedIndex = 0;
  },

  'click .js-edit-list': function(event, template) {
    editList(this, template);
  },

  'click .js-toggle-list-privacy': function(event, template) {
    toggleListPrivacy(this, template);
  },

  'click .js-delete-list': function(event, template) {
    deleteList(this, template);
  },

  'click .js-todo-add': function(event, template) {
    template.$('.js-todo-new input').focus();
  },

  'submit .js-showing-new': function(event) {
    //console.log('testings');
    event.preventDefault();
    console.log(Meteor.user());

    Todos.insert({
      listId: this._id,
      showingOwner: Meteor.userId(),
      showingDate: event.target.showingDate.value,
      showingTime: event.target.showingTime.value,    
      showingAddress: event.target.showingAddress.value,
      showingCity: event.target.showingCity.value,
      showingZip: event.target.showingZip.value,
      showingMLS: event.target.showingMLS.value,
      showingAcceptedBy: "",
      text: "newstyle",
      checked: false,
      createdAt: new Date()
    });

    Router.go('home');

  },
    
  'click .js-accept-showing': function() {
    Todos.update(Router.current().showingID, { $set: { showingAcceptedBy: Meteor.userId() } });
    Router.go('home');
      
  },
      
  'submit .js-unaccept-showing': function() {
    Todos.update(this._id, { $set: { showingAcceptedBy: "" } });
      
  }
});
