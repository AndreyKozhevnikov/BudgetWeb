let Tag = require('../models/tag.js');
let Order=require('../models/order.js');
let async=require('async');

// Display list of all tags.
exports.tag_list = function(req, res) {
     Tag.find({}, 'Name')
     .exec(function (err, list_tags) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('tag_list', { title: 'Tag List', tag_list: list_tags });
    });
};

// Display detail page for a specific tag.
exports.tag_detail = function(req, res,next) {
  async.parallel({
    tag:function(callback){
      Tag.findById(req.params.id)
      .exec(callback);
    },
    tag_orders:function(callback){
      Order.find({'ParentTag':req.params.id})
      .exec(callback);
    },
  }, function(err,results){
    if (err) {
      return next(err);
    }
    if (results.tag==null){
      let merr=new Error('Tag not m found');
      merr.status=404;
      return next(merr);
    }
    res.render("tag_detail",{title:'Tag detail',tag:results.tag, tag_orders:results.tag_orders});
  }

  );
      
};

// Display tag create form on GET.
exports.tag_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: tag create GET');
};

// Handle tag create on POST.
exports.tag_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: tag create POST');
};

// Display tag delete form on GET.
exports.tag_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: tag delete GET');
};

// Handle tag delete on POST.
exports.tag_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: tag delete POST');
};

// Display tag update form on GET.
exports.tag_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: tag update GET');
};

// Handle tag update on POST.
exports.tag_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: tag update POST');
};