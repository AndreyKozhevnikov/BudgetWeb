'use strict';
let PaymentType = require('../models/paymentType.js');

const { validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function paymentType_create_get(req, res, next) {
  res.render('paymentType_form', { title: 'Create PaymentType' });
};

function createPaymentTypeFromRequest(req, isUpdate) {
  let paymentType = new PaymentType({
    Name: req.body.fName,
    IsYandex: Boolean(req.body.fIsYandex),
  });
  if (isUpdate) {
    paymentType._id = req.params.id;
    paymentType.CurrentCount = req.body.fCurrentCount;
  } else {
    paymentType.CurrentCount = 0;
  }
  return paymentType;
}


function paymentType_create_post(req, res, next) {
  let paymentType = createPaymentTypeFromRequest(req, false);
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

function paymentType_update_get(req, res, next) {
  PaymentType.findById(req.params.id).exec(function(err, paymentType) {
    if (err) {
      return next(err);
    }
    res.render('paymentType_form', {
      title: 'Update paymentType',
      fpaymentType: paymentType,
    });
  });
};

function paymentType_update_post(req, res, next) {
  let paymentType = createPaymentTypeFromRequest(req, true);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    res.render('paymentType_form', {
      title: 'Create paymentType (err)',
      fOrder: paymentType,
      errors: errors.array(),
    });
    return;
  } else {
    // Data from form is valid.

    PaymentType.findByIdAndUpdate(req.params.id, paymentType, [], function(
      err,
      thePaymentType
    ) {
      if (err) {
        return next(err);
      }
      res.redirect('/paymentType/list');
    });
  }
}

let paymentType_post_array = [
  sanitizeBody('fName')
    .trim()
    .escape(),
  (req, res, next) => paymentType_update_post(req, res, next),
];


function paymentTypeList(req, res, next) {
  PaymentType.find().exec((err, payment_list) => {
    if (err) {
      return next(err);
    }
    res.render('paymentType_list', { paymentType_list: payment_list });
  });
}

function deleteTypes(req, res, next) {
  PaymentType.remove({}, function(err) {
    if (err) {
      next(err);
    } else {
      res.end('success');
    }

  });
}

function createPaymentTypeFromBackup(paymentTypeFromBackup) {
  let pType = new PaymentType(paymentTypeFromBackup);
  pType.save(function(err) {
    if (err) {
      console.dir(err);
    }
  });
  return pType;
};

exports.paymentType_create_get = paymentType_create_get;
exports.paymentType_create_post = paymentType_create_post_array;
exports.deletePaymentTypes = deletePaymentTypes;
exports.paymentType_list = paymentTypeList;
exports.paymentType_update_get = paymentType_update_get;
exports.paymentType_update_post = paymentType_post_array;
exports.deleteTypes = deleteTypes;
exports.createPaymentTypeFromBackup = createPaymentTypeFromBackup;
