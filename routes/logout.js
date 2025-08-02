var express = require('express');
let path = require('path');
const { UserRepository } = require(path.join(__dirname, '..', 'repositorys', 'user-repository.js'));
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