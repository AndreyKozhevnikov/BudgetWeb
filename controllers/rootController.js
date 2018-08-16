'use strict';
let Tag = require('../models/tag.js');
let Order = require('../models/order.js');
let async = require('async');
let formidable = require('formidable');
let fs = require('fs');
let order_controller = require('../controllers/orderController.js');
let tag_controller = require('../controllers/tagController.js');
let User = require('../models/user.js');

function checkTime(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function restore(req, res, next){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      next(err);
    };
    console.dir(files.file.path);
    fs.readFile(files.file.path, function(err, data) {
      if (err) {
        next(err);
      }
      console.log('data');
      console.log(data.toString());
      let testjsong = JSON.parse(data);
      console.log(testjsong);
      // console.assert(false);
      let storedTags = {};

      for (let i = 0; i < testjsong.length; i++) {
        let tmpOrder = testjsong[i];
        let tmpTag = tmpOrder.ParentTag;
        let storedTag = storedTags[tmpTag.Name];
        if (storedTag == undefined) {
          storedTag = tag_controller.createTagFromBackup(tmpTag);
          storedTags[storedTag.Name] = storedTag;
        }
        order_controller.createOrderFromBackup(tmpOrder, storedTag);
      }
    });
  });
}

function index(req, res){
  async.parallel(
    {
      tag_count: function(callback) {
        Tag.count(callback);
      },
      order_count: function(callback) {
        Order.count(callback);
      },
    },
    function(err, results) {
      let today = new Date();
      let h = today.getHours();
      let m = today.getMinutes();
      let s = today.getSeconds();
      // add a zero in front of numbers<10
      m = checkTime(m);
      s = checkTime(s);
      let tms = h + ':' + m + ':' + s;
      // res.send('test');
      res.render('index', {
        title: 'My budget web application',
        error: err,
        data: results,
        time: tms,
      });
    }
  );
}

function deleteAll(req, res, next) {
  // order_controller.deleteOrders(req, res, next);
  // tag_controller.deleteTags(res, res, next);
}

function wiki(req, res){
  res.render('wiki');
}
function wikiAbout(req, res) {
  res.send('About this wikitttt');
}
function orders_backup(req, res, next){
  order_controller.orders_backup(req, res, next);
}
function canCreateUser() {
  return process.env.CANCREATEUSER == 'TRUE';
}
function createUserGet(req, res, next) {
  if (!canCreateUser()) {
    next();
    return;
  }
  res.render('userview');
}
function createUserPost(req, res, next) {
  if (!canCreateUser()) {
    res.redirect('/login');
  }

  let user = new User({
    username: req.body.uname,
    password: req.body.upass,
  });

  user.save(function(err, resultuser) {
    if (err) {
      return next(err);
    }
    res.send('user created');
  });
}

exports.restore = restore;
exports.index = index;
exports.wikiAbout = wikiAbout;
exports.wiki = wiki;
exports.deleteAll = deleteAll;
exports.orders_backup = orders_backup;
exports.createUserGet = createUserGet;
exports.createUserPost = createUserPost;


