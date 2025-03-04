
var http = require('http');
var app = require('../app');
const { Server } = require('socket.io')

/**
 * Get port from environment for store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
/**
 * Create HTTP server.
 */
var server = http.createServer(app);


/* Create socket.io server
*/

const io = new Server(server)

io.on('connection', (socket) =>{
  console.log("un usuario se ha conectado")

  socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})
  socket.on('msg', (msg)=>{console.log(msg)})
})



function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
}


module.exports = {port, http, app, io, server}