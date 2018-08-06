#! /usr/bin/env node
'use strict';
console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url'
);
// test change master
// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
  console.log(
    'ERROR: You need to specify a valid mongodb URL as the first argument'
  );
  return;
}

var async = require('async');
var Order = require('./models/order.js');
var Tag = require('./models/tag.js');
// var Author = require('./models/author')
// var Genre = require('./models/genre')
// var BookInstance = require('./models/bookinstance')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
// var db = mongoose.connection;
mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error:')
);

var orders = [];
var tags = [];
// var genres = []              s       sssssssss sv vs v sq
// var books = []
// var bookinstances = []

function tagCreate(cb) {
  let tagDetail = {Name: 'testtagname'};
  var tag = new Tag(tagDetail);
  // tag.Name='test tag';
  tag.save(function(err) {
    if (err) {
      cb(err, null);
      console.log('tag error!!!!');
      return;
    }

    console.log('Second tag: ' + tag);
    tags.push(tag);
    cb(null, tag);
  });
}

function orderCreate(cb) {
  let orderDetail = {Description: 'second order', Value: 45};

  var order = new Order(orderDetail);
  order.ParentTag = tags[0];
  order.DateOrder = Date.now();
  order.IsJourney = true;
  order.save(function(err) {
    if (err) {
      console.log('myerr' + err);
      cb(err, null);
      return;
    }

    console.log('New Order: ' + order);
    orders.push(order);
    cb(null, order);
  });
}

function createOrders(cb) {
  async.parallel(
    [
      function(callback) {
        orderCreate(callback);
      },
    ],

    cb
  );
}
function createTags(cb) {
  async.parallel(
    [
      function(callback) {
        tagCreate(callback);
      },
    ],

    cb
  );
}

async.series(
  [createTags, createOrders],
  // optional callback
  function(err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('BOOKInstances: ' + orders);
    }
    // var lst=	Order.find();
    // console.log(lst.count());
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
