'use strict';
let mongoose = require('mongoose');


let Schema = mongoose.Schema;

let OrderSchema = new Schema({
  Name: { type: String, max: 100, required: true },
  CurrentCount: { type: Number, required: true },
});

// Virtual for author's URL
OrderSchema.virtual('url').get(function() {
  return '/orderType/' + this._id + '/update';
});

// Export model
module.exports = mongoose.model('OrderType', OrderSchema);
