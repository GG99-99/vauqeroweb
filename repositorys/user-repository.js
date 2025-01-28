const dbLocal = require("db-local");
const crypto = require("crypto")
const bcrypt = require("bcrypt")


const { Schema } = new dbLocal({ path: "./db" });
const UserDB = Schema('user', {
    _id: {type: String, require: true, unique: 'true'},
    username: {type: String, require: true, unique: 'true'},
    password: {type: String, require: true}
}); 

class UserRepository{
    static async create ({username, password}) {
        Validation.username(username)
        Validation.password(password)

        const user = UserDB.findOne({ username }) 
        // (user) es una variable buleana local del metodo create que me sirve para  saber si el nombre de usuario que se esta intentando registrar existe, si existe lanza un error

        if(user) {throw new Error("that username already exist")};

        const id = crypto.randomUUID() // este (ID) se genera aleatoriamente y es el que se almacena en la Base de Datos
        const hashedPassword = await bcrypt.hash(password, 10) // Esto es para (Hashear la clave) con la libreria (bcrypt)

        UserDB.create({  // Este metodo (create) es para crear un registro en la base de datos que cree arriba con (Schema)
            _id: id,
            username,
            password: hashedPassword
        }).save()

        return id
    }

    
    static async login ({username, password}) {
        Validation.username(username)
        Validation.password(password)

        const user = UserDB.findOne({ username })
        if(!user) {throw new Error("Username or Password is invalid")};

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error("Username or Password is invalid");
        const { password: _, ...publicUser} = user

        return publicUser


    }
};

class Validation{
    static username(username){
        if(typeof username != 'string') throw new Error("The username have to be a string");
        if(username.length < 3) {throw new Error("The username have to be more large than 3")};

    }
    static password(password){
        if(typeof password != 'string') throw new Error("The password have to be a string");
        if(password.length < 6) {throw new Error("The password have to be more large than 6")};
    }
}


module.exports = { UserRepository };