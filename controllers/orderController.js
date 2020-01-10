'use strict';
let Order = require('../models/order.js');
let Tag = require('../models/tag.js');
let PaymentType = require('../models/paymentType.js');
let Helper = require('../controllers/helperController.js');

let tagList;
let popularTagList;
let paymentTypeList;
let popularPaymentTypeList;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all orders.
async function order_list(req, res, next) {
  let order_list = await Order.find({ IsDeleted: { $exists: false } })
    .populate('ParentTag')
    .populate('PaymentType')
    .sort({ DateOrder: -1, _id: -1 });
  res.render('order_list', { order_list: order_list });
};

// Display detail page for a specific order.
function order_detail(req, res, next) {
  Order.findById(req.params.id)
    .populate('ParentTag')
    .exec((err, result) => {
      if (err) {
        next(err);
      }
      if (result == null) {
        res.send('not found(');
      } else {
        res.render('order_detail', { title: 'Order', order: result });
      }
    });
};

// Display order create form on GET.
function order_create_get(req, res, next) {
  res.render('order_form', {
    title: 'Create Order',
    tag_list: tagList,
    popularTagList: popularTagList,
    paymentType_list: paymentTypeList,
    popularPaymentTypeList: popularPaymentTypeList,
  });
};

function order_create_get_withNewTag(req, res, next) {
  populateAdditionalLists(order_create_get, { req: req, res: res, next: next });
}

function order_create_post(req, res, next) {
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
    res.render('order_form', {
      title: 'Create Order (err)',
      fOrder: order,
      errors: errors.array(),
      tag_list: tagList,
    });
    return;
  } else {
    // Data from form is valid.
    order.save(function(err) {
      if (err) {
        next(err);
      }
      res.redirect('/account/aggregatedList');
    });
  }
};
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
    res.render('order_form', {
      title: 'Update Order',
      fOrder: order,
      tag_list: tagList,
      popularTagList: popularTagList,
      paymentType_list: paymentTypeList,
      popularPaymentTypeList: popularPaymentTypeList,
    });
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
    PaymentNumber: req.body.fPaymentNumber,
    IsMonthCategory: Boolean(req.body.fIsMonthCategory),
  });
  let paymentType = paymentTypeList.find(el => el._id.equals(order.PaymentType));
  if (paymentType.IsYandex) {
    if (!isUpdate) {
      if (!order.IsMonthCategory) {
        if (paymentType.CurrentCount > 4) {
          paymentType.CurrentCount = 1;
        } else {
          paymentType.CurrentCount++;
        }
      }
      order.PaymentNumber = paymentType.CurrentCount;
    } else {
      if (order.PaymentNumber)
        paymentType.CurrentCount = order.PaymentNumber;
    }
    paymentType.save();
  }
  if (isUpdate) {
    order._id = req.params.id;
  } else {
    order.CreatedTime = new Date();
  }
  return order;
}
// Handle order update on POST.
function order_update_post(req, res, next) {
  let order = createOrderFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    res.render('order_form', {
      title: 'Create Order (err)',
      fOrder: order,
      errors: errors.array(),
      tag_list: tagList,
    });
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
    .populate('PaymentType');
  return list;
}
async function getAccountOrders(id) {
  let paymentTypes = await PaymentType.find({ Account: Helper.createObjectId(id) });
  let list = Order.find({ PaymentType: { $in: paymentTypes } });
  list
    .populate('ParentTag')
    .populate('PaymentType');
  return list;
}
populateAdditionalLists();

exports.order_detail = order_detail;
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
