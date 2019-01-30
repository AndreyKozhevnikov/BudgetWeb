'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TestChildSchema = new Schema({
  Name: { type: String },
  Value: { type: Number, required: true },
  Intermediate: { type: Schema.ObjectId, ref: 'TestIntermediate' },
});
module.exports = mongoose.model('TestChild', TestChildSchema);
