'use strict';
let Order = require('../models/order.js');
let Tag = require('../models/tag.js');
let stream = require('stream');
let ListTags;
let async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
// Display list of all orders.
exports.order_list = function(req, res, next) {
  Order.find({IsDeleted: {$exists: false}})
    .populate('ParentTag')
    .sort({DateOrder: -1, _id: -1})
    .exec(function(err, list_orders) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render('order_list', {title: 'Order List', order_list: list_orders});
    });
};

// Display detail page for a specific order.
exports.order_detail = function(req, res, next) {
  Order.findById(req.params.id)
    .populate('ParentTag')
    .exec((err, result) => {
      if (err) {
        next(err);
      }
      if (result == null) {
        res.send('not found(');
      } else {
        res.render('order_detail', {title: 'Order', order: result});
      }
    });
};

// Display order create form on GET.
exports.order_create_get = function(req, res, next) {
  Tag.find({}, null).exec(function(err, tags) {
    if (err) {
      return next(err);
    }
    ListTags = tags;
    tags.sort(function(a, b) {
      return a.OrderNumber - b.OrderNumber;
    });
    res.render('order_form', {title: 'Create Order', tag_list: tags});
  });
};

// Handle order create on POST.
exports.order_create_post = [
  // validate fields
  body('fDate', 'Invalid date of order')
    .optional({checkFalsy: true})
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
  (req, res, next) => {
    let order = new Order({
      DateOrder: req.body.fDate,
      Value: req.body.fValue,
      Description: req.body.fDescription,
      ParentTag: req.body.fParentTag,
      IsJourney: Boolean(req.body.fIsJourney),
      Tags: req.body.fTags,
      LocalId: req.body.fLocalId,
    });
    if (!order.Description) {
      let tagDescr = ListTags.find(
        item => JSON.stringify(item._id) === JSON.stringify(order.ParentTag)
      );
      order.Description = tagDescr.Name;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      Tag.find({}, null).exec(function(err, tags) {
        if (err) {
          return next(err);
        }
        res.render('order_form', {
          title: 'Create Order (err)',
          fOrder: order,
          errors: errors.array(),
          tag_list: tags,
        });
        return;
      });
    } else {
      // Data from form is valid.

      order.save(function(err) {
        if (err) {
          next(err);
        }
        res.redirect('/order/list');
      });
    }
  },
];

// Display order delete form on GET.
exports.order_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: order delete GET');
};

// Handle order delete on POST.
exports.order_delete_post = function(req, res, next) {
  let mId = req.params.id;
  Order.update({_id: mId}, {$set: {IsDeleted: true}}, function(err) {
    if (err) {
      next(err);
    }
    res.redirect('/orders');
  });
};

// Display order update form on GET.
exports.order_update_get = function(req, res, next) {
  async.parallel(
    {
      order: function(callback) {
        Order.findById(req.params.id).exec(callback);
      },
      tags: function(callback) {
        Tag.find().exec(callback);
      },
    },
    function(err, results) {
      if (err) {
        return next(err);
      }
      res.render('order_form', {
        title: 'Update Order',
        fOrder: results.order,
        tag_list: results.tags,
      });
    }
  );
};

// Handle order update on POST.
exports.order_update_post = [
  // validate fields
  body('fDate', 'Invalid date of order')
    .optional({checkFalsy: true})
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
  (req, res, next) => {
    let order = new Order({
      DateOrder: req.body.fDate,
      Value: req.body.fValue,
      Description: req.body.fDescription,
      ParentTag: req.body.fParentTag,
      IsJourney: Boolean(req.body.fIsJourney),
      Tags: req.body.fTags,
      LocalId: req.body.fLocalId,
      _id: req.params.id,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      Tag.find({}, null).exec(function(err, tags) {
        if (err) {
          return next(err);
        }
        res.render('order_form', {
          title: 'Create Order (err)',
          fOrder: order,
          errors: errors.array(),
          tag_list: tags,
        });
        return;
      });
    } else {
      // Data from form is valid.

      Order.findByIdAndUpdate(req.params.id, order, [], function(
        err,
        theOrder
      ) {
        if (err) {
          return next(err);
        }
        res.redirect(theOrder.url);
      });
    }
  },
];
exports.orders_exportWithEmptyLocalId = function(req, res, next) {
  Order.find({
    LocalId: null,
  })
    .populate('ParentTag')
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
exports.orders_backup = function(req, res, next) {
  Order.find()
    .populate('ParentTag')
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

exports.update_localid = function(req, res, next) {
  let id = req.body.id;
  let localId = req.body.localid;
  Order.findById(id, function(err, theTag) {
    if (err) {
      next(err);
    }
    theTag.LocalId = localId;
    theTag.save(function(err, savedTag) {
      if (err) {
        next(err);
      }
      res.send('update is Successful');
    });
  });
};

exports.deleteOrders = function(req, res, next) {
  Order.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
};

exports.createOrderFromBackup = function(tmpOrder, storedTag) {
  let order = new Order(tmpOrder);
  order.ParentTag = storedTag;
  order.save(function(err, savedTag) {
    if (err) {
      console.dir(err);
    }
  });
};
