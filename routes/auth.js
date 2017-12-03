// All of these routes would start at /auth

var express = require('express');
var router = express.Router();

// node passport is the authentication middleware.
var passport = require('passport');


/* GET the authentication page. */
router.get('/', function(req, res, next){
  res.render('authentication');
});


// /This is the login post route.  If login is successful, it takes to the auth/index.  If it fails, it takes back to /auth
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/auth',
  failureFlash: true
}));


// This is a post for a new signup.
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/auth',
  failureFlash: true
}))

/* GET logout */
router.get('/logout', function(req, res, next){
  req.logout();  // passport provides this
  res.redirect('/');
});

module.exports = router;
