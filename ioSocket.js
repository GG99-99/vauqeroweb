const { Server } = require('socket.io')

const io = new Server()
io.on('connection', (socket) =>{

  console.log("un usuario se ha conectado")
  

  socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})
  socket.on('msg', (msg)=>{console.log(msg)})

  
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

module.exports = {io}