'use strict';
let ServiceOrder = require('../models/serviceOrder.js');
let Account = require('../models/account.js');
let Helper = require('../controllers/helperController.js');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

let accountInList;
let accountOutList;
let popularAccInList;
let popularAccOutList;
let typesList = [Helper.sOrderTypes.between, Helper.sOrderTypes.in, Helper.sOrderTypes.out];

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
  } else {
    serviceOrder.CreatedTime = new Date();
  }
  return serviceOrder;
}

async function create_get(req, res, next) {
  let objToShow = await objectToShowForm('Create ServiceOrder');
  res.render('serviceOrder_form', objToShow);
};

function getCloneArray(arr) {
  let newArr = JSON.parse(JSON.stringify(arr));
  return newArr;
}

async function objectToShowForm(mTitle, serviceOrder, errors) {
  let obj = {
    title: mTitle,
    accountInList: accountInList,
    accountOutList: accountOutList,
    popularAccInList: popularAccInList,
    popularAccOutList: popularAccOutList,
    type_list: typesList,
  };
  if (serviceOrder) {
    obj.serviceOrder_frm = serviceOrder;
  }
  if (errors) {
    obj.errors = errors;
  }
  return obj;
}

function create_post(req, res, next) {
  const errors = validationResult(req);

  let serviceOrder = createServiceOrderFromRequest(req, false);

  if (!errors.isEmpty()) {
    let objToShow = objectToShowForm('Create ServiceOrder(error)', serviceOrder, errors.array());
    res.render('serviceOrder_form', objToShow);
    return;
  } else {
    serviceOrder.save(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/account/aggregatedList');
    });
  }
};

let create_post_array = [
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

async function populateLists() {
  try {
    let accountFind = Helper.promisify(Account.find, Account);
    let accountList = await accountFind({
      $or: [
        { IsArchived: false },
        { IsArchived: { $exists: false } },
      ],
    }
    );
    let soAggregate = Helper.promisify(ServiceOrder.aggregate, ServiceOrder);
    let cutDate = Helper.getCutDate();
    let sOrdersGroupedByInAcc = await soAggregate([
      {
        $match: {
          DateOrder: { $gt: cutDate },
          AccountIn: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$AccountIn',
          count: { $sum: 1 },
        },
      },
    ]);
    accountInList = getCloneArray(accountList);
    Helper.sortListByGroupedList(accountInList, sOrdersGroupedByInAcc);

    let sOrdersGroupedByOutAcc = await soAggregate([
      {
        $match: {
          DateOrder: { $gt: cutDate },
          AccountOut: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$AccountOut',
          count: { $sum: 1 },
        },
      },
    ]);
    accountOutList = getCloneArray(accountList);
    Helper.sortListByGroupedList(accountOutList, sOrdersGroupedByOutAcc);
    popularAccInList = accountInList.slice(0, 3);
    popularAccOutList = accountOutList.slice(0, 3);
  } catch (err) {
    console.log(err);
  }
}

function list(req, res, next) {
  ServiceOrder
    .find()
    .populate('AccountOut')
    .populate('AccountIn')
    .sort({ DateOrder: -1, _id: -1 })
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
      let objToShow = objectToShowForm('Update SOrder', sOrder);
      res.render('serviceOrder_form', objToShow);
    });
}; function update_post(req, res, next) {
  let serviceOrder = createServiceOrderFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let objToShow = objectToShowForm('Create ServiceOrder(error)', serviceOrder, errors.array());
    res.render('serviceOrder_form', objToShow);
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
        res.redirect('/account/aggregatedList');
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

async function getList(startDate, finishDate) {
  let list = Helper.getListByDates(ServiceOrder, startDate, finishDate);
  list.populate('AccountOut')
    .populate('AccountIn');
  return list;
}
function deleteTypes(req, res, next) {
  ServiceOrder.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }

  });
}
function updateLists() {
  populateLists();
}
async function getAccountOrders(id) {
  let sords = ServiceOrder.find({ $or: [{ AccountIn: id }, { AccountOut: id }] });
  sords.populate('AccountOut')
    .populate('AccountIn');
  return sords;
}
populateLists();


exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.updateLists = updateLists;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.populateLists = populateLists;
exports.getList = getList;
exports.getAccountOrders = getAccountOrders;
exports.deleteTypes = deleteTypes;
