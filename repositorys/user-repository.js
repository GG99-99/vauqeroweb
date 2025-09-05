const dbLocal = require("db-local");
const crypto = require("crypto")
const bcrypt = require("bcrypt");
const { type } = require("os");


const { Schema } = new dbLocal({ path: "./db" });
const UserDB = Schema('user', {
    _id: {type: String, require: true, unique: 'true'},
    email: {type: String, require: true, unique: 'true'},
    username: {type: String, require: true, unique: 'true'},
    password: {type: String, require: true}
}); 

class UserRepository{
    static async create ({email, username, password}) {
        Validation.username(username)
        Validation.password(password)

        const user = UserDB.findOne({ username }) 
        const correo = UserDB.findOne({email})
        // (user) es una variable buleana local del metodo create que me sirve para  saber si el nombre de usuario que se esta intentando registrar existe, si existe lanza un error

        if(user) {throw new Error("Ese usuario ya existe")};
        if(correo) {throw new Error("Ese correo ya esta siendo utilizado")}

        const id = crypto.randomUUID() // este (ID) se genera aleatoriamente y es el que se almacena en la Base de Datos
        const hashedPassword = await bcrypt.hash(password, 10) // Esto es para (Hashear la clave) con la libreria (bcrypt)

        UserDB.create({  // Este metodo (create) es para crear un registro en la base de datos que cree arriba con (Schema)
            _id: id,
            email,
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
        if(typeof username != 'string'){ throw {
            name: "usernameInvalidFormat",
            message: "El usuario debe ser un texto"
        }};
        if(username.length < 3) {throw {
            name: "usernameInvalidFormat",
            message: "La longitud del usuario debe ser mayor a 3"
        }};

    }
    static password(password){
        if(typeof password != 'string'){ throw {
            name: "usernameInvalidFormat",
            message: "La contrasena debe ser un texto"
        }};
        if(password.length < 6) {throw {
            name: "passwordTooSmall",
            message: "la clave debe ser mayor a 6"
        }};
    }
}


module.exports = { UserRepository };