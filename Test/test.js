'use strict';
const assert = require('assert');
it('should return true', () => {
  assert.equal(true, true);
});
it('should return true', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(87);
  assert.equal(res, 13);
});
it('should return true', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(14);
  assert.equal(res, 36);
});
it('should return true', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(50);
  assert.equal(res, 0);
});
