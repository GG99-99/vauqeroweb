const path = require('path');
const ioRoute = path.resolve(__dirname, "ioSocket.js")
const appRoute = path.resolve(__dirname, "app.js")
const cookie = require('cookie');


const {io} = require(ioRoute);
const http = require('http');
const app = require(appRoute)
require('dotenv').config();


/**
 * Get port from environment for store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
/**
 * Create HTTP server.
 */
var server = http.createServer(app);


/* Attatch server to socket.io 
*/
io.attach(server)
// Middleware para verificar la ruta de origen
io.use((socket, next) => {
    // console.log(socket.handshake);
  const path = socket.handshake.headers.referer; // Obtiene la URL de origen
  socket.route = path.includes('/panel') ? 'RoomAdmin' : false; // Asigna una sala según la ruta, la propiedad route, la creamos nosotros
  next();
});

io.use((socket, next) => {  // este middelware agrega el token de acceso al socket como una propiedad
    let cookies = cookie.parse(socket.handshake.headers.cookie || '');
    if(cookies.access_token){
        socket.access_token = cookies.access_token;
    }
    next();

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


module.exports = {port, app, server}