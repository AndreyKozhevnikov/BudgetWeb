'use strict';
var express = require('express');
var router = express.Router();
let wiki_controller = require('../controllers/wikiController.js');

// Home page route.
router.get('/', wiki_controller.index);

// About page route.
router.get('/about', function(req, res) {
  res.send('About this wikitttt');
});

module.exports = router;
