'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let OrderPlaceSchema = new Schema({
  Name: {type: String, required: true, max: 100},
  LocalId: {type: Number},
});

// Virtual for URL
OrderPlaceSchema.virtual('url').get(function() {
  return '/tag/' + this._id;
});

// Export model
module.exports = mongoose.model('OrderPlace', OrderPlaceSchema);