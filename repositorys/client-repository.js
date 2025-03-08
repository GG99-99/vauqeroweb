const dbLocal = require("db-local");
const fs = require("fs").promises
const path = require('path');


const { Schema } = new dbLocal({ path: "./db" });
const Client = Schema('Client', {
    _id: {type: Number, require: true, unique: 'true'},
    name: {type: String, require: true},
    status: {type: String, default: "esperando"}

    
})





const jsonPath = path.join(__dirname, 'json', 'turnos.json')
let jsonTurno;

async function leerjsonTurno() {
  try {
    // Leer el archivo JSON de forma asíncrona 
    const data = await fs.readFile(jsonPath, 'utf8');
    
    // Parsear el contenido del archivo
    jsonTurno = JSON.parse(data);

    //console.log(jsonTurno);  // Verifica si jsonTurno se llena correctamente
  } catch (err) {
    console.error('Error al leer el archivo JSON:', err);
  }
}

(async () => { // Para que se lea el archivo json y se cree el objeto jsonTurno
  await leerjsonTurno();
})();


class ClientReporitory{

    constructor(jsonTurno){
        this.turnoNow = jsonTurno;
        this.turno = 1  // esta variable es para manejar el ultimo turno registrado especialmente en addClient   
    }

     static async crear(){  // esto es para crear la funcion y poder usar el valor jsonTurno, pues es un valor que se obtiene de manera asyncronica
        await leerjsonTurno()
        return new ClientReporitory(jsonTurno.turno);

    }

    addClient(name){  // para que vaquero pueda agregar clientes a la lista de espera
        try {
            let allClients = Client.find()
            //console.log(allClients)
            if (allClients.length === 0){
                this.turno = 1
                //console.log(this.turno)
                }

                else if (allClients.length > 0){
                    //console.log()
                    let cliente
                    for (cliente of allClients){  
                        if (cliente._id >= this.turno){
                            this.turno = cliente._id + 1
                        }else{continue}    
                    }
                    //console.log(this.turno)
                    // aqui se retorna la lista al frontend
                }

                Client.create({_id:this.turno ,name: name}).save(); // GUARDA EL REGISTRO EN LA BASE DE DATOS
                let datosCliente = {turnoCliente : this.turno,name : name}
                return datosCliente 
            }catch (err){console.log("Error en la base datos",err)}
    }

    declineClient(id){   // en vez de eliminarlo de la base de datos hay que hacer que le cambie la propiedad status a "cancelado"

        let clientFound = Client.find({_id:Number(id)});

        //console.log(clientFound)

        clientFound.status = "declinado";
        Client.update({_id:Number(id)}, clientFound).save()
        //console.log("Ha finalizado correctamente el proceso de declinar")

        if (Number(clientFound._id) == Number(this.turnoNow)){
            //console.log("todo bien")
            this.turnoNow = this.turnoNow + 1
        }
        
        //clientFound.remove();
    }

    async upTurn(){ // para que vaquero actualize el turno que se mostrara en la pagina de clientes y en el panel
        try {
            jsonTurno.turno += 1  // esta el la variable que almacena los datos del arvhivo json turnos.json
            this.turnoNow = jsonTurno.turno

            const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
            await fs.writeFile(jsonPath, updatedJsonData)
            return jsonTurno.turno
            } catch (err){}
    }

    async downTurn(){
        try {
            jsonTurno.turno = jsonTurno.turno - 1
            this.turnoNow = jsonTurno.turno
            const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
            await fs.writeFile(jsonPath, updatedJsonData)
            return jsonTurno.turno
            }catch(err){console.log(err)}
    }
    
    static sendClients(){ // para que se muestre los clientes en espera a vaquero y tambien a los clientes
        try{
            let clientes = Client.find() // para selecionar toda la lista
            return clientes   
        }catch(err){console.log(err)}      
    }

    checkClients(turno){ // el turno es la misma propiedad this.turnoNow pero se la pasare desde el panel.js

        let allClientsReady = Client.find()

        for(let cliente of allClientsReady){
            if (cliente.status == "esperando" && cliente._id<this.turnoNow ){
                let clientFound = Client.find({_id:Number(cliente._id)})
                clientFound.status = "listo"
                Client.update({_id:cliente._id}, clientFound).save()
            }
            else{continue}
        }   

        let allClientsSecondChg = Client.find({_id:{$gte: turno, $lte: turno + 10}});
        //console.log(allClientsSecondChg)
        for(let cliente of allClientsSecondChg){
            if(cliente.status == "listo"){
                let clientFound = Client.find({_id:Number(cliente._id)})
                clientFound.status = "esperando"
                Client.update({_id:cliente._id}, clientFound).save()
            }
            else{continue}
        }
    }
} 






// ------- Para resetar los estados a declinado (para desarrollo unicacmente) ------- \\ 
/*let AllClientsDev = ClientReporitory.sendClients()
for(clienteFound of AllClientsDev){
    clienteFound.status = 'esperando'
    Client.update({_id:Number(clienteFound._id)}, clienteFound)
}*/


module.exports = {ClientReporitory}

