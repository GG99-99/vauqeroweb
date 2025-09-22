const path = require('path');
const ioRoute = path.resolve(__dirname, "ioSocket.js")
const cookie = require('cookie');


const {io} = require(ioRoute);
const http = require('http');
require('dotenv').config();


// ------------------------------ app -------------------------------- //
/***************************************************************************************
  * extraido del archivo app.js                                                        *
                                                                                       *
****************************************************************************************/
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
// var practiceJoin = require(path.join(__dirname,'practice-path'));
/*
El middleware cookieParser se utiliza para analizar las cookies adjuntas al objeto de solicitud del cliente. Hace que las cookies estén disponibles en req.cookies y las cookies firmadas en req.signedCookies.
*/
var logger = require('morgan');
const cors = require('cors');




// aqui se exportan las rutas
let indexRouter = require(path.join(__dirname, 'routes', 'index.js'));
let usersRouter = require(path.join(__dirname, 'routes', 'users.js'));
let registerRouter = require(path.join(__dirname, 'routes', 'register.js'));
let loginRouter = require(path.join(__dirname, 'routes', 'login.js'))
let {router: panelRouter} = require(path.join(__dirname, 'routes', 'panel.js'))
let logoutRouter = require(path.join(__dirname, 'routes', 'logout.js'))

const { createServer } = require('http');


const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Este middleware analiza las cookies adjuntas al objeto de solicitud del cliente
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());



// manejar rutas
app.use('/', indexRouter);     
//app.use('/users', usersRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/panel', panelRouter);
app.use('/logout', logoutRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// ------------------------------ server -------------------------------- //
/***************************************************************************************
  * extraido del archivo serever.js                                                        *
                                                                                       *
****************************************************************************************/


/**
 * Get port from environment for store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/* 
  Attatch server to socket.io 
*/
io.attach(server)

// Middleware para verificar la ruta de origen
io.use((socket, next) => {
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




// ------------------------------ www -------------------------------- //
/***************************************************************************************
  * extraido del archivo www.js                                                        *
                                                                                       *
****************************************************************************************/

app.set('port', port);
/*
  Listen on provided port, on all network interfaces.
*/
server.listen(port);


//server.on('error', onError);
//server.on('listening', onListening);





/**
 * Event listener for HTTP server "error" event.
 */

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }

//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;

//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

// /**
//  * Event listener for HTTP server "listening" event.
//  */

// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//   debug('Listening on ' + bind);
// }




module.exports = {port, app}