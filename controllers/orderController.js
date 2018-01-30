let Order = require('../models/order.js');


// Display list of all orders.
exports.order_list = function(req, res,next) {
   Order.find({}, 'DateOrder Value Description ParentTag Tags IsJourney')
   .populate('ParentTag')
     .exec(function (err, list_tags) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('order_list', { title: 'Order List', order_list: list_tags });
    });
};

// Display detail page for a specific order.
exports.order_detail = function(req, res,next) {
   Order.findById(req.params.id)
   .exec((err,result)=>{
    if (result==null){
      res.send('not found(');
    }else{
      res.render('order_detail', { title: 'Order', order:  result}); 
    }
   })
};

// Display order create form on GET.
exports.order_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: order create GET');
};

// Handle order create on POST.
exports.order_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: order create POST');
};

// Display order delete form on GET.
exports.order_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: order delete GET');
};

// Handle order delete on POST.
exports.order_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: order delete POST');
};

// Display order update form on GET.
exports.order_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: order update GET');
};

// Handle order update on POST.
exports.order_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: order update POST');
};