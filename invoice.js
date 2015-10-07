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

  Template.invoiceForm.helpers({
    categories: function() {
      return Categories.find({});
    }
  });

  Template.invoiceForm.events({
    // Expenses.insert({description: 'test', amount: 1, createdAt: moment().subtract(1, 'months')._d, categories: Categories.findOne()._id, owner: Meteor.userId()});

    "submit #insertExpenseForm": function(event, template){
      // Prevent default browser form submit
      event.preventDefault();

      //Function to capitalise first character for strings
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }

      // Get value from form element
      var description = event.target.inputDescription.value;
      var amount = event.target.inputAmount.value;
      var categories = event.target.inputCategory.value;

      console.log(description + ' ' + amount + ' ' + categories);

      Meteor.call("addExpense", description, amount, categories, function (error, result) {
        if (error) {
          // $('.form-group').removeClass('has-error');
          // Expenses.simpleSchema().namedContext('addExpense').invalidKeys().forEach(function(e) {
          //   $("#input" + capitalizeFirstLetter(e.name)).closest('.form-group').addClass('has-error');
          // });
        } else {
          // $('.form-group').removeClass('has-error');
          // Clear form
          event.target.inputDescription.value = "";
          event.target.inputAmount.value = "";
          event.target.inputCategory.value = "";
        }
      });

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
    displayOwner: function(owner) {
      var user = Meteor.users.findOne(owner);
      if (user && user.username) {
        return user.username;
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
      throw new Meteor.Error("not-authorized");
    }

    // Insert a expenses into the collection
    Expenses.insert({
      description: description,
      amount: amount,
      createdAt: moment()._d,
      categories: categories,
      owner: Meteor.userId()
    });
  },
  deleteExpense: function (expenseId) {
    var expense = Expenses.findOne(expenseId);
    if (expense.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    Expenses.remove(expenseId);
  }
});
