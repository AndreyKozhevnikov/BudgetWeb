let mongoose = require('mongoose');
let moment = require('moment');

let Schema = mongoose.Schema;

let OrderSchema = new Schema(
  {

    DateOrder: {type: Date,required: true,},
    Value: {type: Number,required: true,},    
    Description: {type: String,  max: 100},
    ParentTag:{type: Schema.ObjectId, ref: 'Tag', required: true},  
	  IsJourney:{type: Boolean},
    Tags: {type: String,  max: 100},
    LocalId:{type: Number},
    IsDeleted:{type:Boolean}
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

OrderSchema
.virtual('DateOrder_formatted')
.get(function(){
  return moment(this.DateOrder).format("DD MMMM YYYY ddd");
})
OrderSchema
.virtual('DateOrder_pugFormat')
.get(function () {
  return moment(this.DateOrder).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('Order', OrderSchema);