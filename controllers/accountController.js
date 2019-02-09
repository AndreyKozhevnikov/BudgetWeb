'use strict';
let Account = require('../models/account.js');
let FixRecord = require('../models/fixRecord.js');
let ServiceOrder = require('../models/serviceOrder.js');
let async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
let FRecordTypes = { StartMonth: 'StartMonth', Check: 'Check' };

function create_get(req, res, next) {
  res.render('account_form', {
    title: 'Create Account',
  });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  var account = createAccountFromRequest(req, false);

  if (!errors.isEmpty()) {
    res.render('account_form', {
      title: 'Create account(error)',
      account_frm: account,
      errors: errors.array(),
    });
    return;
  } else {
    Account.findOne({ Name: req.body.Name_frm }).exec(function (err, found_acc) {
      if (err) {
        return next(err);
      }
      if (found_acc) {
        res.redirect(found_acc.url);
      } else {

        account.save(function (err, acc) {
          if (err) {
            return next(err);
          }
          let fRec = new FixRecord({
            Type: FRecordTypes.StartMonth,
            DateTime: Date.now(),
            Account: acc,
            Value: 0,
          });
          fRec.save();
          res.redirect('/account/list');
        });
      }
    });
  }
};
let create_post_array = [
  body('Name_frm', 'Tag name required')
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody('Name_frm')
    .trim()
    .escape(),
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  (req, res, next) => create_post(req, res, next),
];

function list(req, res, next) {
  Account.find().exec(function (err, list_account) {
    if (err) {
      return next(err);
    }
    res.render('account_list', { title: 'Account List', list_account: list_account });
  });
};

