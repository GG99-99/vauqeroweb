const path = require('path');
const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
const {io} = require(ioRoute)
var http = require('http');
//var app = require('../app');
const appRoute = path.resolve(__dirname, "..", "app.js")
const app = require(appRoute)


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