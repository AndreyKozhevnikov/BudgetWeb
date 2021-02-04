'use strict';
let OrderPlace = require('../models/orderPlace.js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function entity_list(req, res, next) {
  OrderPlace.find().exec(function(err, result_list) {
    if (err) {
      return next(err);
    }
    res.render('entity_list.pug', { title: 'Place List', entity_list: result_list });
  });
};

function create_get(req, res) {
  res.render('plainEntity_form', { title: 'Create Place' });
};

function create_post(req, res, next) {
  const errors = validationResult(req);

  var orderPlace = new OrderPlace({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
  });

  if (!errors.isEmpty()) {
    res.render('plainEntity_form', {
      title: 'Create Place(error)',
      entityFromForm: orderPlace,
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
    res.render('plainEntity_form', { title: 'Update Place', tagFromForm: result });
  });
};

function update_post(req, res, next) {
  let orderPlace = new OrderPlace({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
    _id: req.params.id,
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('plainEntity_form', { title: 'Update Order', entityFromForm: orderPlace });
  } else {
    OrderPlace.findByIdAndUpdate(req.params.id, orderPlace, [], function(err, theEntity) {
      if (err) {
        return next(err);
      }
      res.redirect(theEntity.url);
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

exports.entity_list = entity_list;
exports.create_get = create_get;
exports.create_post = create_post_array;
exports.update_get = update_get;
exports.update_post = update_post_array;
exports.deleteEntities = deleteEntities;
