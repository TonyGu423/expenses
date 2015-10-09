if (Meteor.isClient) {
  // Username only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

  Meteor.subscribe("allExpenses");
  Meteor.subscribe("allCategories");
  Meteor.subscribe("allUsers");

  Template.registerHelper("categoriesOptions", function() {
    array = []
    Categories.find().fetch().forEach(function(c) {
        array.push({label: c.name, value: c._id});
      });
    return array;
  });

  Template.invoiceTable.helpers({
    expenses: function() {
      return Expenses.find({}, {sort: {createdAt: -1}});
    },
    totalExpenses: function() {
      var sum = 0;
      var cursor = Expenses.find({});
      cursor.forEach(function(transaction){
       sum = sum + transaction.amount
     });
     return sum;
    },
    dateBeautifier: function(date) {
      if (date) {
        if (moment(date).isSame(moment(), 'day')) {
          return moment(date).fromNow();
        } else {
          return moment(date).format('DD.MM.YYYY');
        }
      }
    },
    displayOwner: function(owner) {
      var user = Meteor.users.findOne(owner);
      if (user && user.username) {
        return user.username;
      }
    },
    isOwner: function() {
      return this.owner === Meteor.userId();
    },
    parseNumbers: function(data) {
      return parseFloat(Math.round(data * 100) / 100).toFixed(2);
    }
  });

  Template.invoiceTable.events({
    "click #deleteExpense": function() {
      Meteor.call("deleteExpense", this._id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // create initial categories
    if (Categories.find().count() == 0) {
        Categories.insert({name:'Sonstige'}, {validate: false});
        Categories.insert({name:'Mittagessen'}, {validate: false});
        Categories.insert({name:'Snack'}, {validate: false});
        Categories.insert({name:'Einkauf'}, {validate: false});
        Categories.insert({name:'Markt'}, {validate: false});
      }

    //create initial user
    if ( Meteor.users.find().count() == 0 ) {
      Accounts.createUser({
        username: 'michi',
        password: 'password'
      });
    }
  });

  Meteor.publish("allExpenses", function() {
    return Expenses.find();
  });

  Meteor.publish("allCategories", function() {
    return Categories.find();
  });

  Meteor.publish('allUsers', function() {
    return Meteor.users.find();
  });

  Meteor.methods({
    deleteExpense: function (expenseId) {
      var expense = Expenses.findOne(expenseId);
      if (expense.owner !== Meteor.userId()) {
        // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error("not-authorized");
      }
      Expenses.remove(expenseId);
    }
  });

}
