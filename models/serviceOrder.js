'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ServiceOrderSchema = new Schema({
  Type: { type: String, required: true },
  Value: { type: Number, required: true },
  Comment: { type: String },
  IsCashBack: { type: Boolean },
  LocalId: { type: Number, required: true },
  AccountIn: { type: Schema.ObjectId, ref: 'Account' },
  AccountOut: { type: Schema.ObjectId, ref: 'Account' },
});

ServiceOrderSchema.virtual('url').get(function() {
  return '/serviceOrder/' + this._id + '/update';
});

module.exports = mongoose.model('ServiceOrder', ServiceOrderSchema);
