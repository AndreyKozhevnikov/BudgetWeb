'use strict';
let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let ServiceOrderSchema = new Schema({
  DateOrder: { type: Date, required: true },
  Type: { type: String, required: true },
  Value: { type: Number, required: true },
  Description: { type: String },
  IsCashBack: { type: Boolean },
  LocalId: { type: Number },
  AccountIn: { type: Schema.ObjectId, ref: 'Account' },
  AccountOut: { type: Schema.ObjectId, ref: 'Account' },
  CreatedTime: { type: Date },
});

ServiceOrderSchema.virtual('url').get(function() {
  return '/serviceOrder/' + this._id + '/update';
});
ServiceOrderSchema.virtual('DateOrder_pugFormat').get(function() {
  return moment(this.DateOrder).format('YYYY-MM-DD');
});
module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema);
