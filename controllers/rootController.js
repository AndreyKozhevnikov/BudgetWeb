'use strict';
let Tag = require('../models/tag.js');
let Order = require('../models/order.js');
let PaymentType = require('../models/paymentType.js');

// let TestParent = require('../MyTest/testparent.js');
// let TestIntermediate = require('../MyTest/testintermediate.js');
// let TestChild = require('../MyTest/testchild.js');

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
      if (data.length === 0)
        return;
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

const assert = require('assert');
const mongoose = require('mongoose');
mongoose.set('debug', true);

//const GITHUB_ISSUE = `gh7489`;
const GITHUB_ISSUE = `testOrders`;
const connectionString = `mongodb://localhost:27017/${GITHUB_ISSUE}`;
const { Schema } = mongoose;

run().then(() => console.log('done')).catch(error => console.error(error.stack));

async function run() {
  await mongoose.connect(connectionString);
  await mongoose.connection.dropDatabase();

  let TestOrderSchema = new mongoose.Schema({
    Name: { type: String },
    OrderNumber: { type: Number },
  });
  const TestOrder = mongoose.model('TestOrder', TestOrderSchema);
  let order1 = new TestOrder({ Name: 'order1', OrderNumber: 1 });
  let order2 = new TestOrder({ Name: 'order2', OrderNumber: 2 });
  await order1.save();
  await order2.save();

  let fOrder = await TestOrder.findOne().sort({ OrderNumber: -1 });


  let TestParentSchema = new mongoose.Schema({
    Name: { type: String },
  });
  const TestParent = mongoose.model('TestParent', TestParentSchema);

  let TestIntermediateSchema = new mongoose.Schema({
    Name: { type: String },
    Parent: { type: Schema.ObjectId, ref: 'TestParent' },
  });
  const TestIntermediate = mongoose.model('TestIntermediate', TestIntermediateSchema);

  let TestChildSchema = new mongoose.Schema({
    Name: { type: String },
    Value: { type: Number, required: true },
    Intermediate: { type: Schema.ObjectId, ref: 'TestIntermediate' },
  });
  const TestChild = mongoose.model('TestChild', TestChildSchema);

  let parent1 = new TestParent({ Name: 'parent1' });
  let parent2 = new TestParent({ Name: 'parent2' });
  await parent1.save();
  await parent2.save();

  let inter11 = new TestIntermediate({ Name: 'inter1-1', Parent: parent1 });
  let inter12 = new TestIntermediate({ Name: 'inter1-2', Parent: parent1 });
  let inter21 = new TestIntermediate({ Name: 'inter2-1', Parent: parent2 });
  let inter22 = new TestIntermediate({ Name: 'inter2-2', Parent: parent2 });
  await inter11.save();
  await inter21.save();
  await inter12.save();
  await inter22.save();

  let child111 = new TestChild({ Name: 'child1-1-1', Intermediate: inter11, Value: 5 });
  let child112 = new TestChild({ Name: 'child1-1-2', Intermediate: inter12, Value: 60 });
  let child211 = new TestChild({ Name: 'child2-1-1', Intermediate: inter21, Value: 10 });
  let child212 = new TestChild({ Name: 'child2-1-2', Intermediate: inter22, Value: 70 });

  await child111.save();
  await child112.save();
  await child211.save();
  await child212.save();


  TestParent.aggregate(
    [
      {
        $lookup: {
          from: 'testintermediates',
          localField: '_id',
          foreignField: 'Parent',
          as: 'myIntermediates',
        },
      },
      // {
      //   $lookup: {
      //     from: 'testchildren',
      //     localField: 'myIntermediates._id',
      //     foreignField: 'Intermediate',
      //     as: 'myChildren',
      //   },
      // },
      // { //to check whether this approach works with the first level (it works)
      //   $lookup: {
      //     from: 'testintermediates',
      //     let: { myid: '$_id' },
      //     pipeline: [
      //       {
      //         $match:
      //         {
      //           $expr: {
      //             $eq: ['$Parent', '$$myid'],
      //             // $eq: ['$LocalId', 55],

      //           },
      //         },
      //       },
      //     ],
      //     as: 'myIntermediates',
      //   },
      // },
      {
        $unwind: '$myIntermediates'
      },
      {
        $lookup: {
          from: 'testchildren',
          let: { intermedId: '$myIntermediates._id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $eq: ['$Intermediate', '$$intermedId'], //it doesn't work (
                  // $eq: ['$Value', 60], //it works
                },
              },
            },
          ],
          as: 'myChildren',
        },
      },
      {
        $project: {
          myName: '$Name',
          sumChildren: { $sum: '$myChildren.Value' },
        },
      },
    ],
    function(err, results) {
      let expectedResult0 = results[0].sumChildren === 5;
      let expectedResult1 = results[1].sumChildren === 10;
      console.log(expectedResult0);
      console.log(expectedResult1);
    }
  );
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
  //test();
}

// function test() {
//   let parent1 = new TestParent({ Name: 'parent1' });
//   let parent2 = new TestParent({ Name: 'parent2' });
//   parent1.save();
//   parent2.save();

//   let inter11 = new TestIntermediate({ Name: 'inter1-1', Parent: parent1 });
//   let inter21 = new TestIntermediate({ Name: 'inter2-1', Parent: parent2 });
//   inter11.save();
//   inter21.save();

//   let child111 = new TestChild({ Name: 'child1-1-1', Intermediate: inter11, Value: 5 });
//   let child112 = new TestChild({ Name: 'child1-1-2', Intermediate: inter11, Value: 60 });
//   let child211 = new TestChild({ Name: 'child2-1-1', Intermediate: inter21, Value: 10 });
//   let child212 = new TestChild({ Name: 'child2-1-2', Intermediate: inter21, Value: 70 });

//   child111.save();
//   child112.save();
//   child211.save();
//   child212.save();
//   TestParent.aggregate(
//     [
//       {
//         $lookup: {
//           from: 'testintermediates',
//           localField: '_id',
//           foreignField: 'Parent',
//           as: 'myIntermediates',
//         },
//       },
//       // {
//       //   $lookup: {
//       //     from: 'testchildren',
//       //     localField: 'myIntermediates._id',
//       //     foreignField: 'Intermediate',
//       //     as: 'myChildren',
//       //   },
//       // },
//       // { //to check if this approach works with the first level
//       //   $lookup: {
//       //     from: 'testintermediates',
//       //     let: { myid: '$_id' },
//       //     pipeline: [
//       //       {
//       //         $match:
//       //         {
//       //           $expr: {
//       //             $eq: ['$Parent', '$$myid'],
//       //             // $eq: ['$LocalId', 55],

//       //           },
//       //         },
//       //       },
//       //     ],
//       //     as: 'myIntermediates',
//       //   },
//       // },
//       {
//         $lookup: {
//           from: 'testchildren',
//           let: { intermedId: '$myIntermediates._id' },
//           pipeline: [
//             {
//               $match:
//               {
//                 $expr: {
//                   $eq: ['$Intermediate', '$$intermedId'],
//                   // $eq: ['$Value', 60], //it works
//                 },
//               },
//             },
//           ],
//           as: 'myChildren',
//         },
//       },
//       {
//         $project: {
//           myName: '$Name',
//           sumChildren: { $sum: '$myChildren.Value' },
//         },
//       },
//     ],
//     function(err, results) {
//       let res1 = results[0].sumChildren === 5;
//       let res2 = results[1].sumChildren === 10;
//     }
//   );


// }

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

