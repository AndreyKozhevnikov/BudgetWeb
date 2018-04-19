let express = require('express');
let router = express.Router();
let User = require('../models/user.js');

function canCreateUser(){
  return process.env.CANCREATEUSER=='TRUE';
};

router.get('/createuser',function(req,res,next){
  if (!canCreateUser()){
    next();
    return;
  }
  res.render('userview');
});



router.post('/createuser',function(req,res,next){
  if (!canCreateUser()){
    res.redirect('/login');
  }

  let user=new User(
  {
    username:req.body.uname,
    password:req.body.upass,
  });

  user.save(function(err,resultuser){
    if (err){return next(err);}
    res.send('user created');
  });
}); 


router.get('/login',function(req,res,next){
  res.render('userview');
});

router.post('/login',function(req,res,next){
  if (req.body.uname&&req.body.upass){
    User.authenticate(req.body.uname,req.body.upass,function(error,user){
      if (error||!user){
        let err =new Error('wrong name or pass');
        err.status=401;
        return next(err);
      }else{
        req.session.userId=user._id;
        res.redirect('/');
      }
    });
  }else{
    let err=new Error('all fields are required');
    err.status=400;
    return next(err);
  }
});

router.get('*',function(req,res,next){
  requiresLogin(req,res,next);
});

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    if (this.targetURI){
      res.redirect(targetURI);
      targetURI=null;
    }else{
      return next();
    }
  }else {
    targetURI=req.url;
    res.redirect('/login');
  }
};




module.exports = router;
