'use strict';
let OrderType = require('../models/orderType.js');

const { validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function orderType_create_get(req, res, next) {
  res.render('orderType_form', { title: 'Create OrderType' });
};

function orderType_create_post(req, res, next) {
  let orderType = new OrderType({
    Name: req.body.fName,
    CurrentCount: 0,
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('orderType_form', {
      title: 'Create Order (err)',
      errors: errors.array(),
    });
    return;
  } else {
    orderType.save(function(err) {
      if (err) {
        next(err);
      }
      res.redirect('/order/list');
    });
  }
};
let orderType_create_post_array = [
  sanitizeBody('fName')
    .trim()
    .escape(),
  (req, res, next) => orderType_create_post(req, res, next),
];

exports.orderType_create_get = orderType_create_get;
exports.orderType_create_post = orderType_create_post_array;
