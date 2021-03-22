'use strict';
let OrderPlace = require('../models/orderPlace.js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function orderPlace_list(req, res, next) {
  OrderPlace.find().exec(function(err, result_list) {
    if (err) {
      return next(err);
    }
    result_list.sort((a, b) => {
      if (a.Name < b.Name) { return -1; }
      if (a.Name > b.Name) { return 1; }
      return 0;
    });
    res.render('orderPlace_list.pug', { title: 'Place List', orderPlace_list: result_list });
  });
};

function create_get(req, res) {
  res.render('orderPlace_form', { title: 'Create Place' });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  var orderPlace = createPlaceOrderFromRequest(req, false);

  if (!errors.isEmpty()) {
    res.render('orderPlace_form', {
      title: 'Create Place(error)',
      orderPlaceFromForm: orderPlace,
      errors: errors.array(),
    });
    return;
  } else {
    OrderPlace.findOne({ Name: req.body.NameFromForm }).exec(function(err, found_entity) {
      if (err) {
        return next(err);
      }
      if (found_entity) {
        res.redirect(found_entity.url);
      } else {
        orderPlace.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/order/createWithNewLists');
        });
      }
    });
  }
};
let create_post_array = [
  body('NameFromForm', 'name required')
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody('NameFromForm')
    .trim()
    .escape(),
  sanitizeBody('LocalIdFromForm')
    .trim()
    .escape(),
  (req, res, next) => create_post(req, res, next),
];

exports.delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete GET');
};

exports.delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: tag delete POST');
};

function update_get(req, res, next) {
  OrderPlace.findById(req.params.id).exec(function(err, result) {
    if (err) {
      next(err);
    }
    res.render('orderPlace_form', { title: 'Update Place', orderPlaceFromForm: result });
  });
};
function createPlaceOrderFromRequest(req, isUpdate) {
  let orderPlace = new OrderPlace({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
    HasImage: Boolean(req.body.HasImageFromForm),
  });
  if (isUpdate) {
    orderPlace._id = req.params.id;
  }
  return orderPlace;
}

function update_post(req, res, next) {
  let orderPlace = createPlaceOrderFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('orderPlace_form', { title: 'Update Order', orderPlaceFromForm: orderPlace });
  } else {
    OrderPlace.findByIdAndUpdate(req.params.id, orderPlace, [], function(err, theEntity) {
      if (err) {
        return next(err);
      }
      res.redirect('/orderplace/list');
    });
  }
}
let update_post_array = [
  sanitizeBody('LocalIdFromForm')
    .trim()
    .escape(),
  sanitizeBody('NameFromForm')
    .trim()
    .escape(),
  (req, res, next) => update_post(req, res, next),
];

function deleteEntities(req, res, next) {
  OrderPlace.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
};

exports.orderPlace_list = orderPlace_list;
exports.create_get = create_get;
exports.create_post = create_post_array;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.deleteEntities = deleteEntities;
