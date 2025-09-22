
const dbLocal = require("db-local");
const fs = require("fs")
const path = require('path');
const schedule = require('node-schedule');
// const { act } = require("react");





// Esquema para clientes
const { Schema } = new dbLocal({ path: "./db" });
const ClientDB = Schema('Client', {
    _id: {type: Number, require:true, unique: true},
    nturno: {type: Number, require: true},
    name: {type: String, require: true},
    silla: {type: String, require: true},
    status: {type: String, default: "esperando"},

    
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
            silla: this.silla,
            open: this.open
        }
    }
    constructor(silla) {
        this.turnoForAsing = 1;
        this.turnoNow = 1;
        this.silla = silla;
        this.open = 0;
        // esta variable es para manejar el ultimo turno registrado en addClient 

        // crear el archivo json  al que hara referencia la instancia
        this.pathJson = path.join(__dirname, 'json', `silla${silla}.json`)

        if(fs.existsSync(this.pathJson)){

            let data = JSON.parse(fs.readFileSync(this.pathJson).toString())
            this.turnoForAsing = data.turnoForAsing
            this.turnoNow = data.turnoNow
            this.open = data.open

        }
        else{
            //let data = {"turnoForAsing": this.turnoForAsing, "turnoNow": this.turnoNow}
            fs.appendFileSync(this.pathJson, JSON.stringify(this))
        }
    }

    addClient(name){  // para que vaquero pueda agregar clientes a la lista de espera
        try {

            let id = getNextId()
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
                let cliente_actual = ClientDB.findOne({nturno: this.turnoNow, silla: this.silla})
                // let next_clients = ClientDB.find({nturno: {$gt: this.turnoNow}, silla: this.silla})

                if (cliente_actual.status !== 'declinado'){

                    let cliente = ClientDB.findOne({nturno: this.turnoNow-1, silla: this.silla})
                    if(cliente && cliente.status === 'listo')  // verificamos que exista un cliente anterior
                    {
                        this.turnoNow -= 1  //disminuimos el turno actual
                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla: this.silla}, cliente).save();
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));

                        return {"turno": this.turnoNow, "clienteActual": cliente}
                    }
                    else if (cliente && cliente.status==="declinado")
                    {  // este else se ejecutara si el cliente anterior existe pero esta como declinado
                        let contador = 1
                        while (cliente && cliente.status === "declinado" ) {
                            contador +=1
                            if(contador === this.turnoNow) {
                                return false
                            }
                            cliente = ClientDB.findOne({nturno: this.turnoNow-contador, silla: this.silla})

                        }

                        this.turnoNow = this.turnoNow - contador;
                        cliente.status = "esperando";
                        ClientDB.update({nturno: this.turnoNow, silla:this.silla}, cliente).save()
                        fs.writeFileSync(this.pathJson, JSON.stringify(this));
                        return {"turno": this.turnoNow, "clienteActual": cliente}


                    }
                }else{
                    return false;
                }



            }catch(err){console.log(err)}
        }
        
    }

    desDecline(id) {

        let ID = parseInt(id);
        let cliente = ClientDB.findOne({_id: ID})
        // let backClient = ClientDB.findOne({nturno: cliente.nturno-1, silla: this.silla})
        //let clientDesDecline = ClientDB.findOne({_id})

        if (cliente.nturno < this.turnoNow){
            cliente.status = 'listo'
            ClientDB.update({_id: ID}, cliente).save()
            return {"cliente": cliente } // su status sera listo

        }else if (cliente.nturno > this.turnoNow)
        {
            cliente.status = 'esperando'
            ClientDB.update({_id: ID}, cliente).save()
            return {"cliente": cliente }
        }else if(cliente.nturno === this.turnoNow){
            cliente.status = 'esperando'
            ClientDB.update({_id: ID}, cliente).save()
            return {"cliente": cliente, "is_actual": true }
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

    openAndClose(){
        this.open = this.open === 0 ? 1 : 0;
        fs.writeFileSync(this.pathJson, JSON.stringify(this));
        return {'open': this.open, 'silla':this.silla}
    }
} 

/***********************************************************
|   |  PARA OPERACIONES GENERALES CON LA BASE DE DATOS   |  |
 ***********************************************************/

class GnClientRepository{
    changeName(id, name){
        // console.log({'id': id, 'name':name});
        let ID = parseInt(id)
        let client_for_change = ClientDB.findOne({_id: ID})
        client_for_change.name = name;

        ClientDB.update({_id: ID}, client_for_change).save()      
        return {'name':name, 'id': id};
        

    }

    /*************************************************
    |   ACTUALIZAR LOS TURNOS DESDE UN TURNO INICIAL  |
     *************************************************/
    async updateTurns( Turn, silla){
        let nextQuery = (turn) => {return {nturno: parseInt(turn), silla: silla}}
        let updatedClients = [];
        let initTurn = parseInt(Turn);

        let clienteNext = await ClientDB.findOne(nextQuery(initTurn));
        let cliente = clienteNext;
        let i = 1

        do {
            
            clienteNext = await ClientDB.findOne(nextQuery(initTurn + i))
            cliente.nturno++
            await ClientDB.update({_id: cliente._id}, cliente).save()
            updatedClients.push(cliente)
            cliente = clienteNext;

            i++

        } while (clienteNext);

        return updatedClients
    }



    send_listo(){

        // Clientes silla A
        let clientes_listosA = ClientDB.find({silla: 'A'}).reverse();
        let indice_primer_esperando = clientes_listosA.findIndex(cln => cln.status == "esperando")

        if(indice_primer_esperando !== -1){
            clientes_listosA = clientes_listosA.slice(0, indice_primer_esperando)
        }

        // Clientes silla B
        let clientes_listosB = ClientDB.find({silla: 'B'}).reverse();
        indice_primer_esperando = clientes_listosB.findIndex(cln => cln.status == "esperando")

        if (indice_primer_esperando !== -1){
            clientes_listosB = clientes_listosB.slice(0,indice_primer_esperando)
        }


        return clientes_listosA.concat(clientes_listosB);

    }

    send_esperando(plqs){
        let clientes_esperando = [];


        for(let plq of plqs){
            let clientes = ClientDB.find({silla: plq.silla}).reverse();
            let indexFirstWait = clientes.findIndex(cln => cln.status == "esperando")

            if(indexFirstWait != -1){
                clientes = clientes.slice(indexFirstWait, -1);
            }
            clientes_esperando = clientes_esperando.concat(clientes)
        }

        return clientes_esperando;
    }

    sendAllClients(){
        try{
            // para selecionar toda la lista
            return ClientDB.find().reverse()
        }catch(err){console.log(err)}
    }

    findActuales(plqs){
        let actuales =[];
        for (let plq of plqs){
            actuales.push(ClientDB.findOne({nturno: plq.turnoNow, silla: plq.silla}))
        }
        return actuales;

    }
}



/**********************************************
|   CODIGO PARA ELIMINAR CLIENTES A LAS 00:00  |
 **********************************************/

// const job = schedule.scheduleJob("*/1 * * * *", ()=>{
//     let fechaRD = new Date();

//     let opciones = {
//         timeZone: 'America/Santo_Domingo',
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: false
//     }

//     let horaRD = new Intl.DateTimeFormat("es-DO", opciones).format(fechaRD)
//     let [hora, minuto] = horaRD.split(":")

//     console.log("")
//     console.log(horaRD);
//     console.log("")
// })





// plq - instancias de peluquero
let plq01 = new ClientReporitory("A")
let plq02 = new ClientReporitory("B")

let plqGn = new GnClientRepository();
const plqs = [plq01, plq02]

// console.log(plqGn.send_esperando())

module.exports = {plqs, plqGn}
