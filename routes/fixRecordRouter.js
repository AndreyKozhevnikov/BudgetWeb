'use strict';
let express = require('express');
let router = express.Router();
let fixRecord_controller = require('../controllers/fixRecordController.js');

router.get('/createTotalSums', fixRecord_controller.createTotalSums);
router.get('/deleteStartMonthRecords', fixRecord_controller.deleteStartMonthRecords);
router.get('/showTotalSumsChart', fixRecord_controller.showTotalSumsChart);
router.get('/createTotalIncoming', fixRecord_controller.createTotalIncoming);
router.get('/removeTotals', fixRecord_controller.removeTotals);

module.exports = router;
