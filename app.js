// arrancar DEBUG=vaqueroweb:* npm start


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// aqui se exportan las rutas
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login')
var panelRouter = require('./routes/panel')
var logoutRouter = require('./routes/logout')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

/*app.use((req, res, next) => {  // esto es para que en todas las peticiones se verifique si el usuario tiene token
  const token = req.cookies.access_token
  let data = null
  req.session = {user: null}

  try{
    data = jwt.verify(token, SECRET_JWT_KEY)  // para esta parte se deberia importar el archivo (config.js)
    req.session.user = data
  }.catch{}

  next() // para que continue con la siguiente funcion que debe ejecucar node
})*/

// manejar rutas
app.use('/', indexRouter);     
app.use('/users', usersRouter);
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

module.exports = app;
