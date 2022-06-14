'use strict';
let Order = require('../models/order.js');
let Tag = require('../models/tag.js');
let OrderPlace = require('../models/orderPlace.js');
let OrderObject = require('../models/orderObject.js');
let Account = require('../models/account.js');
let ServiceOrder = require('../models/serviceOrder.js');
let Helper = require('../controllers/helperController.js');

let tagList;
let popularTagList;
let accountList;
let popularAccountList;
let placeList;
let popularPlaceList;
let objectList;


const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function getObjectToShowForm(mTitle, mOrder, mErrors) {
  let objToShow = {
    title: mTitle,
    tag_list: tagList,
    popularTagList: popularTagList,
    accountList: accountList,
    popularAccountList: popularAccountList,
    dateForOrders: Helper.dateForOrders,
    place_list: placeList,
    popularPlaceList: popularPlaceList,
    object_list: objectList,
  };
  if (mOrder) {
    objToShow.fOrder = mOrder;
  }
  if (mErrors) {
    objToShow.errors = mErrors;
  }
  return objToShow;
}

async function populatePaymentAccount(req, res, next){
  let dateToStart = new Date('01-jan-20');
  var lst = await Order.find({ DateOrder: { $gte: dateToStart } })
    .populate('PaymentType');
  for (let order of lst){
    if (order.PaymentAccount == null){
      order.PaymentAccount = order.PaymentType.Account;
      await order.save();
    }
  }
  res.send('update is Successful');
}

// Display list of all orders.
async function order_list(req, res, next) {
  let cutDate = new Date(2000, 1);
  if (req.params.showallrecords === 'false'){
    cutDate = Helper.getToday();
    cutDate.setDate(cutDate.getDate() - 5);
  }
  let order_list = await Order.find({ IsDeleted: { $exists: false }, DateOrder: { $gt: cutDate } })
    .populate('ParentTag')
    .populate('PaymentAccount')
    .populate('Place')
    .populate('Object')
    .sort({ DateOrder: -1, _id: -1 });
  res.render('order_list', { order_list: order_list });
};

// Display order create form on GET.
function order_create_get(req, res, next) {
  let obj = getObjectToShowForm('Create Order');
  res.render('order_form', obj);
};

function order_create_get_withNewLists(req, res, next) {
  populateAdditionalLists(order_create_get, { req: req, res: res, next: next });
}

async function order_create_post(req, res, next) {
  let order = createOrderFromRequest(req, false);
  if (!order.Description) {
    let tagDescr = tagList.find(
      item => JSON.stringify(item._id) === JSON.stringify(order.ParentTag)
    );
    order.Description = tagDescr.Name;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    let obj = getObjectToShowForm('Create Order (err)', order, errors.array());
    res.render('order_form', obj);
    return;
  } else {
    // Data from form is valid.
    let accId = order.PaymentAccount;
    let acc = await Account.findById(accId);
    let hasMoneyBox = acc.HasMoneyBox;
    if (hasMoneyBox === true) {
      let left = getLeft(order.Value);
      if (left > 0) {
        var serviceOrder = new ServiceOrder({
          DateOrder: order.DateOrder,
          Type: Helper.sOrderTypes.between,
          Value: left,
          Description: 'money box: ' + order.Description,
          AccountOut: acc,
          AccountIn: Helper.createObjectId(acc.MoneyBoxId),
          CreatedTime: order.CreatedTime,
        });
        serviceOrder.save((err) => {
          if (err) {
            next(err);
          }
        });
      }
    }
    order.save(function(err) {
      if (err) {
        next(err);
      }
      res.redirect('/account/aggregatedList');
    });
  }
};

function getLeft(sum) {
  // let quotient = Math.floor(sum / 50);
  let remainder = sum % 100;
  if (remainder === 0) {
    return 0;
  }
  let res = 100 - remainder;
  return res;
}

// Handle order create on POST.
let order_create_post_array = [
  // validate fields
  body('fDate', 'Invalid date of order')
    .optional({ checkFalsy: true })
    .isISO8601(),
  // body('fTags', 'Description required').isLength({ min: 1 }).trim(),
  // Sanitize fields.
  sanitizeBody('fDate').toDate(),
  sanitizeBody('fValue')
    .trim()
    .escape(),
  sanitizeBody('fDescription')
    .trim()
    .escape(),
  sanitizeBody('fTags')
    .trim()
    .escape(),
  (req, res, next) => order_create_post(req, res, next),
];

// Display order delete form on GET.
function order_delete_get(req, res) {
  res.send('NOT IMPLEMENTED: order delete GET');
};

// Handle order delete on POST.
function order_delete_post(req, res, next) {
  let mId = req.params.id;
  Order.update({ _id: mId }, { $set: { IsDeleted: true } }, function(err) {
    if (err) {
      next(err);
    }
    res.redirect('/orders');
  });
};

// Display order update form on GET.
function order_update_get(req, res, next) {
  Order.findById(req.params.id).exec(function(err, order) {
    if (err) {
      return next(err);
    }
    let obj = getObjectToShowForm('Update Order', order);
    res.render('order_form', obj);
  });
};
function createOrderFromRequest(req, isUpdate) {
  let order = new Order({
    DateOrder: req.body.fDate,
    Value: req.body.fValue,
    Description: req.body.fDescription,
    ParentTag: req.body.fParentTag,
    IsJourney: Boolean(req.body.fIsJourney),
    Tags: req.body.fTags,
    LocalId: req.body.fLocalId,
    PaymentAccount: req.body.fPaymentAccount,
  });
  if (req.body.fPlace !== ''){
    order.Place = req.body.fPlace;
  }
  if (req.body.fObject !== ''){
    order.Object = req.body.fObject;
  }
  if (isUpdate) {
    order._id = req.params.id;
  } else {
    order.CreatedTime = new Date();
  }
  Helper.dateForOrders = order.DateOrder;
  return order;
}
// Handle order update on POST.
function order_update_post(req, res, next) {
  let order = createOrderFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    let obj = getObjectToShowForm('Update Order (err)', order, errors.array());
    res.render('order_form', obj);
    return;
  } else {
    // Data from form is valid.

    Order.findByIdAndUpdate(req.params.id, order, [], function(
      err,
      theOrder
    ) {
      if (err) {
        return next(err);
      }
      res.redirect('/order/list/false');
    });
  }
};

