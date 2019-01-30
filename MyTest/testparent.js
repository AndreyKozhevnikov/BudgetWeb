'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TestParentSchema = new Schema({
  Name: { type: String },
});
module.exports = mongoose.model('TestParent', TestParentSchema);

