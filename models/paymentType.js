'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PaymentTypeSchema = new Schema({
  Name: { type: String, max: 100, required: true },
  LocalId: { type: Number },
  Account: { type: Schema.ObjectId, ref: 'Account' },
});
// Virtual for author's URL
PaymentTypeSchema.virtual('url').get(function() {
  return '/paymentType/' + this._id + '/update';
});

// Export model
module.exports = mongoose.model('PaymentType', PaymentTypeSchema);
