'use strict';
let Account = require('../models/account.js');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function create_get(req, res, next) {
  res.render('account_form', {
    title: 'Create Account',
  });
};
function create_post(req, res, next) {
  const errors = validationResult(req);

  var account = new Account({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
    Balance: req.body.BalanceFromForm,
  });

  if (!errors.isEmpty()) {
    res.render('account_form', {
      title: 'Create account(error)',
      accountFromForm: account,
      errors: errors.array(),
    });
    return;
  } else {
    Account.findOne({ Name: req.body.NameFromForm }).exec(function(err, found_acc) {
      if (err) {
        return next(err);
      }
      if (found_acc) {
        res.redirect(found_acc.url);
      } else {
        account.save(function(err) {
          if (err) {
            return next(err);
          }
          res.redirect('/order/createWithNewTag');
        });
      }
    });
  }
};
let create_post_array = [
  body('NameFromForm', 'Tag name required')
    .isLength({ min: 1 })
    .trim(),
  sanitizeBody('NameFromForm')
    .trim()
    .escape(),
  sanitizeBody('LocalIdFromForm')
    .trim()
    .escape(),
  sanitizeBody('Balance')
    .trim()
    .escape(),
  (req, res, next) => create_post(req, res, next),
];
exports.create_get = create_get;
exports.create_post = create_post_array;
