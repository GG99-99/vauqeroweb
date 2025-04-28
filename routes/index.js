// arrancar DEBUG=vaqueroweb:* npm start

var express = require('express');
var router = express.Router();
const path = require('path');

const clientRepositoryPath = path.resolve(__dirname, '../repositorys/client-repository');
const { ClientReporitory } = require(clientRepositoryPath);

const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
const {clientInst} = require(ioRoute)

/* GET home page. */

router.get('/', function(req, res, next) {
  let clientes = ClientReporitory.sendClients().reverse();
  res.render('index',{
    turno: clientInst.turnoNow,
    clientes: clientes
  });
});

module.exports = router;
