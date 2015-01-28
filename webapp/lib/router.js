Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
      Meteor.subscribe('publicLists'),
      Meteor.subscribe('privateLists')
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}

Router.map(function() {
  this.route('join');
  this.route('signin');
  this.route('profile');
  this.route('createShowing', {
     onBeforeAction: function () {
      console.log("listshow: here1");
      // for now I have this hardcoded to the only list we have
      // at some point we can probably clean all this up and dump the
      // altogether
      this.todosHandle = Meteor.subscribe('todos', 'StPhkW4Mepm5fpp3k');
                console.log("listshow: here2");

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
          console.log("listshow: here3");
      }
        console.log("listshow: here4");
    },  
    
    action: function() {
      this.showingID = this.params.showingID; 
      console.log("showingID = "+this.showingID);
      this.render();
    }
  });

  this.route('listsShow', {
    path: '/lists/:_id',
    // subscribe to todos before the page is rendered but don't wait on the
    // subscription, we'll just render the items as they arrive
    onBeforeAction: function () {
      console.log("listshow: here1");
      this.todosHandle = Meteor.subscribe('todos', this.params._id);
                console.log("listshow: here2");

      if (this.ready()) {
        // Handle for launch screen defined in app-body.js
        dataReadyHold.release();
          console.log("listshow: here3");
      }
        console.log("listshow: here4");
    },
    data: function () {
        console.log("listshow: here5");
      return Lists.findOne();
    },
    action: function () {
        console.log("listshow: here6");
      this.render();
    }
  });

  this.route('home', {
    path: '/',
    action: function() {
        console.log("home: here1");
      /*
         before we let them into the site we want to make sure they
         have a profile filled out
         TODO: add more checks here
       */
      if (!Meteor.user().profile) {
        Router.go('profile', Lists.findOne());
          console.log("home: here2");
      } else {
          console.log("home: here3");
        Router.go('listsShow', Lists.findOne());
          console.log("home: here4");
      }
    }
  });
});

if (Meteor.isClient) {
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}
