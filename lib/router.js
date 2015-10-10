Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('allExpenses'); }
});

Router.route('/', {name: 'displayExpenses'});
Router.route('/charts', {name: 'charts'});
