'use strict';
let express = require('express');
let router = express.Router();
let paymentType_controller = require('../controllers/paymentTypeController.js');

router.get('/create', paymentType_controller.paymentType_create_get);
router.post('/create', paymentType_controller.paymentType_create_post);
router.get('/deleteAll', paymentType_controller.deletePaymentTypes);
router.get('/list', paymentType_controller.paymentType_list);
router.get('/:id/update', paymentType_controller.paymentType_update_get);
router.post('/:id/update', paymentType_controller.paymentType_update_post);
module.exports = router;
