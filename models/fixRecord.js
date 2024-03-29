'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let FixRecordSchema = new Schema({
  Type: { type: String },
  DateTime: { type: Date, required: true },
  Account: { type: Schema.ObjectId, ref: 'Account' },
  Value: { type: Number, required: true },
  LocalId: { type: Number },
  Currency: {type: String},
});

module.exports = mongoose.model('FixRecord', FixRecordSchema);
