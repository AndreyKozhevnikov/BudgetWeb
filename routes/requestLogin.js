let express = require('express');

let router = express.Router();
let User = require('../models/user.js');



router.get('/createuser',function(req,res,next){
  if (!canCreateUser()){
    console.log('gonextcreateget');
    next();
    return;
  }
  console.log('createuser get render');
  res.render('userview');
});
function canCreateUser(){
  return process.env.CANCREATEUSER=='TRUE';
}

router.post('/createuser',function(req,res,next){
 
  if (!canCreateUser()){
     res.redirect('/login');
  }
 
 
  console.log('createuser post');
  let user=new User(
  {
    username:req.body.uname,
    password:req.body.upass,

  });


  user.save(function(err,resultuser){
    if (err){return next(err);}
    console.log('created1');
    var stack = new Error().stack
console.log( stack )
    //res.redirect('/');
    //res.send('user created');
    console.log('created2');
  })
    res.send('user created');
});
router.get('/login',function(req,res,next){
  console.log('login get');
  res.render('userview');
 // res.send('test login');
})
router.post('/login',function(req,res,next){
 console.log('login post');
 if (req.body.uname&&req.body.upass){
  User.authenticate(req.body.uname,req.body.upass,function(error,user){
    if (error||!user){
      console.log('login err '+error);
      let err =new Error('wrong name or pass');
      err.status=401;
      return next(err);
    }else{
      req.session.userId=user._id;
      //res.send('success authenticate');
      res.redirect('/');
    }
  });
}else{
  let err=new Error('all fields are required');
  err.status=400;
  return next(err);
}
})


router.get('*',function(req,res,next){
 // res.send('simple545')
 
 requiresLogin(req,res,next);
});

function requiresLogin(req, res, next) {
 console.log('url '+req.url);
 if (req.session && req.session.userId) {
  if (this.targetURI){
    res.redirect(targetURI);
    targetURI=null;
  }else{
    console.log('next');
    return next();
  }
} else {
  console.log('redirect to login from request');
  targetURI=req.url;
  res.redirect('/login');
}
}




module.exports = router;
