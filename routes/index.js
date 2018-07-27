let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/test2', function(req, res, next) {
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  // add a zero in front of numbers<10
  m = checkTime(m);
  s = checkTime(s);
  let tms = h + ":" + m + ":" + s;
  res.render('index', {title: 'Express', time: tms});
});
router.get('/', function(req, res, next) {

  res.redirect('/catalog');
});
router.get('/test', function(req, res, next) {
  res.render('test');
});
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

module.exports = router; 
