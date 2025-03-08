const { Server } = require('socket.io')

const io = new Server()
io.on('connection', (socket) =>{

  console.log("un usuario se ha conectado")

  socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})
  socket.on('msg', (msg)=>{console.log(msg)})

  
})


module.exports = {io}