function createFOrdersForFeb19(req, res, next) {
  Account.aggregate(
    [
      {
        $lookup: {
          from: 'paymenttypes',
          localField: '_id',
          foreignField: 'Account',
          as: 'acPayments',
        },
      },
      {
        $unwind: {
          path: '$acPayments',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'orders',
          let: { ptId: '$acPayments._id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$PaymentType', '$$ptId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          as: 'filteredOrders',
        },
      },
      {
        $project: {
          name: '$Name',
          ordernumber: '$OrderNumber',
          _id: '$_id',
          sumfOrders: { $sum: '$filteredOrders.Value' },
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          ordernumber: { $first: '$ordernumber' },
          fOrders: { $sum: '$sumfOrders' },
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { mId: '$_id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$AccountOut', '$$mId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          // localField: '_id',
          // foreignField: 'AccountOut',
          as: 'acOutSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          let: { mId: '$_id' },
          pipeline: [
            {
              $match:
              {
                $expr: {
                  $and: [
                    { $eq: ['$AccountIn', '$$mId'] },
                    { $gte: ['$DateOrder', new Date('2019-01-23')] },
                    { $lt: ['$DateOrder', new Date('2019-02-01')] },
                  ],

                },
              },
            },
          ],
          // localField: '_id',
          // foreignField: 'AccountIn',
          as: 'acInSOrders',
        },
      },
      {
        $project: {
          name: '$name',
          _id: '$_id',
          sumPayments: { $sum: '$fOrders' },
          sumInSOrders: { $sum: '$acInSOrders.Value' },
          sumOutSOrders: { $sum: '$acOutSOrders.Value' },
          ordernumber: '$ordernumber',
        },
      },
    ],
    function (err, accList) {
      if (err) {
        next(err);
      }
      let commonSum = 0;
      accList.forEach((item) => {
        item.result = item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
        Account.findById(item._id).exec(function (err, acc) {
          if (err) {

          } else {
            let fRec = new FixRecord({
              Type: FRecordTypes.StartMonth,
              DateTime: new Date('2019-02-01'),
              Account: acc,
              Value: item.result,
            });
            fRec.save();
          }
        });


        // item.url = '/account/' + item._id + '/update';
        // commonSum = commonSum + item.result;
      });
      res.render('account_list_aggregate', { title: 'Account List', list_account: accList, commonSum: commonSum });
    }
  );
}
function handlerError(next, err) {
  if (err) {
    next(err);
  }
}
function aggregatedList(req, res, next) {
  // FixRecord.find(null, (err, list) => {
  //   handlerError(next, err);
  //   let maxfOrderDate = Math.max.apply(null, list.map((a) => { return a.DateTime; }));
  //   let maxfOrderDate2 = new Date(maxfOrderDate);
  // });
  FixRecord.findOne({ Type: FRecordTypes.StartMonth }).sort('-DateTime').exec((err, res) => {
    handlerError(next, err);
    let lastFOrderTime = res.DateTime;
    let dNow = new Date();
    let firstDayOfCurrMonth = new Date(dNow.getFullYear(), dNow.getMonth(), 1);
    let secondDayOfTargetMonth = new Date();
    if (lastFOrderTime < firstDayOfCurrMonth) {

    } else {
      secondDayOfTargetMonth.setDate(firstDayOfCurrMonth.getDate() + 1);
      async.parallel({
        accounts: function (callback) {
          Account.find(callback);
        },
        fixRecords: function (callback) {
          FixRecord
            .aggregate(
              [
                {
                  $match:
                  {
                    $and: [
                      { Type: FRecordTypes.StartMonth },
                      { DateTime: { "$gte": firstDayOfCurrMonth, "$lt": secondDayOfTargetMonth } },
                    ],
                  },
                },
                {
                  $group: {
                    _id: '$Account',
                    fRecords: {
                      $push: {
                        dateTime: '$DateTime',
                        value: '$Value',
                      },
                    },
                  },
                },
              ]
            ).exec(callback);
        },
        sOrdersIn: function (callback) {
          ServiceOrder
            .aggregate(
              [
                {
                  $match: { AccountIn: { $exists: true } },
                },
                {
                  $group: {
                    _id: '$AccountIn',
                    // name: { $first: '$AccountIn' },
                    fRecords: {
                      $push: {
                        DateOrder: '$DateOrder',
                        Value: '$Value',
                        Description: '$Description',
                      },
                    },
                  },
                },
              ]
            ).exec(callback);
        },
        sOrdersOut: function (callback) {
          ServiceOrder
            .aggregate(
              [
                {
                  $match: { AccountOut: { $exists: true } },
                },
                {
                  $group: {
                    _id: '$AccountOut',
                    // name: { $first: '$AccountIn' },
                    fRecords: {
                      $push: {
                        DateOrder: '$DateOrder',
                        Value: '$Value',
                        Description: '$Description',
                      },
                    },
                  },
                },
              ]
            ).exec(callback);
        },

      }, (err, result) => {
        if (err) {
          next(err);
        }
        let r = result;
      });
    }

  });





  // Account.find((err, _accList) => {
  //   if (err) {
  //     next(err);
  //   }
  //   _accList.forEach((acc) => {
  //     FixRecord.find({ Account: acc }).exec((err, list) => {
  //       if (err) {
  //         next(err);
  //       }
  //       let maxDate = Math.max.apply(null, list.map((a) => { return a.DateTime; }));
  //       let maxDate2 = Math.max(list.map((a) => { return a.DateTime; }));
  //     });
  //   });
  // });


  // Account.aggregate(
  //   [
  //     {
  //       $lookup: {
  //         from: 'paymenttypes',
  //         localField: '_id',
  //         foreignField: 'Account',
  //         as: 'acPayments',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$acPayments',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'orders',
  //         let: { ptId: '$acPayments._id' },
  //         pipeline: [
  //           {
  //             $match:
  //             {
  //               $expr: {
  //                 $and: [
  //                   { $eq: ['$PaymentType', '$$ptId'] },
  //                   { $gte: ['$DateOrder', new Date('2019-01-23')] },
  //                 ],

  //               },
  //             },
  //           },
  //         ],
  //         as: 'filteredOrders',
  //       },
  //     },
  //     {
  //       $project: {
  //         name: '$Name',
  //         ordernumber: '$OrderNumber',
  //         _id: '$_id',
  //         sumfOrders: { $sum: '$filteredOrders.Value' },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$_id',
  //         name: { $first: '$name' },
  //         ordernumber: { $first: '$ordernumber' },
  //         fOrders: { $sum: '$sumfOrders' },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'serviceorders',
  //         localField: '_id',
  //         foreignField: 'AccountOut',
  //         as: 'acOutSOrders',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'serviceorders',
  //         localField: '_id',
  //         foreignField: 'AccountIn',
  //         as: 'acInSOrders',
  //       },
  //     },
  //     {
  //       $project: {
  //         name: '$name',
  //         _id: '$_id',
  //         sumPayments: { $sum: '$fOrders' },
  //         sumInSOrders: { $sum: '$acInSOrders.Value' },
  //         sumOutSOrders: { $sum: '$acOutSOrders.Value' },
  //         ordernumber: '$ordernumber',
  //       },
  //     },
  //   ],
  //   function(err, accList) {
  //     if (err) {
  //       next(err);
  //     }
  //     accList.sort(function(a, b) {
  //       let aNumber = a.ordernumber;
  //       let bNumber = b.ordernumber;
  //       if (aNumber === null)
  //         aNumber = 999;
  //       if (bNumber === null)
  //         bNumber = 999;
  //       return aNumber - bNumber;
  //     });
  //     let commonSum = 0;
  //     accList.forEach((item) => {
  //       item.result = item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
  //       item.url = '/account/' + item._id + '/update';
  //       commonSum = commonSum + item.result;
  //     });
  //     res.render('account_list_aggregate', { title: 'Account List', list_account: accList, commonSum: commonSum });
  //   }
  // );
}

function update_get(req, res, next) {
  Account.findById(req.params.id).exec(function (err, result) {
    if (err) {
      next(err);
    }
    res.render('account_form', { title: 'Update Account', account_frm: result });
  });
};

function createAccountFromRequest(req, isUpdate) {
  var account = new Account({
    Name: req.body.Name_frm,
    LocalId: req.body.LocalId_frm,
    OrderNumber: req.body.OrderNumber_frm,
  });
  if (isUpdate) {
    account._id = req.params.id;
  }
  return account;
}

function update_post(req, res, next) {
  let account = createAccountFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('account_form', { title: 'Update Account', account_frm: account });
  } else {
    Account.findByIdAndUpdate(req.params.id, account, [], function (err, theAcc) {
      if (err) {
        return next(err);
      }
      res.redirect('/account/aggregatedList');
    });
  }
}

let update_post_array = [
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  sanitizeBody('Name_frm')
    .trim()
    .escape(),
  (req, res, next) => update_post(req, res, next),
];

exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.aggregatedList = aggregatedList;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.createFOrdersForFeb19 = createFOrdersForFeb19;
