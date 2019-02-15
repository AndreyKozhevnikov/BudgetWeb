'use strict';
let express = require('express');
let router = express.Router();
let root_controller = require('../controllers/rootController.js');


router.get('/', root_controller.index);

router.get('/deleteall', root_controller.deleteAll);

router.get('/restore', function(req, res, next) {
  res.redirect('/wiki');
});

router.get('/wiki', root_controller.wiki);

router.get('/wiki/about', root_controller.wikiAbout);

router.post('/restore', root_controller.full_Restore);

router.get('/createuser', root_controller.createUserGet);

router.post('/createuser', root_controller.createUserPost);

router.post('/updateLocalId', root_controller.update_localid);

router.get('/fullBackup', root_controller.full_backup);

module.exports = router;
