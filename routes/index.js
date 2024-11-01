// arrancar DEBUG=vaqueroweb:* npm start

var express = require('express');
var router = express.Router();

/* GET home page. */


router.get('/', function(req, res, next) {
  cp = 5;
  res.render('index');
});

module.exports = router;
