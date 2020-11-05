'use strict';
let express = require('express');
let router = express.Router();
let account_controller = require('../controllers/accountController.js');
router.get('/create', account_controller.create_get);
router.post('/create', account_controller.create_post);
// router.get('/:id/delete', account_controller.order_delete_get);
// router.post('/:id/delete', account_controller.order_delete_post);
router.get('/:id/update', account_controller.update_get);
router.post('/:id/update', account_controller.update_post);
router.get('/list', account_controller.list);
router.get('/aggregatedList', account_controller.aggregatedList);
router.get('/aggregatedList/:direction/:date', account_controller.aggregatedList);
router.get('/createCheck/:id/:sum', account_controller.createCheck);

module.exports = router;
