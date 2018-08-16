'use strict';
let express = require('express');
let router = express.Router();
let root_controller = require('../controllers/rootController.js');


router.get('/', root_controller.index);

router.get('/backup', root_controller.orders_backup);

router.get('/deleteall', root_controller.deleteAll);

router.get('/restore', function(req, res, next) {
  res.redirect('/wiki');
});

router.get('/wiki', root_controller.wiki);

router.get('/wiki/about', root_controller.wikiAbout);

router.post('/restore', root_controller.restore);

router.get('/createuser', root_controller.createUserGet);

router.post('/createuser', root_controller.createUserPost);

module.exports = router;
