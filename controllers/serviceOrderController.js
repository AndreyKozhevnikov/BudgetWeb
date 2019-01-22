'use strict';
let ServiceOrder = require('../models/serviceOrder.js');
let Account = require('../models/account.js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
let accountList;

function createServiceOrderFromRequest(req, isUpdate) {
  var serviceOrder = new ServiceOrder({
    Type: req.body.Type_frm,
    LocalId: req.body.LocalId_frm,
    Value: req.body.Value_frm,
    Comment: req.body.Comment_frm,
    IsCashBack: Boolean(req.body.IsCashBack_frm),
    //  AccountIn: req.body.AccountIn_frm,
    //  AccountOut: req.body.AccountOut_frm,
  });
  if (req.body.AccountIn_frm !== '') {
    serviceOrder.AccountIn = req.body.AccountIn_frm;
  }
  if (req.body.AccountOut_frm !== '') {
    serviceOrder.AccountOut = req.body.AccountOut_frm;
  }
  if (isUpdate) {
    serviceOrder._id = req.params.id;
  }
  return serviceOrder;
}

function create_get(req, res, next) {
  let testLst = ['in', 'out', 'between'];

  res.render('serviceOrder_form', {
    title: 'Create ServiceOrder',
    account_list: accountList,
    type_list: testLst,
  });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  var serviceOrder = createServiceOrderFromRequest(req, false);

  if (!errors.isEmpty()) {
    res.render('serviceOrder_form', {
      title: 'Create ServiceOrder(error)',
      serviceOrder_frm: serviceOrder,
      errors: errors.array(),
    });
    return;
  } else {
    serviceOrder.save(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/serviceOrder/list');
    });
  }
};

let create_post_array = [
  body('Type_frm', 'Type required')
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody('Type_frm')
    .trim()
    .escape(),
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  sanitizeBody('Value_frm')
    .trim()
    .escape(),
  sanitizeBody('Comment_frm')
    .trim()
    .escape(),
  (req, res, next) => create_post(req, res, next),
];

function populateLists() {
  Account.find(function(err, res) {
    if (err) {

    } else {
      accountList = res;
    }
  });
}

function list(req, res, next) {
  ServiceOrder.find().exec(function(err, list_serviceOrders) {
    if (err) {
      return next(err);
    }
    res.render('serviceOrder_list', { title: 'Service Order List', serviceOrders_list: list_serviceOrders });
  });
};

populateLists();

exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
