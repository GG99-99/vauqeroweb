// arrancar DEBUG=vaqueroweb:* npm start

var express = require('express');
var router = express.Router();
const path = require('path');
// const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
const {plqs, plqGn} = require(path.join(__dirname, "..","repositorys",'client-repository.js'));



/* GET home page. */

router.get('/', function(req, res, next) {

  let All_Clients = plqGn.sendAllClients();
  let clientes_listos = plqGn.send_listo(plqs);
  let actuales = plqGn.findActuales(plqs)
  let clientes_esperando = plqGn.send_esperando(plqs);
  
  // console.log(clientes_esperando)

  res.render('index',{
    peluqueros: plqs,
    clientes: All_Clients,
    listos: clientes_listos,
    actuales: actuales,
    esperando: clientes_esperando

  });
});

module.exports = router;
