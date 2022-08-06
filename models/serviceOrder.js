'use strict';
let mongoose = require('mongoose');
let moment = require('moment');
let Helper = require('../controllers/helperController.js');

let Schema = mongoose.Schema;

let ServiceOrderSchema = new Schema({
  DateOrder: { type: Date, required: true },
  Type: { type: String, required: true },
  Value: { type: Number, required: true },
  Description: { type: String },
  LocalId: { type: Number },
  AccountIn: { type: Schema.ObjectId, ref: 'Account' },
  AccountOut: { type: Schema.ObjectId, ref: 'Account' },
  CreatedTime: { type: Date },
});

ServiceOrderSchema.virtual('url').get(function() {
  return '/serviceOrder/' + this._id + '/update';
});
ServiceOrderSchema.virtual('DateOrder_pugFormat').get(function() {
  return Helper.getUrlDateString(this.DateOrder);
});
module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema);
