'use strict';
let ServiceOrder = require('../models/serviceOrder.js');
let Account = require('../models/account.js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
let accountList;
let typesList = ['in', 'out', 'between'];

function createServiceOrderFromRequest(req, isUpdate) {
  var serviceOrder = new ServiceOrder({
    DateOrder: req.body.DateOrder_frm,
    Type: req.body.Type_frm,
    LocalId: req.body.LocalId_frm,
    Value: req.body.Value_frm,
    Description: req.body.Description_frm,
    IsCashBack: Boolean(req.body.IsCashBack_frm),
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
  res.render('serviceOrder_form', {
    title: 'Create ServiceOrder',
    account_list: accountList,
    type_list: typesList,
  });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  let serviceOrder = createServiceOrderFromRequest(req, false);

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
  sanitizeBody('Description_frm')
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
  ServiceOrder
    .find()
    .populate('AccountOut')
    .populate('AccountIn')
    .exec(function(err, list_serviceOrders) {
      if (err) {
        return next(err);
      }
      res.render('serviceOrder_list', { title: 'Service Order List', serviceOrders_list: list_serviceOrders });
    });
};

function update_get(req, res, next) {
  ServiceOrder
    .findById(req.params.id)
    .exec(function(err, sOrder) {
      if (err) {
        return next(err);
      }
      res.render('serviceOrder_form', {
        title: 'Update SOrder',
        serviceOrder_frm: sOrder,
        account_list: accountList,
        type_list: typesList,
      });
    });
}; function update_post(req, res, next) {
  let serviceOrder = createServiceOrderFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    res.render('serviceOrder_form', {
      title: 'Create ServiceOrder(error)',
      serviceOrder_frm: serviceOrder,
      errors: errors.array(),
    });
    return;
  } else {
    // Data from form is valid.

    ServiceOrder
      .findByIdAndUpdate(req.params.id, serviceOrder, [], function(
        err,
        theSOrder) {
        if (err) {
          return next(err);
        }
        res.redirect('/serviceOrder/list');
      });
  }
};
let update_post_array = [
  // validate fields
  body('DateOrder_frm', 'Invalid date of order')
    .optional({ checkFalsy: true })
    .isISO8601(),
  // body('fTags', 'Description required').isLength({ min: 1 }).trim(),
  // Sanitize fields.
  sanitizeBody('DateOrder_frm').toDate(),
  sanitizeBody('Value_frm')
    .trim()
    .escape(),
  sanitizeBody('Description_frm')
    .trim()
    .escape(),
  sanitizeBody('LocalId_frm')
    .trim()
    .escape(),
  (req, res, next) => update_post(req, res, next),
];
populateLists();

exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.update_get = update_get;
exports.update_post = update_post_array;
