'use strict';
let express = require('express');
let router = express.Router();
let paymentType_controller = require('../controllers/paymentTypeController.js');

router.get('/create', paymentType_controller.paymentType_create_get);
router.post('/create', paymentType_controller.paymentType_create_post);

module.exports = router;
