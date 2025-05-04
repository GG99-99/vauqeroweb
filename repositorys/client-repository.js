
const dbLocal = require("db-local");
const fs = require("fs")
const path = require('path');

//const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
//const {io} = require(ioRoute)

const { Schema } = new dbLocal({ path: "./db" });
const ClientDB = Schema('Client', {
    _id: {type: Number, require: true, unique: 'true'},
    name: {type: String, require: true},
    status: {type: String, default: "esperando"}

    
})
/*
*   Branch: syncConversion
*   Motivo: Cambiar funciones asincronicas a sincronicas del client-repository.js y panel.js
*   Fecha: 14/3/2025
*
*/


const jsonPath = path.join(__dirname, 'json', 'turnos.json')


function leerjsonTurno() {
  try {
    // Leer el archivo JSON de forma síncrona 
    const data = fs.readFileSync(jsonPath);
    
    // Parsear el contenido del archivo
    return JSON.parse(data);
    //console.log(jsonTurno);  // Verifica si jsonTurno se llena correctamente
  } catch (err) {
    console.error('Error al leer el archivo JSON:', err);
  }
}

// Para que se lea el archivo json y se cree el objeto jsonTurno
let jsonTurno= leerjsonTurno();
console.log(jsonTurno)

class ClientReporitory{

    constructor(jsonTurno){
        this.turnoNow = jsonTurno;
        this.turnoForAsing = 1  // esta variable es para manejar el ultimo turno registrado especialmente en addClient   
    }

     static crear(){  // esto es para crear la funcion y poder usar el valor jsonTurno, pues es un valor que se obtiene de manera asyncronica
        return new ClientReporitory(jsonTurno.turno);

    }

    addClient(name){  // para que vaquero pueda agregar clientes a la lista de espera
        try {
            let allClients = ClientDB.find()
            //console.log(allClients)
            if (allClients.length === 0){
                this.turnoForAsing = 1
                //console.log(this.turno)
                }

                else if (allClients.length > 0){
                    //console.log()
                    let cliente
                    for (cliente of allClients){  
                        if (cliente._id >= this.turnoForAsing){
                            this.turnoForAsing = cliente._id + 1
                        }else{continue}    
                    }
                    //console.log(this.turno)
                    // aqui se retorna la lista al frontend
                }

                ClientDB.create({_id:this.turnoForAsing ,name: name}).save(); // GUARDA EL REGISTRO EN LA BASE DE DATOS
                let Cliente = {_id: this.turnoForAsing, name : name}
                return Cliente 
            }catch (err){console.log("Error en la base datos",err)}
    }

    declineClient(id){   // en vez de eliminarlo de la base de datos hay que hacer que le cambie la propiedad status a "cancelado"

        let clientForDeclArr = ClientDB.find({_id:Number(id)});
        let clientForDecl = clientForDeclArr[0]
        //console.log(clientFound)

        clientForDecl.status = "declinado";
        ClientDB.update({_id:Number(id)}, clientForDecl).save()
        //console.log("Ha finalizado correctamente el proceso de declinar")

        if (clientForDecl._id == this.turnoNow){
            //console.log("todo bien")
            jsonTurno.turno += 1  
            this.turnoNow = jsonTurno.turno

            


            let newActualClientArr = ClientDB.find({_id: this.turnoNow})
            let newActualClient = newActualClientArr[0]

            if (newActualClient.status == "declinado")
            {
                while(newActualClient.status == "declinado")
                {
                    jsonTurno.turno += 1  
                    this.turnoNow = jsonTurno.turno

                    newActualClientArr = ClientDB.find({_id: this.turnoNow})
                    newActualClient = newActualClientArr[0]
                }
            }



            const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
            fs.writeFileSync(jsonPath, updatedJsonData);

            return {"clienteDecl": clientForDecl, "newTurno": this.turnoNow}

        }
        return {"clienteDecl": clientForDecl}
        //clientFound.remove();
    }

