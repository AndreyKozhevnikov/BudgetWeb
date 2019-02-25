'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AccountSchema = new Schema({
  Name: { type: String, required: true },
  LocalId: { type: Number, required: true },
  OrderNumber: { type: Number },
  IsUntouchable: { type: Boolean },
});

AccountSchema.virtual('url').get(function() {
  return '/account/' + this._id + '/update';
});

module.exports = mongoose.model('Account', AccountSchema);
