const path = require('path');

const { ClientReporitory } = require(path.join(__dirname, '..', 'repositorys', 'client-repository.js'))
const { SECRET_JWT_KEY } = require(path.join(__dirname, '..', 'repositorys', 'config.js'))
const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")

var express = require('express');
var router = express.Router();
const  jwt = require('jsonwebtoken')
const {plqs} = require(ioRoute)  // peluqueros




/* GET users listing. */
router.route('/')
.get(function(req, res, next) {

  // esta funcion es para revisar que no existe ningun cliente con un estado de listo cuando su tuno es  superior al altual
  plqs[0].checkClients()
  plqs[1].checkClients()

  // para obtener el jsonwebtoken del usuario que se almacenan en las cookies
  const token = req.cookies.access_token
  if(!token){ return res.status(403).redirect('/login') }


  let All_Clients = plqs[0].sendAllClients();

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)  // para verificar el token JWT y de paso obtiene los valores de Username y password que le asignamos en el route(login.js)
  }catch(err){}



  res.render('panel', {
    peluqueros: plqs, // !!! Manejar como enviar los turnos de cada instancia de Worker
    clientes: All_Clients
  })
  
})


.post(async function(req, res){
  const token = req.cookies.access_token
  if(!token){ return res.status(403).redirect('/login') }
  try { const data = jwt.verify(token, SECRET_JWT_KEY)}catch(err){}  // para verificar el token JWT y de paso obtiene los valores de Username y password que le asignamos en el route(login.js),  SI EL TOKEN NO ES VALIDO ESTA FUNCION DEBUELVE UN ERROR POR TANTO NO ES NECESARIO USAR UNA [IF]

});



module.exports = {router};