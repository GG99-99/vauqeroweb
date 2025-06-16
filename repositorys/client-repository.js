
const dbLocal = require("db-local");
const fs = require("fs")
const path = require('path');

//const ioRoute = path.resolve(__dirname, "..", "ioSocket.js")
//const {io} = require(ioRoute)

const { Schema } = new dbLocal({ path: "./db" });
const ClientDB = Schema('Client', {
    _id: {type: Number, require: true, unique: 'true', autoincrement: true},
    nturno: {type: Number, require: true},
    name: {type: String, require: true},
    silla: {type: Number, require: true},
    status: {type: String, default: "esperando"}

    
})

/*
*   Branch: variosPeluqueros
*   Motivo: modificar el sistema para manejar varios peluqueros
*   Fecha: 7/5/2025
*
*/


class ClientReporitory{
    toJSON(){ // Ahora JSON.stringify(this) usará tu método toJSON()
        return {
            turnoForAsing: this.turnoNow,
            turnoNow: this.turnoNow
        }
    }
    constructor(silla) {
        this.turnoForAsing = 1;
        this.turnoNow = 0;
        this.silla = silla 
        // esta variable es para manejar el ultimo turno registrado en addClient 

        // crear el archivo json  al que hara referencia la instancia
        this.pathJson = path.join(__dirname, 'json', `silla${silla}.json`)

        if(fs.existsSync(this.pathJson)){

            let data = JSON.parse(fs.readFileSync(this.pathJson).toString())
            this.turnoForAsing = data.turnoForAsing
            this.turnoNow = data.turnoNow

        }
        else{
            //let data = {"turnoForAsing": this.turnoForAsing, "turnoNow": this.turnoNow}
            fs.appendFileSync(this.pathJson, JSON.stringify(this))
        }
    }



    addClient(name){  // para que vaquero pueda agregar clientes a la lista de espera
        try {
            let allClients = ClientDB.find()
            //console.log(allClients)
            if (allClients.length === 0){
                this.turnoForAsing = 1
                // para que si no hay clientes el turnoForAsing sea 1
            }

            let Cliente = ClientDB.create({nturno:this.turnoForAsing ,name: name, silla: this.silla}).save(); // GUARDA EL REGISTRO EN LA BASE DE DATOS
            let cliente = {nturno: Cliente.nturno,name : name}
            this.turnoForAsing++
            return cliente

        }catch (err){console.log("Error en la base datos",err)}
    }

    declineClient(turno){   // en vez de eliminarlo de la base de datos hay que hacer que le cambie la propiedad status a "cancelado"

        let clientForDecl = ClientDB.findOne({nturno:Number(turno), silla:this.silla});

        clientForDecl.status = "declinado";
        ClientDB.update({nturno:Number(turno)}, clientForDecl).save()
        //console.log("Ha finalizado correctamente el proceso de declinar")

        if (clientForDecl.nturno === this.turnoNow)
        // si el cliente declinado es el turno actual
        {
            this.turnoNow += 1
            let newActualClient = ClientDB.findOne({nturno: this.turnoNow, silla:this.silla})

            while(newActualClient.status === "declinado")
            {
                this.turnoNow += 1
                newActualClient = ClientDB.findOne({nturno: this.turnoNow, silla:this.silla})
            }

            fs.writeFileSync(this.pathJson, JSON.stringify(this));
            return {"clienteDecl": clientForDecl, "newTurno": this.turnoNow, "newActualClient": newActualClient}

        }
        return {"clienteDecl": clientForDecl, "newTurno": false, "newActualClient": false}
    }

    upTurn(){ // para que vaquero actualize el turno que se mostrara en la pagina de clientes y en el panel
        try {
            // ------------------------------------------------------------------------------------------//
            // esto para estar seguros de que los elementos que estan arriba del cliente en turno, no sean todos declinados
            let control = 0
            let confirmNextClients = ClientDB.findOne({nturno: {$gt: this.turnoNow}})
            for (let cliente of confirmNextClients)
            {
                if (cliente.status === 'esperando')
                {
                    control = 1;
                    break
                }
            }
            if (control === 0) {return false;}// sale de la funcion porque no hay clientes esperando arriba del cliente en turno actual
            else
            {
                let clienteListo = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla})
                clienteListo.status = "listo";
                ClientDB.update({nturno: this.turnoNow, silla: this.silla}, clienteListo).save()

                this.turnoNow += 1

                let newClientActual = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla }); // nuevo cliente en turno
                while (newClientActual.status === 'declinado') {
                    this.turnoNow++
                    newClientActual = ClientDB.find({ nturno: this.turnoNow, silla: this.silla });
                }
                fs.writeFileSync(this.pathJson, JSON.stringify(this));

                return { "turno": this.turnoNow, "clienteListo": clienteListo }

            }
        } catch (err){console.log(err)}

    }

    downTurn(){

        if (this.turnoNow > 1){
            try 
            {
                if(ClientDB.findOne({nturno: this.turnoNow-1, silla:this.silla}).length > 0 )
                {
                    this.turnoNow -= 1
                    let cliente = ClientDB.findOne({_id: this.turnoNow, silla: this.silla});

                    if (cliente.status === "listo")
                    {
                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla:this.silla}, cliente).save();
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));

                        return {"turno": this.turnoNow, "cliente": cliente}
                    }else {

                        while (cliente.status === "declinado") {
                            this.turnoNow -= 1
                            cliente = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla})
                        }

                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla:this.silla}, cliente).save()
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));

                        return {"turno": this.turnoNow, "cliente": cliente}
                    }
                }

            }catch(err){console.log(err)}
        }
        
    }

    desDecline(turno) {
        console.log(turno)
        let backClient = ClientDB.findOne({nturno: Number(turno)-1, silla: this.silla})
        let clientDesDecline = ClientDB.findOne({nturno: Number(turno), silla:this.silla})

        if (backClient.status === 'listo' || backClient.status === 'declinado')
        {
            clientDesDecline.status = 'listo'
            ClientDB.update({nturno: Number(turno), silla:this.silla}, clientDesDecline).save()
            return clientDesDecline  // su status sera listo

        }else if (backClient.status === 'esperando')
        {
            clientDesDecline.status = 'esperando'
            ClientDB.update({nturno: Number(turno)}, clientDesDecline).save()
            return clientDesDecline  // su status sera esperando
        }
    }
    
    sendClients(){ // para que se muestre los clientes en espera a vaquero y tambien a los clientes
        try{
             // para selecionar toda la lista
            return ClientDB.find({silla:this.silla})
        }catch(err){console.log(err)}      
    }

    checkClients(){

        let allClientsReady = ClientDB.find({silla: this.silla})

        for(let cliente of allClientsReady){
            if (cliente.status === "esperando" && cliente.nturno < this.turnoNow ){
                cliente.status = 'listo';
                ClientDB.update({nturno:cliente.nturno, silla:this.silla}, cliente).save()
            }
        }

        let allClientsSecondChg = ClientDB.find({nturno:{$gte: this.turnoNow}, silla:this.silla});
        for(let cliente of allClientsSecondChg){
            if(cliente.status === "listo"){
                cliente.status = 'esperando';
                ClientDB.update({nturno:cliente.nturno}, cliente).save()
            }
        }
    }
} 





module.exports = {ClientReporitory, ClientDB}