    upTurn(){ // para que vaquero actualize el turno que se mostrara en la pagina de clientes y en el panel
        try {

            let cantClientes = ClientDB.find({_id: this.turnoNow}).length
            let cantiClientesTotales = ClientDB.find().length

            // esto para estar seguros de que los elementos que estan arriba del cliente en turno, no sean todos declinados
            // ------------------------------------------------------------------------------------------\\
            let contador = 0
            let confirmNextClientsArr = ClientDB.find({_id: {$gt: this.turnoNow}})
            for (let cliente of confirmNextClientsArr){
                if (cliente.status == 'esperando'){
                    contador = 0
                    break
                }else if (cliente.status == 'declinado'){
                    contador = 1
                }
            }

            if (contador == 1){
                return
            }
            // ------------------------------------------------------------------------------------------\\
            
            if ( cantClientes >= 1 && cantiClientesTotales > this.turnoNow)
            {
                let clienteListoArr = ClientDB.find({_id: this.turnoNow});
                let clienteListo= clienteListoArr[0];
                clienteListo.status = "listo";

                ClientDB.update({_id: Number(this.turnoNow)}, clienteListo).save()

                jsonTurno.turno += 1  // esta el la variable que almacena los datos del arvhivo json turnos.json
                this.turnoNow = jsonTurno.turno

                let newClientActualArr = ClientDB.find({_id: this.turnoNow});
                let newClientActual = newClientActualArr[0]

                if (newClientActual.status == 'declinado')
                {
                    while(newClientActual.status == 'declinado')
                    {
                        jsonTurno.turno += 1  
                        this.turnoNow = jsonTurno.turno

                        newClientActualArr = ClientDB.find({_id: this.turnoNow});
                        newClientActual = newClientActualArr[0]

                    } 

                    const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
                    fs.writeFileSync(jsonPath, updatedJsonData);

                    
                }

                const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
                fs.writeFileSync(jsonPath, updatedJsonData);

                return {"turno": this.turnoNow, "clienteListo": clienteListo}

            }else if(cantClientes == 0 && this.turnoNow < cantiClientesTotales)
            {
                    
                jsonTurno.turno += 1  
                this.turnoNow = jsonTurno.turno

                const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
                fs.writeFileSync(jsonPath, updatedJsonData);
                return {"turno": this.turnoNow}
            }else if(cantiClientesTotales == this.turnoNow){}

            


            } catch (err){}
    }

    downTurn(){

        if (this.turnoNow > 1){
            try 
            {
                
                if(ClientDB.find({_id: this.turnoNow-1}).length > 0 )
                {
                    let cliente = ClientDB.find({_id: this.turnoNow - 1});
                    let client = cliente[0]
        
                    if (client.status == "listo")
                    {
                        jsonTurno.turno = jsonTurno.turno - 1
                        this.turnoNow = jsonTurno.turno
                        const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
                        fs.writeFileSync(jsonPath, updatedJsonData);
    
                        client.status = "esperando";
                        ClientDB.update({_id: this.turnoNow}, client).save();
                        
    
                        return {"turno": this.turnoNow, "cliente": client}
    
    
                    }else if (client.status == 'declinado')           
                    {
                        while (client.status == "declinado")
                        {
    
                            // vuelvo a bajar el jsonTurno para tomar el siguiente elemento, si el siguiente elemento
                            // sigue siendo del tipo declinado seguire bajando el turno
                            jsonTurno.turno = jsonTurno.turno - 1
                            this.turnoNow = jsonTurno.turno
            
                            cliente = ClientDB.find({_id: this.turnoNow})
                            client = cliente[0]
                            
                        };
                        const updatedJsonData = JSON.stringify(jsonTurno, null, 2);
                        fs.writeFileSync(jsonPath, updatedJsonData);
    
                        client.status = "esperando";
                        ClientDB.update({_id: this.turnoNow}, client).save()
                        
    
                        return {"turno": this.turnoNow, "cliente": client}
    
                }
        
                }    
                
                }catch(err){console.log(err)}
        }
        
    }

    desDecline(id)
    {
        console.log(id)
        let backClientArr = ClientDB.find({_id: Number(id)-1})
        let backClient = backClientArr[0]

        let clientDeclineArr = ClientDB.find({_id: Number(id)})
        let clientDesDecline = clientDeclineArr[0]

        if (backClient.status == 'listo' || backClient.status == 'declinado')
        {

            clientDesDecline.status = 'listo'

            ClientDB.update({_id: Number(id)}, clientDesDecline).save()

            return clientDesDecline  // su status sera listo

        }else if (backClient.status == 'esperando')
        {
            clientDesDecline.status = 'esperando'

            ClientDB.update({_id: Number(id)}, clientDesDecline).save()

            return clientDesDecline  // su status sera esperando
        }
    }
    
    static sendClients(){ // para que se muestre los clientes en espera a vaquero y tambien a los clientes
        try{
            let clientes = ClientDB.find() // para selecionar toda la lista
            return clientes   
        }catch(err){console.log(err)}      
    }

    checkClients(turno){ // el turno es la misma propiedad this.turnoNow pero se la pasare desde el panel.js

        let allClientsReady = ClientDB.find()

        for(let cliente of allClientsReady){
            if (cliente.status == "esperando" && cliente._id<this.turnoNow ){
                let clientFound = ClientDB.find({_id:Number(cliente._id)})
                clientFound.status = "listo"
                ClientDB.update({_id:cliente._id}, clientFound).save()
            }
            else{continue}
        }   

        let allClientsSecondChg = ClientDB.find({_id:{$gte: this.turnoNow}});
        //console.log(allClientsSecondChg)
        for(let cliente of allClientsSecondChg){
            if(cliente.status == "listo"){
                let clientFound = ClientDB.find({_id:Number(cliente._id)})
                clientFound.status = "esperando"
                ClientDB.update({_id:cliente._id}, clientFound).save()
            }
            else{continue}
        }
    }

    static getLastClient(){
        let lastClient = ClientDB.find({$limit: 1})
        return lastClient
    }
} 





module.exports = {ClientReporitory, ClientDB}

