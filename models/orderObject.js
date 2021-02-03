'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let OrderObjectSchema = new Schema({
  Name: {type: String, required: true, max: 100},
  LocalId: {type: Number, required: true},
});

// Virtual for URL
OrderObjectSchema.virtual('url').get(function() {
  return '/tag/' + this._id;
});

// Export model
module.exports = mongoose.model('OrderObject', OrderObjectSchema);