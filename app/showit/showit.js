Showings = new Mongo.Collection("Showings");

if (Meteor.isClient) {

  Meteor.subscribe("Showings");

  // This code only runs on the client
  Template.body.helpers({
    Showings: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter Showings
        return Showings.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the Showings
        return Showings.find({}, {sort: {createdAt: -1}});
      }
    },

    hideCompleted: function () {
      return Session.get("hideCompleted");
    },

    incompleteCount: function () {
      return Showings.find({checked: {$ne: true}}).count();
    }
  });

  // Inside the if (Meteor.isClient) block, right after Template.body.helpers:
  Template.body.events({

    "submit .new-showing": function (event) {
      // This function is called when the new showing form is submitted

      var text = event.target.text.value;
      // console.log(event);
      Meteor.call("addshowing", text);

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    },

    // Add to Template.body.events
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  // Define a helper to check if the current user is the showing owner
  Template.showing.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  // In the client code, below everything else
  Template.showing.events({
    "click .toggle-checked": function () {
      Meteor.call("setChecked", this._id, ! this.checked);
    },

    "click .delete": function () {
      Meteor.call("deleteShowing", this._id);
    },

    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }

  });

  // At the bottom of the client code
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}


// At the bottom of simple-todos.js, outside of the client-only block
Meteor.methods({

  addshowing: function (text) {
    // Make sure the user is logged in before inserting a showing
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Showings.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

  deleteShowing: function (showingId) {
    Showings.remove(showingId);
  },

  setChecked: function (showingId, setChecked) {
    Showings.update(showingId, { $set: { checked: setChecked} });
  },

  setPrivate: function (showingId, setToPrivate) {
    var showing = Showings.findOne(showingId);

    // Make sure only the showing owner can make a showing private
    if (showing.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Showings.update(showingId, { $set: { private: setToPrivate } });
  }

});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("Showings", function () {
    return Showings.find();
  });
}
