'use strict';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AccountSchema = new Schema({
  Balance: { type: Number, required: true },
  Name: { type: String, max: 100 },
  LocalId: { type: Number },
});

// OrderSchema.set('toJSON', { virtuals: true });

// Virtual for author's URL
AccountSchema.virtual('url').get(function() {
  return '/account/' + this._id + '/update';
});


// Export model
module.exports = mongoose.model('Account', AccountSchema);
