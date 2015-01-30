Meteor.publish('publicLists', function() {
  return Lists.find({userId: {$exists: false}});
});

Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('todos', function(listId) {
  check(listId, String);
    return Todos.find({ $or: [ { showingAcceptedBy: "" }, { showingAcceptedBy: this.userId }, { showingOwner: this.userId} ] });
    //return Todos.find();
  //return Todos.find({listId: listId});
});

Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
    {fields: {'other': 1, 'things': 1}});
  } else {
    this.ready();
  }
});
