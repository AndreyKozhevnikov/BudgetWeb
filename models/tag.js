var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagSchema = new Schema(
  {
    Name: {type: String, required: true, max: 100},
  }
);

// Virtual for author's full name
// OrderSchema
// .virtual('name')
// .get(function () {
  // return this.family_name + ', ' + this.first_name;
// });

// Virtual for author's URL
// OrderSchema
// .virtual('url')
// .get(function () {
  // return '/catalog/order/' + this._id;
// });

//Export model
module.exports = mongoose.model('Tag', TagSchema);