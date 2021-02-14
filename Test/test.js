'use strict';
const assert = require('assert');
it('should return true', () => {
  assert.equal(true, true);
});
it('getLeft(87)', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(87);
  assert.equal(res, 13);
});
it('getLeft(14)', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(14);
  assert.equal(res, 86);
});
it('getLeft(50)', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(50);
  assert.equal(res, 50);
});
it('getLeft(100)', () => {
  let myShortenFile = require('../controllers/orderController');
  let res = myShortenFile.getLeft(100);
  assert.equal(res, 0);
});
