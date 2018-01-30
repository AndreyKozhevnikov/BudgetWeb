let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let OrderSchema = new Schema(
  {
    Tags: {type: String,  max: 100},
    Description: {type: String, required: true, max: 100},
    DateOrder: {type: Date,required: true,},
    Value: {type: Number,required: true,},
	IsJourney:{type: Boolean},
	ParentTag:{type: Schema.ObjectId, ref: 'Tag', required: true},
	
  }
);

// Virtual for author's full name
// OrderSchema
// .virtual('name')
// .get(function () {
  // return this.family_name + ', ' + this.first_name;
// });

// Virtual for author's URL
OrderSchema
.virtual('url')
.get(function () {
  return '/catalog/order/' + this._id;
});

//Export model
module.exports = mongoose.model('Order', OrderSchema);