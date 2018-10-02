'use strict';
let PaymentType = require('../models/paymentType.js');

const { validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function paymentType_create_get(req, res, next) {
  res.render('paymentType_form', { title: 'Create PaymentType' });
};

function paymentType_create_post(req, res, next) {
  let paymentType = new PaymentType({
    Name: req.body.fName,
    CurrentCount: 0,
    IsYandex: Boolean(req.body.fIsYandex),
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('paymentType_form', {
      title: 'Create PaymentType (err)',
      errors: errors.array(),
    });
    return;
  } else {
    paymentType.save(function(err) {
      if (err) {
        next(err);
      }
      res.redirect('/order/list');
    });
  }
};
let paymentType_create_post_array = [
  sanitizeBody('fName')
    .trim()
    .escape(),
  (req, res, next) => paymentType_create_post(req, res, next),
];

function deletePaymentTypes(req, res, next) {
  PaymentType.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }
  });
};

exports.paymentType_create_get = paymentType_create_get;
exports.paymentType_create_post = paymentType_create_post_array;
exports.deletePaymentTypes = deletePaymentTypes;
