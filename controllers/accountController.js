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

  var account = createAccountFromRequest(req, false);

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
          res.redirect('/account/list');
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
function list(req, res, next) {
  Account.find().exec(function(err, list_account) {
    if (err) {
      return next(err);
    }
    res.render('account_list', { title: 'Account List', list_account: list_account });
  });
};
function update_get(req, res, next) {
  Account.findById(req.params.id).exec(function(err, result) {
    if (err) {
      next(err);
    }
    res.render('account_form', { title: 'Update Account', accountFromForm: result });
  });
};

function createAccountFromRequest(req, isUpdate) {
  var account = new Account({
    Name: req.body.NameFromForm,
    LocalId: req.body.LocalIdFromForm,
    Balance: req.body.BalanceFromForm,
  });
  if (isUpdate) {
    account._id = req.params.id;
  }
  return account;
}

function update_post(req, res, next) {
  let account = createAccountFromRequest(req, true);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('account_form', { title: 'Update Account', accountFromForm: account });
  } else {
    Account.findByIdAndUpdate(req.params.id, account, [], function(err, theAcc) {
      if (err) {
        return next(err);
      }
      res.redirect('/account/list');
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
  sanitizeBody('BalanceFromForm')
    .trim()
    .escape(),
  (req, res, next) => update_post(req, res, next),
];
exports.create_get = create_get;
exports.create_post = create_post_array;
exports.list = list;
exports.update_get = update_get;
exports.update_post = update_post_array;
