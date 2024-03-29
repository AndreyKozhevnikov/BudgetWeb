'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AccountSchema = new Schema({
  Name: { type: String, required: true },
  LocalId: { type: Number },
  OrderNumber: { type: Number },
  IsUntouchable: { type: Boolean },
  IsArchived: { type: Boolean },
  OrderInNumber: { type: Number },
  OrderOutNumber: { type: Number },
  HasMoneyBox: { type: Boolean },
  MoneyBoxId: { type: Schema.ObjectId, ref: 'Account' },
  IsMoneyBox: {type: Boolean},
  Currency: {type: String},
});

AccountSchema.virtual('url').get(function() {
  return '/account/' + this._id + '/update';
});

module.exports = mongoose.model('Account', AccountSchema);
