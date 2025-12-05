const path = require('path');
const ioRoute = path.resolve(__dirname, "ioSocket.js")
const cookie = require('cookie');


const {io} = require(ioRoute);
require('dotenv').config();



var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');

/*
El middleware cookieParser se utiliza para analizar las cookies adjuntas al objeto de solicitud del cliente. Hace que las cookies estén disponibles en req.cookies y las cookies firmadas en req.signedCookies.
*/
// var logger = require('morgan');
const cors = require('cors');




// aqui se exportan las rutas
let indexRouter = require(path.join(__dirname, 'routes', 'index.js'));
// let usersRouter = require(path.join(__dirname, 'routes', 'users.js'));
let registerRouter = require(path.join(__dirname, 'routes', 'register.js'));
let loginRouter = require(path.join(__dirname, 'routes', 'login.js'))
let {router: panelRouter} = require(path.join(__dirname, 'routes', 'panel.js'))
let logoutRouter = require(path.join(__dirname, 'routes', 'logout.js'))

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//middlewares
// app.use(logger('dev'));  // esto es lo que hace las improsiones cada que alguien se conenta
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



/**
 * Get port from environment for store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');


/**
 * Create HTTP server.
 */

// use app.listen which returns an http.Server instance
var server = app.listen(port);

// Attach server to socket.io
io.attach(server)

// Middleware para verificar la ruta de origen
io.use((socket, next) => {
  const referer = (socket.handshake.headers.referer || ''); // evita colisión con path y protege undefined
  socket.route = referer.includes('/panel') ? 'RoomAdmin' : false; // Asigna una sala según la ruta
  next();
});

io.use((socket, next) => {  // este middleware agrega el token de acceso al socket como una propiedad
    let cookies = cookie.parse(socket.handshake.headers.cookie || '');
    if (cookies.access_token) {
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






app.set('port', port);
/*
  Listen on provided port, on all network interfaces.
*/
// server.listen(port);







