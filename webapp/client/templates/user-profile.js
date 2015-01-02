var ERRORS_KEY = 'profileErrors';

Template.profile.created = function() {
  Session.set(ERRORS_KEY, {});
};

Template.profile.helpers({
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.profile.events({
  'submit': function(event, template) {
    event.preventDefault();

    // grab the updated profile data and put it into a single obj
    var profile = {
      firstName: template.$('[name=firstName]').val(),
      lastName: template.$('[name=lastName]').val(),
      country: template.$('[name=country]').val(),
      city: template.$('[name=city]').val()
    },
    user = {
      profile: profile
    }


    /*
    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();
    var confirm = template.$('[name=confirm]').val();
    */

    var errors = {};

    Meteor.call('updateUser', user, function(err){
      if(err) {
        console.log(err);
      } else {
        //Notifications.info('Profile updated!', 'Successfully saved.');
      }
    });

    Router.go('home');

    /*
    if (! email) {
      errors.email = 'Email required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Accounts.createUser({
      email: email,
      password: password
    }, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      }

      Router.go('home');
    });
    */
  }
});
