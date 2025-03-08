var express = require('express');
var router = express.Router();
const  jwt = require('jsonwebtoken')
const { SECRET_JWT_KEY } = require('../repositorys/config')
const path = require('path');
const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
const {io} = require(ioRoute)





const { ClientReporitory } = require('../repositorys/client-repository')
let clientInst; 

(async () => {
   clientInst = await ClientReporitory.crear();  // para crear instancia de la clase ClientRepository
})();


/* GET users listing. */
router.route('/')
.get(function(req, res, next) {
  
  clientInst.checkClients(clientInst.turnoNow)

  const token = req.cookies.access_token
  if(!token){ return res.status(403).redirect('/login') }

  todosLosClientes = ClientReporitory.sendClients().reverse()

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)  // para verificar el token JWT y de paso obtiene los valores de Username y password que le asignamos en el route(login.js)
  }catch(err){}

  res.render('panel', {
    turno: clientInst.turnoNow,
    clientes: todosLosClientes
  })
  
})


.post(async function(req, res){
  const token = req.cookies.access_token
  if(!token){ return res.status(403).redirect('/login') }
  try { const data = jwt.verify(token, SECRET_JWT_KEY)}catch(err){}  // para verificar el token JWT y de paso obtiene los valores de Username y password que le asignamos en el route(login.js),  SI EL TOKEN NO ES VALIDO ESTA FUNCION DEBUELVE UN ERROR POR TANTO NO ES NECESARIO USAR UNA [IF]

  const { accion, nombre, id } = req.body

  if(accion == 'upturn'){
    await clientInst.upTurn()
    //console.log(`el nuevo turno es ${clientInst.turnoNow}`)
    res.send(clientInst.turnoNow.toString())
  }
  
  else if(accion == 'downturn'){
      await clientInst.downTurn()
      //console.log(`el nuevo turno es ${clientInst.turnoNow}`)
      res.send(clientInst.turnoNow.toString())
    
  }

  else if(accion == 'addclient'){
    turnoLastClient = await clientInst.addClient(nombre)
    
    res.json(turnoLastClient)
  }

  else if(accion == 'declinecliente'){
    clientInst.declineClient(id)
    res.send({'estado':'good'})
  }
  
});



module.exports = router;