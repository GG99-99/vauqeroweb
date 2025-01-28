var express = require('express');
const { UserRepository } = require('../repositorys/user-repository');
var router = express.Router();



/* GET users listing. */
router.route('/')
    .get((req, res) => {
        res.clearCookie('access_token');
        res.redirect('/login');
    }) 
    .post((req, res) => {
        res.clearCookie('access_token');
        res.redirect('/login');
        
        
        
});


/*router.post('/',function(req, res, next){
    res.send("hola,")
})*/

module.exports = router;