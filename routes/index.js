// arrancar DEBUG=vaqueroweb:* npm start

var express = require('express');
var router = express.Router();
const path = require('path');
const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
const {plqs} = require(ioRoute)  // peluqueros

/* GET home page. */

router.get('/', function(req, res, next) {
  let All_Clients = plqs[0].sendAllClients();

  res.render('index',{
    peluqueros: plqs,
    clientes: All_Clients
  });
});

module.exports = router;
