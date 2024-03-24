// index.js: The main routes for the web app

// Imports
var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var database = require('./database.js');

// Ensure logged in
var ensureLoggedIn = function checkLogin(req, res, next) {
  // ensureLogIn();
  next();
}

// Load page
function load(req, res, next) {
  res.locals.variable = "";
  next();
}

// Routes
var router = express.Router();
router.get('/', function (req, res, next) {
  if (!req.user) { return res.render('chat'); }
  next();
}, load, function (req, res, next) {
  res.redirect('/chat');
});
router.get('/calendar', ensureLoggedIn, load, function (req, res, next) { res.render('calendar', { user: req.user }); });
router.get('/chat', ensureLoggedIn, load, function (req, res, next) { res.render('chat', { user: req.user }); });
router.get('/video', ensureLoggedIn, load, function (req, res, next) { res.render('video', { user: req.user }); });
router.get('/about', ensureLoggedIn, load, function (req, res, next) { res.render('about', { user: req.user }); });
router.get('/account', ensureLoggedIn, load, function (req, res, next) { res.render('account', { user: req.user }); });
router.get('/room', ensureLoggedIn, load, function (req, res, next) { res.render('room', { user: req.user }); });

// Export
module.exports = router;
