'use strict';
let Account = require('../models/account.js');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
    Account.findOne({ Name: req.body.Name_frm }).exec(function(err, found_acc) {
      if (err) {
        return next(err);
      }
      if (found_acc) {
        res.redirect(found_acc.url);
      } else {
        account.save(function(err) {
          if (err) {
            return next(err);
          }
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
  Account.find().exec(function(err, list_account) {
    if (err) {
      return next(err);
    }
    res.render('account_list', { title: 'Account List', list_account: list_account });
  });
};

function aggregatedList(req, res, next) {
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
          localField: '_id',
          foreignField: 'AccountOut',
          as: 'acOutSOrders',
        },
      },
      {
        $lookup: {
          from: 'serviceorders',
          localField: '_id',
          foreignField: 'AccountIn',
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
    function(err, accList) {
      if (err) {
        next(err);
      }
      accList.sort(function(a, b) {
        let aNumber = a.ordernumber;
        let bNumber = b.ordernumber;
        if (aNumber === null)
          aNumber = 999;
        if (bNumber === null)
          bNumber = 999;
        return aNumber - bNumber;
      });
      let commonSum = 0;
      accList.forEach((item) => {
        item.result = item.sumInSOrders - item.sumOutSOrders - item.sumPayments;
        item.url = '/account/' + item._id + '/update';
        commonSum = commonSum + item.result;
      });
      res.render('account_list_aggregate', { title: 'Account List', list_account: accList, commonSum: commonSum });
    }
  );
  // Order.Populate('PaymentType').aggregate(
  //   [
  //     {
  //       $match: {
  //         IsDeleted: { $exists: false },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$PaymentType.Account',
  //         msum: { $sum: '$Value' },
  //         count: { $sum: 1 },

  //       },
  //     },
  //   ]
  // ).exec(function(err, results) {
  //   if (err) {
  //     next(err);
  //   }

  // });
}

function update_get(req, res, next) {
  Account.findById(req.params.id).exec(function(err, result) {
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
    Account.findByIdAndUpdate(req.params.id, account, [], function(err, theAcc) {
      if (err) {
        return next(err);
      }
      res.redirect('/account/list');
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
