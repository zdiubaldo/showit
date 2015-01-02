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
