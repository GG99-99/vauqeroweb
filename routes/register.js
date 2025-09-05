var express = require('express');
let path = require('path');
const { UserRepository } = require(path.join(__dirname, '..', 'repositorys', 'user-repository.js'));
var router = express.Router();



/* GET users listing. */
router.route('/')
  .get((req, res) => {res.render('register')} )
  .post(async (req, res) => {
    const { email, username, password } = req.body;
    try{
      const id = await UserRepository.create({ email, username, password });
      res.send(id)
      
    } catch (error) {

      if(error.name == "usernameInvalidFormat"){
        res.status(400).json({
          name: error.name,
          message: error.message
        })
      }
      else if(error.name == "passwordTooSmall"){
        res.status(400).json({
          name: error.name,
          message: error.message
        })
      }
    }
});




module.exports = router;