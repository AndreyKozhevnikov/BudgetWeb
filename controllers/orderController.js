'use strict';
let Order = require('../models/order.js');
let Tag = require('../models/tag.js');
let PaymentType = require('../models/paymentType.js');
let async = require('async');
let stream = require('stream');
let tagList;
let popularTagList;
let paymentTypeList;
let popularPaymentTypeList;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all orders.
function order_list(req, res, next) {
  Order.find({ IsDeleted: { $exists: false } })
    .populate('ParentTag')
    .populate('PaymentType')
    .sort({ DateOrder: -1, _id: -1 })
    .exec(function(err, order_list) {
      if (err) {
        return next(err);
      }
      let statisticObject = getStaticObject(order_list);
      // Successful, so render
      res.render('order_list', { order_list: order_list, statObject: statisticObject });
    });
};

function getStaticObject(order_list) {
  const normEatPerDay = 500;
  const normAllPerDay = 1500;
  let today = new Date();
  let dayCount = today.getDate();
  let firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  let thisMonthsorders = order_list.filter(function(order) {
    return order.DateOrder >= firstDay;
  });
  let sumAllOrders = thisMonthsorders.reduce(function(accumulator, order) {
    return accumulator + order.Value;
  }, 0);
  let sumEatOrders = thisMonthsorders.reduce(function(accumulator, order) {
    if (order.ParentTag.LocalId === 1) {
      accumulator = accumulator + order.Value;
    }
    return accumulator;
  }, 0);
  let monthDayCount = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  let leftDayCount = monthDayCount - dayCount;
  if (leftDayCount < 1)
    leftDayCount = 1;
  let desiredAllSumForMonth = normAllPerDay * monthDayCount;
  let desiredEatSumForMonth = normEatPerDay * monthDayCount;

  let statisticObject =
  {
    spendEat: sumEatOrders,
    normEat: normEatPerDay * dayCount,
    normEatMonth: desiredEatSumForMonth,
    spendAll: sumAllOrders,
    normAll: normAllPerDay * dayCount,
    normAllMonth: desiredAllSumForMonth,
  };
  statisticObject.diffEat = statisticObject.normEat - statisticObject.spendEat;
  statisticObject.diffEatMonth = statisticObject.normEatMonth - statisticObject.spendEat;
  statisticObject.moneyLeftEat = Math.round(statisticObject.diffEatMonth / leftDayCount);
  statisticObject.diffAll = statisticObject.normAll - statisticObject.spendAll;
  statisticObject.diffAllMonth = statisticObject.normAllMonth - statisticObject.spendAll;
  statisticObject.moneyLeftAll = Math.round(statisticObject.diffAllMonth / leftDayCount);

  statisticObject.allColorAttribute = statisticObject.diffAll < 0;
  statisticObject.eatColorAttribute = statisticObject.diffEat < 0;

  let allYaPaymentTypes = paymentTypeList.filter(p => p.IsYandex);
  let yandexMappedList = allYaPaymentTypes.map(function(p) {
    let newObj = { value: p.Name + '-' + p.CurrentCount, isFourth: p.CurrentCount === 4 };
    return newObj;
  });
  statisticObject.yaList = yandexMappedList;


  return statisticObject;
}

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
      res.redirect('/order/list');
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

function orders_backup(req, res, next) {
  Order.find()
    .populate('ParentTag')
    .populate('PaymentType')
    .exec(function(err, list_orders) {
      if (err) {
        return next(err);
      }
      // res.json(list_orders);
      var fileContents = Buffer.from(JSON.stringify(list_orders));
      var readStream = new stream.PassThrough();
      readStream.end(fileContents);
      let backupFileName = 'BWbackup-' + formatDate(new Date()) + '.txt';
      res.set('Content-disposition', 'attachment; filename=' + backupFileName);
      res.set('Content-Type', 'text/plain');
      readStream.pipe(res);
    });
};

function formatDate(date) {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

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

function populateAdditionalLists(myCallBack, params) {
  let cutDate = new Date();
  cutDate.setDate(cutDate.getDate() - 60);
  async.parallel({
    tags: function(callback) {
      Tag.find(callback);
    },
    paymentTypes: function(callback) {
      PaymentType.find(callback);
    },
    groupedOrdersByTag: function(callback) {
      Order.aggregate(
        [
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
        ]).exec(callback);
    },
    groupedOrdersByPaymentType: function(callback) {
      Order.aggregate(
        [
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
        ]).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      console.dir(err);
    }
    tagList = results.tags;
    paymentTypeList = results.paymentTypes;
    let popularTagListObject = {};
    let popularPaymentTypesObject = {};
    sortEntities(tagList, results.groupedOrdersByTag, popularTagListObject, 4);
    sortEntities(paymentTypeList, results.groupedOrdersByPaymentType, popularPaymentTypesObject, 5);
    popularTagList = popularTagListObject.popularList;
    popularPaymentTypeList = popularPaymentTypesObject.popularList;
    if (params)
      myCallBack(params.req, params.res, params.next);
  });
}

function sortEntities(listToSort, groupedList, obj, countOfPopular) {
  listToSort.sort(function(a, b) {
    let aNumber = groupedList.find(item => item._id.equals(a._id));
    let bNumber = groupedList.find(item => item._id.equals(b._id));
    aNumber = aNumber ? aNumber.count : 0;
    bNumber = bNumber ? bNumber.count : 0;
    if (!a.MyNumber) {
      a.MyNumber = aNumber;
    }
    if (!b.MyNumber) {
      b.MyNumber = bNumber;
    }
    return bNumber - aNumber;
  });
  obj.popularList = listToSort.slice(1, countOfPopular);
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
exports.orders_backup = orders_backup;
exports.deleteOrders = deleteOrders;
exports.createOrderFromBackup = createOrderFromBackup;
