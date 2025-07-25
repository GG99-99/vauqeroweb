

import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

import { createWaitClient, createDeclnClient, createGreenClient } from './complements/CreateClients.js';



const socket = io('ws://localhost:3000');

//  MODIFICACION A LOS METODOS DE CREAR CLIENTES

class CRC{

    static crtWaitClnt(client){
        let elm = createWaitClient(client)
        let declineButton = elm.querySelector(".decline-cliente-button") // boton de declinar

        declineButton.addEventListener('click', event => {
            let target = event.currentTarget
            console.log(target)
            let id = target.getAttribute('cliente_id');
            let silla = target.getAttribute('silla');
            console.log(silla)
            declineClient(id, silla)
           
        })

        return elm
    }

    static crtGreenClnt(client){
        let elm = createGreenClient(client)
        return elm
    }

    static crtDeclineClnt(client){
        let elm = createDeclnClient(client)
        let desDeclineButton = elm.querySelector(".desdecline-button")

        desDeclineButton.addEventListener('click', event => {
            let target = event.currentTarget
            let id = target.getAttribute('cliente_id');
            let silla = target.getAttribute('silla');
            desDecline(id, silla)


        })

        return elm
    }
}



// --------- SOCKETS HANDLER (respuestas) ---------- \\


socket.on('upturnRES', (msg) => {


    let turnoBox = document.querySelector(`.turno[silla="${msg.silla}"]`)
    turnoBox.innerHTML = msg.newTurno

    let newActualClient = document.querySelector(`.list-client-li[cliente_id="${msg.clienteActual._id}"]`)
    newActualClient.classList.add("ACTUAL")

    if(msg.clienteListo)
    {
        let replaceClient = createGreenClient(msg.clienteListo);

        let elemntForUpdate = document.querySelector(`.list-client-li[cliente_id="${msg.clienteListo._id}"]`)
        elemntForUpdate.replaceWith(replaceClient)

       

    }

    
})

// !!! hacer que busque por silla y demas cambios de lugar
socket.on("downturnRES", (res) => {

    // !!!! me quede en este metodo

    if (res){

        let lastActualClient = document.querySelector(`.ACTUAL[silla='${res.clienteActual.silla}']`)
        lastActualClient.classList.remove("ACTUAL")
    
    
        let turnoBox = document.querySelector(`.turno[silla='${res.clienteActual.silla}']`)
        turnoBox.innerHTML = res.turno
        
        
        let newActualClient = document.querySelector(`.list-client-li[cliente_id="${res.clienteActual._id}"]`)

       let replaceClient = createWaitClient(res.clienteActual)
       replaceClient.classList.add("ACTUAL")


        let buttonDecline = replaceClient.querySelector(".decline-cliente-button")
        buttonDecline.addEventListener('click', event => {
            let target = event.currentTarget
            let id = target.getAttribute('cliente_id');
            declineClient(id)

        })

       newActualClient.replaceWith(replaceClient)
    
        

    }
    

})

// {_id:,name}
socket.on("newClientRES", (cliente)=>{

    let liElement = CRC.crtWaitClnt(cliente);
    let ul = document.querySelector(`.plq-div[silla="${cliente.silla}"]`)
    let list = ul.querySelector('.list-client-ul')
    list.appendChild(liElement)


       
})

//{"clienteDecl": clientForDecl, "newTurno": this.turno, "newActualClient": newActualClient}
socket.on("declineClientRES", (res)=>{
    let leElement = createDeclnClient(res.clienteDecl);
    let elemento2 = document.querySelector(`.list-client-li[cliente_id="${res.clienteDecl._id}"]`);
    elemento2.replaceWith(leElement);

    if (res.turno){
        let turnoBox = document.querySelector(`.turno[silla='${res.clienteDecl.silla}']`)
        turnoBox.innerHTML = res.turno

        let newActualClient = document.querySelector(`.list-client-li[cliente_id="${res.turno}"]`)
        newActualClient.classList.add("ACTUAL")
    }
})

socket.on("desDeclineRES", client =>{
    if (client.status == 'listo')
    {
        let clientDesDecline = CRC.crtGreenClnt(client)
        let elemntForUpdate = document.querySelector(`.list-client-li[cliente_id="${client._id}"]`)
        elemntForUpdate.replaceWith(clientDesDecline)

    }else if (client.status == 'esperando'){
        let clientDesDecline = CRC.crtWaitClnt(client)
        let elemntForUpdate = document.querySelector(`.list-client-li[cliente_id="${client._id}"]`)
        elemntForUpdate.replaceWith(clientDesDecline)
    }


})


