// create collections
Categories = new Mongo.Collection("categories");
Expenses = new Mongo.Collection("expenses");

// extend schemas
var Schemas = {};

Schemas.Category = new SimpleSchema({
  name: {
    type: String,
    max: 200,
    denyInsert: true
  }
});

Schemas.Expense = new SimpleSchema({
  description: {type: String, min: 2},
  amount: {type: Number, decimal: true},
  createdAt: {type: Date},
  categories: {type: Schemas.Categories},
  owner: {type: String}
});

Expenses.attachSchema(Schemas.Expense);
Categories.attachSchema(Schemas.Category);

// Expenses.allow({
//   insert: function () {
//     return true;
//   },
//   remove: function () {
//     return true;
//   }
// });

// Disable signup
Accounts.config({
  // forbidClientAccountCreation: true
});
