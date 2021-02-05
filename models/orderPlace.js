'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let OrderPlaceSchema = new Schema({
  Name: {type: String, required: true, max: 100},
  LocalId: {type: Number},
  HasImage: { type: Boolean },
});

// Virtual for URL
OrderPlaceSchema.virtual('url').get(function() {
  return '/orderPlace/' + this._id + '/update';
});

// Export model
module.exports = mongoose.model('OrderPlace', OrderPlaceSchema);
