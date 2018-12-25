'use strict';
let Account = require('../models/account.js');

function create_get(req, res, next) {
  res.render('account_form', {
    title: 'Create Account',
  });
};

exports.create_get = create_get;
