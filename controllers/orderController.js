'use strict';
let Order = require('../models/order.js');
let Tag = require('../models/tag.js');
let PaymentType = require('../models/paymentType.js');
let ServiceOrder = require('../models/serviceOrder.js');
let Helper = require('../controllers/helperController.js');

let tagList;
let popularTagList;
let paymentTypeList;
let popularPaymentTypeList;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function getObjectToShowForm(mTitle, mOrder, mErrors) {
  let objToShow = {
    title: mTitle,
    tag_list: tagList,
    popularTagList: popularTagList,
    paymentType_list: paymentTypeList,
    popularPaymentTypeList: popularPaymentTypeList,
    dateForOrders: Helper.dateForOrders,
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
}

// Display list of all orders.
async function order_list(req, res, next) {
  let order_list = await Order.find({ IsDeleted: { $exists: false } })
    .populate('ParentTag')
    .populate('PaymentType')
    .sort({ DateOrder: -1, _id: -1 });
  res.render('order_list', { order_list: order_list });
};

// Display order create form on GET.
function order_create_get(req, res, next) {
  let obj = getObjectToShowForm('Create Order');
  res.render('order_form', obj);
};

function order_create_get_withNewTag(req, res, next) {
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
    let ptId = order.PaymentType;
    let pt = await PaymentType.findById(ptId).populate('Account');
    let hasMoneyBox = pt.Account.HasMoneyBox;
    if (hasMoneyBox === true) {
      let left = getLeft(order.Value);
      if (left > 0) {
        var serviceOrder = new ServiceOrder({
          DateOrder: order.DateOrder,
          Type: Helper.sOrderTypes.between,
          Value: left,
          Description: 'money box: ' + order.Description,
          IsCashBack: false,
          AccountOut: pt.Account,
          AccountIn: Helper.createObjectId(pt.Account.MoneyBoxId),
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
  let remainder = sum % 50;
  if (remainder === 0) {
    return 0;
  }
  let res = 50 - remainder;
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
    PaymentType: req.body.fPaymentType,
    IsMonthCategory: Boolean(req.body.fIsMonthCategory),
  });
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
      res.redirect('/order/list');
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
    .populate('PaymentType')
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

function createOrderFromBackup(tmpOrder, storedTag, storedPType) {
  let order = new Order(tmpOrder);
  order.ParentTag = storedTag;
  order.PaymentType = storedPType;
  order.save(function(err, savedTag) {
    if (err) {
      console.dir(err);
    }
  });
};

async function populateAdditionalLists(myCallBack, params) {
  let cutDate = Helper.getCutDate();
  let tagFind = Helper.promisify(Tag.find, Tag);
  let paymentTypeAggregate = Helper.promisify(PaymentType.aggregate, PaymentType);
  let orderAggregate = Helper.promisify(Order.aggregate, Order);
  let results;
  try {
    results = await Promise.all([
      tagFind(),
      paymentTypeAggregate([
        {
          $lookup: {
            from: 'accounts',
            localField: 'Account',
            foreignField: '_id',
            as: 'AccountV',
          },
        },
        {
          $unwind: '$AccountV',
        },
        {
          $match: {
            $or: [
              { 'AccountV.IsArchived': false },
              { 'AccountV.IsArchived': { $exists: false } },
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
            _id: '$PaymentType',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
  } catch (err) {
    console.log('error' + err);
  }
  tagList = results[0];
  paymentTypeList = results[1];
  let groupedOrdersByTag = results[2];
  let groupedOrdersByPaymentType = results[3];
  Helper.sortListByGroupedList(tagList, groupedOrdersByTag);
  Helper.sortListByGroupedList(paymentTypeList, groupedOrdersByPaymentType);
  popularTagList = tagList.slice(1, 4);
  popularPaymentTypeList = paymentTypeList.slice(1, 5);
  if (params) {
    myCallBack(params.req, params.res, params.next);
  }

}


async function getList(startDate, finishDate) {
  let list = Helper.getListByDates(Order, startDate, finishDate);
  list
    .populate('ParentTag')
    .populate('PaymentAccount');
  return list;
}
async function getAccountOrders(id) {
  let paymentTypes = await PaymentType.find({ Account: Helper.createObjectId(id) });
  let list = Order.find({ PaymentType: { $in: paymentTypes } });
  list
    .populate('ParentTag')
    .populate('PaymentAccount');
  return list;
}
populateAdditionalLists();

exports.order_list = order_list;
exports.order_create_get = order_create_get;
exports.order_create_get_withNewTag = order_create_get_withNewTag;
exports.order_create_post = order_create_post_array;
exports.order_delete_get = order_delete_get;
exports.order_delete_post = order_delete_post;
exports.order_update_get = order_update_get;
exports.order_update_post = order_update_post_array;
exports.orders_exportWithEmptyLocalId = orders_exportWithEmptyLocalId;
exports.deleteOrders = deleteOrders;
exports.createOrderFromBackup = createOrderFromBackup;
exports.populateAdditionalLists = populateAdditionalLists;
exports.getList = getList;
exports.getAccountOrders = getAccountOrders;
exports.getLeft = getLeft;
exports.populatePaymentAccount = populatePaymentAccount;
