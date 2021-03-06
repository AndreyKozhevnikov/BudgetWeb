'use strict';
let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let Helper = require('../controllers/helperController.js');

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});
UserSchema.pre('save', function(next) {
  if (Helper.isRestoreMode)
    next();
  let user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});
UserSchema.statics.authenticate = function(username, password, callback, id) {
  User.findOne({ $or: [{ username: username }, { _id: id }] })
    // User.findOne({_id:id})
    .exec(function(err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {
        let err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      if (id) {
        return callback(null, user);
      }
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          console.dir(err);
        }
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
};

let User = mongoose.model('User', UserSchema);

module.exports = User;
