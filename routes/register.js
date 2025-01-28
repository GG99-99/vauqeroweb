var express = require('express');
const { UserRepository } = require('../repositorys/user-repository');
var router = express.Router();



/* GET users listing. */
router.route('/')
  .get((req, res) => {res.send('REGISTRER ROUTE')} )
  .post(async (req, res) => {

    const { username, password } = req.body;

    try{
      const id = await UserRepository.create({ username, password });
      res.send(id)
      
    } catch (error) {
      res.status(400).send(error.message)
    }
});


/*router.post('/',function(req, res, next){
    res.send("hola,")
})*/

module.exports = router;