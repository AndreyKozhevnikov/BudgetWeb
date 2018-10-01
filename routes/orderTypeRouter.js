'use strict';
let express = require('express');
let router = express.Router();
let orderType_controller = require('../controllers/orderTypeController.js');

router.get('/create', orderType_controller.orderType_create_get);
router.post('/create', orderType_controller.orderType_create_post);

module.exports = router;
