const User = require('../models/user');
const bcryptjs = require('bcryptjs');
require("dotenv").config();

exports.getLogin = (req,res,next)=>{
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('shop/login',{
        path:'/login',
        pageTitle: 'Login',
        isAuthenticated:false,
        errorMessage:message
    })
}

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.pass;
    User.findOne({where:{email:email}})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcryptjs.compare(password, user.password)
      .then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req,res,next)=>{
    req.session.destroy(err =>{ //destroy session from maria
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('shop/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message
  });
};

  exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let type = 0;
    if(password === process.env.root){
      type = 1;
    }
    const confirmPassword = req.body.confirmPassword;
    User.findOne({where:{email:email}})
    .then((resp)=>{
      if(resp){
        req.flash('error', 'email exists already, please pick a different one.');
        return res.redirect("/signup")
      }
      return bcryptjs.hash(password,12)
      .then(hashedpass=>{
        return User.create({email: email,password:hashedpass,name:username,type:type})
        .then((user)=>{
          return user.createCart()
        })
        .then(cart=>{
          res.redirect('/');
        })
      })
    })
    .catch(err=>{
      console.log(err);
    })
  }