// -------- FUNCIONALIDAD TEMPORAL PARA SCROLL ------------//

let clientes_li = document.querySelectorAll(".list-client-li")
clientes_li.forEach(cliente => {
    cliente.addEventListener("click", event => {
        console.log("posicion respecto al contenedor", {
            left: cliente.offsetLeft,
            top: cliente.offsetTop,
        })
    })
})

// -------------------------------------------//




// --------------- SUBIR TURNO --------------- //
function upturnFunc(silla) {
    socket.emit('upturn', silla)
    return
}

// --------------- BAJAR TURNO--------------- //
function downTurn(silla){
    socket.emit("downturn", silla)
    return
}

// --------------- AGREGAR CLIENTE --------------- //
function addClient() {

    const btnAddclient = document.querySelector('.btn-addClient')
    const  silla = btnAddclient.dataset.silla

    let inputAddClient = document.querySelector('.input-addclient')   
    const nombre = inputAddClient.value

    socket.emit("newClient", nombre, silla)
    inputAddClient.value = ''
    let frmContainer = document.querySelector('.frmContainer')
    frmContainer.style.display = 'none'

    return
}



// --------------- DECLINAR CLIENTE --------------- //

export function declineClient(id, silla) {
    let msg = {'id': id, 'silla': silla};
    socket.emit('declineClient', msg)
}

// --------------- DES-DECLINAR CLIENTE --------------- //

function desDecline(id, silla){
    let msg = {'id': id, 'silla': silla};
    socket.emit('desDecline', msg)

}


// -------------- MANEJO DE SESION ------------- //

async function closeSesion() {
    const url = "http://localhost:3000/logout"
    fetch(url, {method: "POST"})
    .then(response => {

        try {
            if (!response.ok){throw new Error("Ah ocurrido un error")};
            if (response.ok){
                console.log("todo esta bien")
                window.location = "http://localhost:3000/login";
            };
        } catch(error){console.log(error)}
})}

function openScreenLogout(){
    let logoutScreen = document.querySelector('.logout-screen')
    logoutScreen.style.display = 'flex'
}

function closeScreenLogout(){
    let logoutScreen = document.querySelector('.logout-screen')
    logoutScreen.style.display = 'none'
}


// BOTON SUBIR TURNO
const buttonUpTurn = document.querySelectorAll(".button-upturn");
buttonUpTurn.forEach(button => {
    button.addEventListener('click', (e)=>{
        let silla = e.currentTarget.getAttribute('silla');
        upturnFunc(silla)
    });
})


// BOTON BAJAR TURNO
const buttonDownTurn = document.querySelectorAll(".button-downturn")
buttonDownTurn.forEach((button)=>{
    button.addEventListener("click", (e)=>{
        let silla = e.currentTarget.getAttribute('silla');
        downTurn(silla)
    })
})


// BOTON AGREGAR CLIENTE
const buttonAddClient = document.querySelector(".btn-addClient");
buttonAddClient.addEventListener('click', addClient);

// boton de abrir la pantalla para cerrar sesion
const oppenLogoutScreenButton = document.querySelector(".openLogoutScreenButton")
oppenLogoutScreenButton.addEventListener('click', openScreenLogout)

// boton de cerrar la pantala de cerrar sesion
const closeLogoutScreenButton = document.querySelector(".logout-no-close")
closeLogoutScreenButton.addEventListener('click', closeScreenLogout)

// boton cerrar sesion
const buttonLogout = document.querySelector(".logout-close");
buttonLogout.addEventListener('click', closeSesion)

// BOTON DECLINAR CLIENTE
let declineElementButtons = document.querySelectorAll('.decline-cliente-button')
declineElementButtons.forEach(button => {
button.addEventListener('click', event => {
    let target = event.currentTarget
    let id = target.getAttribute('cliente_id');
    let silla = target.getAttribute('silla');
    declineClient(id, silla)
   
})})


// BOTON DES-DECLINAR CLIENTE
let desDeclineButton = document.querySelectorAll('.desdecline-button')
desDeclineButton.forEach(button => {
    button.addEventListener('click', event => {
        let target = event.currentTarget
        let id = target.getAttribute('cliente_id');
        let silla = target.getAttribute('silla');
        desDecline(id, silla)
})})



// CONTENEDOR DE VENTANA AGREGAR CLIENTES

let frmContainer = document.querySelector('.frmContainer')

let addClientButton = document.querySelector('.btn-AddClient-box')
addClientButton.addEventListener('click', (event) => {
    frmContainer.style.display = 'flex';
})

frmContainer.addEventListener('click', (event) => {
    if(event.target === frmContainer){
        frmContainer.style.display = 'none'
    }
});



