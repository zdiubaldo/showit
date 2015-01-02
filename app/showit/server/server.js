if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("Showings", function () {
    return Showings.find();
  });
}
