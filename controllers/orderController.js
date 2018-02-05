let Order = require('../models/order.js');
let Tag=require('../models/tag.js');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
// Display list of all orders.
exports.order_list = function(req, res,next) {
   Order.find({}, 'DateOrder Value Description ParentTag Tags IsJourney')
   .populate('ParentTag')
     .exec(function (err, list_orders) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('order_list', { title: 'Order List', order_list: list_orders });
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
exports.order_create_get = function(req, res,next) {
  Tag.find({},null)
  .exec(function(err,tags){
    if (err){return next(err);}
    res.render('order_form', { title: 'Create Order',tag_list:tags });
  })
      
};

// Handle order create on POST.
exports.order_create_post = [
//validate fields
  body('fDate', 'Invalid date of order').optional({ checkFalsy: true }).isISO8601(),
  //body('fTags', 'Description required').isLength({ min: 1 }).trim(),  
  // Sanitize fields.
  sanitizeBody('fDate').toDate(),
  sanitizeBody('fValue').trim().escape(),
  sanitizeBody('fDescription').trim().escape(),
  sanitizeBody('fTags').trim().escape(),
  (req,res,next)=>{
    console.dir(req.body);
    let order=new Order({
      DateOrder:req.body.fDate,
      Value:req.body.fValue,
      Description:req.body.fDescription,
      ParentTag:req.body.fParentTag,
      IsJourney: Boolean (req.body.fIsJourney),
      Tags:req.body.fTags
    });     
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // There are errors. Render form again with sanitized values/errors messages.
    Tag.find({},null)
    .exec(function(err,tags){
      if (err){return next(err);}
      console.dir(order);
      res.render('order_form', { title: 'Create Order (err)', fOrder: order, errors: errors.array(),tag_list:tags });
      return;
    })

    }
    else {
    // Data from form is valid.    
 
      order.save(function(err){
        if (err){next(err);}
        res.redirect(order.url);
      })
    }
  }
    
]

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
exports.orders_export=function(req,res,next){
 Order.find({}, null)
   .populate('ParentTag')
     .exec(function (err, list_orders) {
      if (err) { return next(err); }
      //Successful, so render
      //res.render('order_list', { title: 'Order List', order_list: list_tags });
      res.json(list_orders);
     //res.json({ user: 'tobi' });
    });
}