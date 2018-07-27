let Tag = require('../models/tag.js');
let Order = require('../models/order.js');

let async = require('async');
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
exports.index = function(req, res) {

    async.parallel({
        tag_count: function(callback) {
            Tag.count(callback);
        },
        order_count: function(callback) {
            Order.count(callback);
        },
    }, function(err, results) {

        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();
        // add a zero in front of numbers<10
        m = checkTime(m);
        s = checkTime(s);
        let tms = h + ":" + m + ":" + s;
        //res.send('test');
        res.render('index', {title: 'My budget web application', error: err, data: results, time: tms});
    });
};