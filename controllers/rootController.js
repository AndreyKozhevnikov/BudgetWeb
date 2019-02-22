'use strict';

exports.index = index;
exports.wikiAbout = wikiAbout;
exports.wiki = wiki;
exports.deleteAll = deleteAll;
exports.createUserGet = createUserGet;
exports.createUserPost = createUserPost;
exports.update_localid = updatelocalid;
exports.full_backup = fullbackup;
exports.full_Restore = fullRestore;

let Order = require('../models/order.js');
let Account = require('../models/account.js');
let Tag = require('../models/tag.js');
let PaymentType = require('../models/paymentType.js');
let FixRecord = require('../models/fixRecord.js');
let ServiceOrder = require('../models/serviceOrder.js');
let User = require('../models/user.js');

let constructors = {
  Order: Order,
  Account: Account,
  Tag: Tag,
  PaymentType: PaymentType,
  FixRecord: FixRecord,
  ServiceOrder: ServiceOrder,
  User: User,
};

let async = require('async');
let formidable = require('formidable');
let fs = require('fs');
let order_controller = require('../controllers/orderController.js');
let tag_controller = require('../controllers/tagController.js');
let paymentType_controller = require('../controllers/paymentTypeController.js');
let stream = require('stream');

function checkTime(i) {
  if (i < 10) {
    i = '0' + i;
  }
  return i;
}

function formatDate(date) {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

async function fullbackup(req, res, next) {
  let ordersList = await Order.find();
  let accList = await Account.find();
  let fRecordsList = await FixRecord.find();
  let pTypesList = await PaymentType.find();
  let sOrdersList = await ServiceOrder.find();
  let tagsList = await Tag.find();
  let usersList = await User.find();

  let backupObject = {
    Order: ordersList,
    Account: accList,
    FixRecord: fRecordsList,
    PaymentType: pTypesList,
    ServiceOrder: sOrdersList,
    Tag: tagsList,
    User: usersList,
  };

  let fileContents = Buffer.from(JSON.stringify(backupObject));
  let readStream = new stream.PassThrough();
  readStream.end(fileContents);
  let backupFileName = 'BWbackup-' + formatDate(new Date()) + '.txt';
  res.set('Content-disposition', 'attachment; filename=' + backupFileName);
  res.set('Content-Type', 'text/plain');
  readStream.pipe(res);
}

async function formParseAsync(req) {
  let form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
}

async function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function fullRestore(req, res, next) {
  let files = await formParseAsync(req);
  let data = await readFileAsync(files.file.path);
  if (data.length === 0)
    return;
  let backupObject = JSON.parse(data);
  for (let entityCollectionProperty in backupObject) {
    let entityCollection = backupObject[entityCollectionProperty];
    for (let i = 0; i < entityCollection.length; i++) {
      let savedEntity = entityCollection[i];
      let createdEntity = new constructors[entityCollectionProperty](savedEntity);
      try {
        await createdEntity.save();
      } catch (err) {
        console.log(err);
      }
    }
  }
  res.redirect('/wiki');
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
      let tms = h + ':' + m + ':' + s + ' -- ' + today;
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

function updatelocalid(req, res, next) {
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

