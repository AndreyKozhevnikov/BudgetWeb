'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TestIntermediateSchema = new Schema({
  Name: { type: String },
  Parent: { type: Schema.ObjectId, ref: 'TestParent' },
});
module.exports = mongoose.model('TestIntermediate', TestIntermediateSchema);
