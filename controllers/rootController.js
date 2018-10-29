'use strict';
let Tag = require('../models/tag.js');
let Order = require('../models/order.js');
let PaymentType = require('../models/paymentType.js');
let async = require('async');
let formidable = require('formidable');
let fs = require('fs');
let order_controller = require('../controllers/orderController.js');
let tag_controller = require('../controllers/tagController.js');
let paymentType_controller = require('../controllers/paymentTypeController.js');
let User = require('../models/user.js');

function checkTime(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function restore(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      next(err);
    };
    // console.dir(files.file.path);
    fs.readFile(files.file.path, function(err, data) {
      if (err) {
        next(err);
      }
      // console.log('data');
      // console.log(data.toString());
      let testjsong = JSON.parse(data);
      // console.log(testjsong);
      // console.assert(false);
      let storedTags = {};
      let storedPaymentTypes = {};

      for (let i = 0; i < testjsong.length; i++) {
        let tmpOrder = testjsong[i];
        let tmpTag = tmpOrder.ParentTag;
        let storedTag = storedTags[tmpTag.Name];
        if (storedTag === undefined) {
          storedTag = tag_controller.createTagFromBackup(tmpTag);
          storedTags[storedTag.Name] = storedTag;

        }
        let storedPType;
        if (tmpOrder.PaymentType) {
          let tmpPType = tmpOrder.PaymentType;
          storedPType = storedPaymentTypes[tmpPType.Name];
          if (storedPType === undefined) {
            storedPType = paymentType_controller.createPaymentTypeFromBackup(tmpPType);
            storedPaymentTypes[storedPType.Name] = storedPType;
          }
        }
        order_controller.createOrderFromBackup(tmpOrder, storedTag, storedPType);
      }
    });
  });
}

function index(req, res) {
  async.parallel(
    {
      tag_count: function(callback) {
        Tag.countDocuments(callback);
      },
      order_count: function(callback) {
        Order.countDocuments(callback);
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
  if (!canDeleteEntities()) {
    res.send('cant delete objects');
    return;
  }
  order_controller.deleteOrders(req, res, next);
  tag_controller.deleteTags(res, res, next);
  paymentType_controller.deleteTypes(req, res, next);
}

function wiki(req, res) {
  res.render('wiki');
}
function wikiAbout(req, res) {
  res.send('About this wikitttt');
}
function orders_backup(req, res, next) {
  order_controller.orders_backup(req, res, next);
}
function canCreateUser() {
  return process.env.CANCREATEUSER === 'TRUE';
}
function canDeleteEntities() {
  return process.env.CANDELETEENTITIES === 'TRUE';
}
function createUserGet(req, res, next) {
  if (!canCreateUser()) {
    res.send('cant create user');
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

function update_localid(req, res, next) {
  let id = req.body.id;
  let localId = req.body.localid;
  let type = req.body.type;
  let rt;
  switch (type) {
    case 'Order':
      rt = Order;
      break;
    case 'Tag':
      rt = Tag;
      break;
    case 'PaymentType':
      rt = PaymentType;
      break;
  }
  rt.findById(id, function(err, theEntity) {
    if (err) {
      next(err);
    }
    theEntity.LocalId = localId;
    theEntity.save(function(err, savedEntity) {
      if (err) {
        next(err);
      }
      res.send('update is Successful');
    });
  });
};

exports.restore = restore;
exports.index = index;
exports.wikiAbout = wikiAbout;
exports.wiki = wiki;
exports.deleteAll = deleteAll;
exports.orders_backup = orders_backup;
exports.createUserGet = createUserGet;
exports.createUserPost = createUserPost;
exports.update_localid = update_localid;

