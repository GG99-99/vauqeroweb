const path = require('path');

var express = require('express');
const { UserRepository } = require(path.join(__dirname, '..', 'repositorys', 'user-repository.js'))
var router = express.Router();
const  jwt = require('jsonwebtoken')
const { SECRET_JWT_KEY } = require(path.join(__dirname, '..', 'repositorys', 'config.js'))
// const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit');


// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
//   statusCode: 429,
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// 	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
// })

/* GET users listing. */
router.route('/')
  .get((req, res) => {

    const token = req.cookies.access_token
    if(!token){ res.render('login') }
    else if (token){
      try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        res.redirect('/panel')  // si el token es valido te enviara directamente al panel
      }catch(err){}
    }
    
  })


  .post(async (req, res) => {          //  POST

    const { username, password } = req.body;  // Aqui es donde se (toman los valores del body) que llegaran a travez de una peticion (POST) en formato (JSON)

    try{
      const user = await UserRepository.login({ username, password });  // Se envian los datos a (UserRepository) para que realice el proceso de (login) que incluye las (validaciones basicas)
      const token = jwt.sign({id: user.id, username: user.username}, SECRET_JWT_KEY, 
      {
        expiresIn: '1h'
      });  //Json Web Token para la sesion

      res.cookie('access_token', token, {
        httpOnly: true, // con esto la cookie solo sera accesible desde el servidor
        secure: process.env.NODE_ENV === 'production', // para que solo funcione con https
        sameSite: 'strict', // el token solo se puede acceder en el mismo dominio
        maxAge: 1000 * 60 * 60
      })
      res.send({user, token})
      
    } catch (error) {
      res.status(401).send({"err": error.message})
    }
});


module.exports = router;