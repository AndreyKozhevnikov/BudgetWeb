'use strict';
let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let OrderSchema = new Schema({
  DateOrder: { type: Date, required: true },
  Value: { type: Number, required: true },
  Description: { type: String, max: 100 },
  ParentTag: { type: Schema.ObjectId, ref: 'Tag', required: true },
  IsJourney: { type: Boolean },
  Tags: { type: String, max: 100 },
  LocalId: { type: Number },
  IsDeleted: { type: Boolean },
  PaymentType: { type: Schema.ObjectId, ref: 'PaymentType' }, // is required to restore from backup
  PaymentAccount: { type: Schema.ObjectId, ref: 'Account' },
  CreatedTime: { type: Date },
  Place: { type: Schema.ObjectId, ref: 'OrderPlace' },
  Object: { type: Schema.ObjectId, ref: 'OrderObject' },
});

// OrderSchema.set('toJSON', { virtuals: true });

// Virtual for author's URL
OrderSchema.virtual('url').get(function() {
  return '/order/' + this._id + '/update';
});

OrderSchema.virtual('DateOrder_formatted').get(function() {
  return moment(this.DateOrder).format('DD MMMM YYYY ddd');
});
OrderSchema.virtual('DateOrder_pugFormat').get(function() {
  return moment(this.DateOrder).format('YYYY-MM-DD');
});

// Export model
module.exports = mongoose.model('Order', OrderSchema);
