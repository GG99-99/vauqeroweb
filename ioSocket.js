const { Server } = require('socket.io')
const { ClientReporitory } = require('./repositorys/client-repository')

let clientInst = ClientReporitory.crear();



const io = new Server()


io.on('connection', (socket) =>{

  console.log("un usuario se ha conectado")
  

  socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})


  // Subir turno
  socket.on('upturn', ()=>{
    let upturnRes = clientInst.upTurn();
    let lastClient = ClientReporitory.getLastClient();
    console.log(lastClient)
    
    //---- Crear elemento cliente para el html ----//
    
    // Este es el evento que se envia a los usuarios de Panel y Index
    io.emit('upturnRES', {
      "newTurno": upturnRes.turno,
      "lastclient": lastClient,
      "clienteListo": upturnRes.clienteListo
      
    })

  // Crear nuevos Clientes
  

  })


  socket.on("newClient", (name) => {
    let newClient = clientInst.addClient(name);
    console.log(newClient)
    io.emit("newClientRES", newClient)

  }) 
  
  socket.on("downturn", ()=> {
    let turno = clientInst.downTurn()
    io.emit("downturnRES", turno)
  })


  socket.on("declineClient", (id)=>{
    let cliente = clientInst.declineClient(id)
    io.emit("declineClientRES", cliente)
  })
  
})


//Esta linea de codigo es para que el socket que se creara cuando el administrador este en la ruta panel se encuentre en un espacio virtual diferente y apartado
io.of("/panel").socketsJoin("RoomAdmin")


// -Esta linea de codigo es para que el socket que se creara cuando el cliente este en la ruta index, se encuentre en un espacio virtual diferente, por motivos de broadcast, esto es necesario  
io.of("/").socketsJoin("RoomClients")

/*
*         Eventos que se emitiran para los clientes
*         - Cuando (Administrador): 
*             1)Agrege cliente,                      
*             2)Cancele cliente, 
*             3)Aumente o Descienda turno,
*             4)Cliente listo.
*                                                                                                             
*/

module.exports = {io, clientInst}