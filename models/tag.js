'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let TagSchema = new Schema({
  Name: {type: String, required: true, max: 100},
  LocalId: {type: Number, required: true},
  OrderNumber: {type: Number},
});

// Virtual for author's full name
// OrderSchema
// .virtual('name')
// .get(function () {
// return this.family_name + ', ' + this.first_name;
// });

// Virtual for author's URL
TagSchema.virtual('url').get(function() {
  return '/tag/' + this._id;
});

// Export model
module.exports = mongoose.model('Tag', TagSchema);
