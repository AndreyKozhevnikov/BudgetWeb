var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});
UserSchema.pre('save',function(next){
  let user=this;
  bcrypt.hash(user.password,10,function(err,hash){
    if (err){return next(err);}
    console.log('pass '+user.password);
    console.log('hash '+hash);
    user.password=hash;
    next();
  })
})
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      console.log('---user---');
      console.log(username);
      console.log(password);
        console.log(user.password);
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          console.log('bcrypt true');
          return callback(null, user);
        } else {
          console.log('bcrypt false');
          return callback();
        }
      })
    });
}
var User = mongoose.model('User', UserSchema);
module.exports = User;