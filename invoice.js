if (Meteor.isClient) {
  // Username only
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
  });

  Alerts.config({
    position: 'top-center',
    alertWidth: '75%',
    // autoHide: false
  });

  Meteor.subscribe("allExpenses");
  Meteor.subscribe("allCategories");
  Meteor.subscribe("allUsers");

  Template.invoiceForm.helpers({
    categories: function() {
      return Categories.find({});
    }
  });

  Template.invoiceForm.events({
    // Expenses.insert({description: 'test', amount: 1, createdAt: moment().subtract(1, 'months')._d, categories: Categories.findOne()._id, owner: Meteor.userId()});

    "submit #expensesInput": function(event, template){
      // Prevent default browser form submit
      event.preventDefault();



      // Get value from form element
      var description = event.target.inputDescription.value;
      var amount = event.target.inputAmount.value;
      var categories = event.target.inputCategory.value;

      Meteor.call("addExpense", description, amount, categories);

      // Clear form
      event.target.inputDescription.value = "";
      event.target.inputAmount.value = "";
      event.target.inputCategory.value = "";
    }
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
    displayOwner: function(user) {
      if (user) {
        return 'by ' + Meteor.users.findOne(user).username;
      }
    },
    isOwner: function () {
      return this.owner === Meteor.userId();
    },
    parseNumbers: function(data) {
      return parseFloat(Math.round(data * 100) / 100).toFixed(2);
    }
  });

  Template.invoiceTable.events({
    "click #deleteExpense": function () {
      Meteor.call("deleteExpense", this._id);
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

  Meteor.publish("allExpenses", function () {
    return Expenses.find();
  });

  Meteor.publish("allCategories", function () {
    return Categories.find();
  });

  Meteor.publish('allUsers', function() {
    return Meteor.users.find();
  });
}

Meteor.methods({
  addExpense: function (description, amount, categories) {
    if (! Meteor.userId()) {
      Alerts.error('Not authorized');
      throw new Meteor.Error("not-authorized");
    }

    //Function to capitalise first character for strings
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Insert a expenses into the collection
    Expenses.insert({
      description: description,
      amount: amount,
      createdAt: moment()._d,
      categories: categories,
      owner: Meteor.userId()
    }, function(error, result){
      if (result) {
        // $('.form-group').removeClass('has-error');
      } else {
        error.invalidKeys.forEach(function(e) {
          // $("#input" + capitalizeFirstLetter(e.name)).closest('.form-group').addClass('has-error');
          // Alerts.error(capitalizeFirstLetter(e.name) + ' is ' + e.type);
        });
      }
    });
  },
  deleteExpense: function (expenseId) {
    var expense = Expenses.findOne(expenseId);
    if (expense.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      Alerts.error('Not authorized');
      throw new Meteor.Error("not-authorized");
    }
    Expenses.remove(expenseId);
  }
});