let order_update_post_array = [
  // validate fields
  body('fDate', 'Invalid date of order')
    .optional({ checkFalsy: true })
    .isISO8601(),
  // body('fTags', 'Description required').isLength({ min: 1 }).trim(),
  // Sanitize fields.
  sanitizeBody('fDate').toDate(),
  sanitizeBody('fValue')
    .trim()
    .escape(),
  sanitizeBody('fDescription')
    .trim()
    .escape(),
  sanitizeBody('fTags')
    .trim()
    .escape(),
  sanitizeBody('fLocalId')
    .trim()
    .escape(),
  (req, res, next) => order_update_post(req, res, next),
];

function orders_exportWithEmptyLocalId(req, res, next) {
  Order.find({
    LocalId: null,
  })
    .populate('ParentTag')
    .populate('PaymentAccount')
    .populate('Place')
    .populate('Object')
    .exec(function(err, list_orders) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      // res.render('order_list', { title: 'Order List', order_list: list_tags });
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(list_orders);
    });
};

function deleteOrders(req, res, next) {
  Order.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
};


async function populateAdditionalLists(myCallBack, params) {
  let cutDate = Helper.getCutDate();
  let tagFind = Helper.promisify(Tag.find, Tag);
  let orderPlaceFind = Helper.promisify(OrderPlace.find, OrderPlace);
  let orderObjectFind = Helper.promisify(OrderObject.find, OrderObject);
  let accountAggregate = Helper.promisify(Account.aggregate, Account);
  let orderAggregate = Helper.promisify(Order.aggregate, Order);
  let results;
  try {
    results = await Promise.all([
      tagFind(),
      accountAggregate([
        {
          $match: {
            $or: [
              { IsArchived: false },
              { IsArchived: { $exists: false } },
            ],
          },
        },
      ]),
      orderAggregate([
        {
          $match: {
            IsDeleted: { $exists: false },
            DateOrder: { $gt: cutDate },
          },
        },
        {
          $group: {
            _id: '$ParentTag',
            count: { $sum: 1 },
          },
        },
      ]),
      orderAggregate([
        {
          $match: {
            IsDeleted: { $exists: false },
            DateOrder: { $gt: cutDate },
          },
        },
        {
          $group: {
            _id: '$PaymentAccount',
            count: { $sum: 1 },
          },
        },
      ]),
      orderPlaceFind(),
      orderObjectFind(),
      orderAggregate([
        {
          $match: {
            IsDeleted: { $exists: false },
            DateOrder: { $gt: cutDate },
          },
        },
        {
          $group: {
            _id: '$Place',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
  } catch (err) {
    console.log('error' + err);
  }
  tagList = results[0];
  accountList = results[1];
  let groupedOrdersByTag = results[2];
  let groupedOrdersByAccount = results[3];
  placeList = results[4];
  objectList = results[5];
  let groupedOrdersByPlace = results[6];
  groupedOrdersByPlace = groupedOrdersByPlace.filter(x => x._id !== null);

  Helper.sortListByGroupedList(tagList, groupedOrdersByTag);
  Helper.sortListByGroupedList(accountList, groupedOrdersByAccount);
  Helper.sortListByGroupedList(placeList, groupedOrdersByPlace);

  popularPlaceList = placeList.slice(0, 9);

  placeList.sort((a, b) => {
    if (a.Name < b.Name) { return -1; }
    if (a.Name > b.Name) { return 1; }
    return 0;
  });

  popularTagList = tagList.slice(0, 15);
  tagList.sort((a, b) => {
    if (a.Name < b.Name) { return -1; }
    if (a.Name > b.Name) { return 1; }
    return 0;
  });
  popularAccountList = accountList.slice(1, 8);
  if (params) {
    myCallBack(params.req, params.res, params.next);
  }

}


async function getOrdersByDates(startDate, finishDate) {
  let list = Helper.getListByDates(Order, startDate, finishDate);
  populateOrderList(list);
  return list;
}
async function getOrdersByAccount(id) {
  let list = Order.find({ PaymentAccount: Helper.createObjectId(id) });
  populateOrderList(list);
  return list;
}
function populateOrderList(orderList){
  orderList.populate('ParentTag')
    .populate('PaymentAccount')
    .populate('Object')
    .populate('Place');
}
populateAdditionalLists();

exports.order_list = order_list;
exports.order_create_get = order_create_get;
exports.order_create_get_withNewLists = order_create_get_withNewLists;
exports.order_create_post = order_create_post_array;
exports.order_delete_get = order_delete_get;
exports.order_delete_post = order_delete_post;
exports.order_update_get = order_update_get;
exports.order_update_post = order_update_post_array;
exports.orders_exportWithEmptyLocalId = orders_exportWithEmptyLocalId;
exports.deleteOrders = deleteOrders;
exports.populateAdditionalLists = populateAdditionalLists;
exports.getList = getOrdersByDates;
exports.getAccountOrders = getOrdersByAccount;
exports.getLeft = getLeft;
exports.populatePaymentAccount = populatePaymentAccount;
