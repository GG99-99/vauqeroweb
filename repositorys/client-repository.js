
const dbLocal = require("db-local");
const fs = require("fs")
const path = require('path');





// Esquema para clientes
const { Schema } = new dbLocal({ path: "./db" });
const ClientDB = Schema('Client', {
    _id: {type: Number, require:true, unique: true},
    nturno: {type: Number, require: true},
    name: {type: String, require: true},
    silla: {type: String, require: true},
    status: {type: String, default: "esperando"}

    
})


// Esquema para el contador de IDs
const CounterDB = Schema('Counter', {
    id: { type: String, required: true },
    num: { type: Number, default: 0 }
});

// generador de IDs
function getNextId(){
    let counter = CounterDB.findOne({id:'clientId'})

    if(!counter) {
        CounterDB.create({id: 'clientId', num: 1}).save();
        return 1
    }
    else{
        const nextId = counter.num + 1
        counter.num = nextId
        CounterDB.update({id:'clientId'}, counter).save()
        return nextId


    }
}

/*
*   Branch: variosPeluqueros
*   Motivo: modificar el sistema para manejar varios peluqueros
*   Fecha: 7/5/2025
*
*/


class ClientReporitory{
    toJSON(){ // Ahora JSON.stringify(this) usará tu método toJSON()
        return {
            turnoForAsing: this.turnoForAsing,
            turnoNow: this.turnoNow,
            silla: this.silla
        }
    }
    constructor(silla) {
        this.turnoForAsing = 1;
        this.turnoNow = 1;
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

            let id = getNextId()
            console.log(id)
            let Cliente = ClientDB.create({_id: id, nturno:this.turnoForAsing ,name: name, silla: this.silla}).save(); // GUARDA EL REGISTRO EN LA BASE DE DATOS
            const cliente = {_id:id, nturno: Cliente.nturno, name: name, silla: this.silla};
            this.turnoForAsing++
            fs.writeFileSync(this.pathJson, JSON.stringify(this))
            return cliente

        }catch (err){console.log("Error en la base datos",err)}
    }

    declineClient(id){
        let ID =parseInt(id);// en vez de eliminarlo de la base de datos hay que hacer que le cambie la propiedad status a "cancelado"
        let cliente = ClientDB.findOne({_id: ID});
        cliente.status = "declinado";
        ClientDB.update({_id:ID}, cliente).save()
        //console.log("Ha finalizado correctamente el proceso de declinar")

        if (cliente.nturno === this.turnoNow)
        // si el cliente declinado es el turno actual
        {
            let newActualClient = ClientDB.findOne({nturno: this.turnoNow+1, silla:this.silla})

            if(newActualClient){
                this.turnoNow += 1
                while(newActualClient.status === "declinado")
                {
                    this.turnoNow += 1
                    newActualClient = ClientDB.findOne({nturno: this.turnoNow, silla:this.silla})
                }

                fs.writeFileSync(this.pathJson, JSON.stringify(this));
                return {"clienteDecl": cliente, "turno": this.turnoNow, "newActualClient": newActualClient}
            }


        }
        return {"clienteDecl": cliente, "turno": false, "newActualClient": false}
    }

    upTurn(){ // para que vaquero actualize el turno que se mostrara en la pagina de clientes y en el panel
        try {
            // ------------------------------------------------------------------------------------------//
            // esto para estar seguros de que los elementos que estan arriba del cliente en turno, no sean todos declinados
            let control = 0
            let confirmNextClients = ClientDB.find({silla: this.silla, nturno: {$gt: this.turnoNow}});
            for (let cliente of confirmNextClients)
            {
                if (cliente.status === "esperando")
                {
                    control = 1;
                    break
                }
            }
            if (control === 0) {return false;}// sale de la funcion porque no hay clientes esperando arriba del cliente en turno actual, no ocurrira ningun cambio
            else
            {
                let clienteListo = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla})
                clienteListo.status = "listo";
                ClientDB.update({nturno: this.turnoNow, silla: this.silla}, clienteListo).save()

                this.turnoNow += 1

                let newClientActual = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla }); // nuevo cliente en turno
                while (newClientActual.status === 'declinado') {
                    this.turnoNow++
                    newClientActual = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla });
                }
                fs.writeFileSync(this.pathJson, JSON.stringify(this));

                //console.log({ "turno": this.turnoNow, "clienteListo": clienteListo, "clienteActual": newClientActual, 'silla': this.silla })


                return { "turno": this.turnoNow, "clienteListo": clienteListo, "clienteActual": newClientActual, 'silla': this.silla }

            }
        } catch (err){console.log(err)}

    }

    downTurn(){

        if (this.turnoNow > 1){
            try 
            {
                let cliente = ClientDB.findOne({nturno: this.turnoNow-1, silla: this.silla})
                if(cliente)  // verificamos que exista un cliente anterior
                {
                    this.turnoNow -= 1  //disminuimos el turno actual


                    if (cliente.status === "listo")
                    {
                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla:this.silla}, cliente).save();
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));

                        return {"turno": this.turnoNow, "clienteActual": cliente}

                    }else {  // este else se ejecutara si el cliente anterior existe pero esta como declinado

                        while (cliente.status === "declinado") {
                            this.turnoNow -= 1
                            cliente = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla})
                        }

                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla:this.silla}, cliente).save()
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));

                        return {"turno": this.turnoNow, "clienteActual": cliente}
                    }
                }

            }catch(err){console.log(err)}
        }
        
    }

    //me falta el desdecline
    desDecline(id) {
        //console.log(turno)
        let ID = parseInt(id);
        let cliente = ClientDB.findOne({_id: ID})
        let backClient = ClientDB.findOne({nturno: cliente.nturno-1, silla: this.silla})
        //let clientDesDecline = ClientDB.findOne({_id})

        if (backClient.status === 'listo' || backClient.status === 'declinado')
        {
            cliente.status = 'listo'
            ClientDB.update({_id: ID}, cliente).save()
            return cliente  // su status sera listo

        }else if (backClient.status === 'esperando')
        {
            cliente.status = 'esperando'
            ClientDB.update({_id: ID}).save()
            return cliente // su status sera esperando
        }
    }
    
    returnTurn(){ // para que se muestre los clientes en espera a vaquero y tambien a los clientes
        return this.turnoNow
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

    sendAllClients(){
        try{
            // para selecionar toda la lista
            return ClientDB.find().reverse()
        }catch(err){console.log(err)}
    }

} 





module.exports = {ClientReporitory, ClientDB}
