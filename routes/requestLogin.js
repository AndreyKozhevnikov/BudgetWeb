'use strict';
let express = require('express');
let router = express.Router();
let User = require('../models/user.js');
let targetURI;

function authenticate(name, pass, req, res, next, succesAuthentificate, id) {
  User.authenticate(
    name,
    pass,
    function(error, user) {
      if (error || !user) {
        let err = new Error('wrong name or pass');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        res.cookie('bwebuserid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 }); // max age = 7 days
        succesAuthentificate();
      }
    },
    id
  );
}

router.get('/login', function(req, res, next) {
  res.render('userview');
});
router.post('/login', function(req, res, next) {
  if (req.body.uname && req.body.upass) {
    authenticate(req.body.uname, req.body.upass, req, res, next, function() {
      res.redirect('/');
    });
  } else {
    let err = new Error('all fields are required');
    err.status = 400;
    return next(err);
  }
});

router.get('*', function(req, res, next) {
  requiresLogin(req, res, next);
});

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    if (targetURI) {
      res.redirect(targetURI);
      targetURI = null;
    } else {
      return next();
    }
  } else if (
    req.cookies.cookiename &&
    (req.url == '/order/exportWithEmptyLocalId' || req.url == '/order/update')
  ) {
    let values = req.cookies.cookiename.split('-');
    let username = values[0];
    let pass = values[1];
    authenticate(username, pass, req, res, next, function() {
      return next();
    });
  } else if (req.cookies.bwebuserid) {
    let st = req.cookies.bwebuserid;
    authenticate(
      null,
      null,
      req,
      res,
      next,
      function() {
        return next();
      },
      st
    );
  } else {
    targetURI = req.url;
    res.redirect('/login');
  }
}
module.exports = router;
