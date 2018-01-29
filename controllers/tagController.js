let Tag = require('../models/tag.js');


// Display list of all tags.
exports.tag_list = function(req, res) {
    res.send('NOT IMPLEMENTED: tag list');
};

// Display detail page for a specific tag.
exports.tag_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: tag detail: ' + req.params.id);
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