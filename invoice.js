if (Meteor.isClient) {
  // Username only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

  // counter starts at 0
  Session.setDefault('counter', 0);


  Template.invoiceForm.helpers({
    categories: function() {
      var categories = Categories.find({});
      return categories;
    },
    rendered: function(){

    },
    destroyed: function(){

    },
  });

  Template.invoiceForm.events({
    // Expenses.insert({description: 'test', amount: 1, createdAt: moment().subtract(1, 'months')._d, categories: Categories.findOne()._id, owner: Meteor.userId()});

    "submit #add_expense": function(event, template){
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var description = event.target.inputDescription.value;
      var amount = event.target.inputAmount.value;
      var createdAt = moment()._d;
      var categories = event.target.inputCategory.value;
      var owner = Meteor.userId();

      // Insert a expenses into the collection
      Expenses.insert({
        description: description,
        amount: amount,
        createdAt: createdAt,
        categories: categories,
        owner: owner
      });

      // Clear form
      event.target.inputCategory.value = "";
    }
  });


  Template.invoiceTable.helpers({
    expenses: function() {
      var expenses = Expenses.find({}, {sort: {createdAt: -1}});
      return expenses;
    },
    dateToPass: function(date) {
      if(date) {
        if(moment(date).isSame(moment(), 'day')) {
          return moment(date).fromNow();
        } else {
          return moment(date).format('DD.MM.YYYY');
        }
      }
    },
    displayOwner: function(user) {
      if(user) {
        return 'by ' + Meteor.users.findOne(user).username;
      }
    }
  });

  Template.invoiceTable.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Categories.find().count() == 0) {
        Categories.insert({name:'Sonstige'}, {validate: false});
        Categories.insert({name:'Mittagessen'}, {validate: false});
        Categories.insert({name:'Snack'}, {validate: false});
        Categories.insert({name:'Einkauf'}, {validate: false});
        Categories.insert({name:'Markt'}, {validate: false});
      }
  });
}
