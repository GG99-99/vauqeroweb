const { Server } = require('socket.io')
const { ClientReporitory } = require('./repositorys/client-repository')

// plq - instancia de peluquero
let plq01 = new ClientReporitory("A")
let plq02 = new ClientReporitory("B")

const plqs = [plq01, plq02]
const io = new Server()

io.on('connection', (socket) =>{
  // //Esta linea de codigo es para que el socket que se creara cuando el administrador este en la ruta panel se encuentre en un espacio virtual diferente y apartado
  // io.of("/panel").socketsJoin("RoomAdmin")

// -Esta linea de codigo es para que el socket que se creara cuando el cliente este en la ruta index, se encuentre en un espacio virtual diferente, por motivos de broadcast, esto es necesario
 // io.of("/").socketsJoin("RoomClients")

    let room = socket.route
  if (room){
    socket.join(room)
  }

    console.log("un usuario se ha conectado")
    console.log(socket.rooms)
    if(socket.rooms.has('RoomAdmin')){
      socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})

      socket.on('upturn', (silla)=>{
        let plq = plqs.find((plq) => plq.silla === silla);
        let upturnRes = plq.upTurn()

        // Este es el evento que se envia a los usuarios de Panel y Index
        if (upturnRes){
          io.emit('upturnRES', {
            "newTurno": upturnRes.turno,
            "clienteListo": upturnRes.clienteListo,
            "clienteActual": upturnRes.clienteActual,
            "silla": upturnRes.silla,
          })
        }
      })

      socket.on("newClient", (name, silla) => {

        let plq = plqs.find((plq) => plq.silla === silla)
        let newClientForSend = plq.addClient(name)

        io.emit("newClientRES", newClientForSend)

      })

      socket.on("downturn", (silla)=> {
        let plq = plqs.find((plq) => plq.silla === silla);
        let downTurnRes = plq.downTurn()
        io.emit("downturnRES", downTurnRes)
      })

      socket.on("decline", (msg)=>{

        let plq = plqs.find((plq) => plq.silla === msg.silla);
        let res = plq.declineClient(msg.id)
        io.emit("declineRES", res)
      })

      socket.on("desDecline", (msg) => {
        let plq = plqs.find((plq) => plq.silla === msg.silla);
        let res = plq.desDecline(msg.id)
        io.emit("desDeclineRES", res)
      })

      socket.on('openAndClose', (silla) => {
        let plq = plqs.find((plq) => plq.silla === silla);
        let res = plq.openAndClose()
        io.emit("openAndCloseRES", res)
      })
    }

  
})






module.exports = {io, plqs}