

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
            let id = target.getAttribute('idcliente');
            declineClient(id)
           
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
            let id = target.getAttribute('idcliente')
            desDecline(id)


        })

        return elm
    }
}



// --------- sockets handlers (respuestas) ---------- \\


socket.on('upturnRES', (msg) => {
    console.log(msg)


    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = msg.newTurno

    let newActualClient = document.querySelector(`.list-client-li[idcliente="${msg.newTurno}"]`)
    newActualClient.classList.add("ACTUAL")

    if(msg.clienteListo)
    {
        let replaceClient = createGreenClient(msg.clienteListo);

        let elemntForUpdate = document.querySelector(`.list-client-li[idcliente="${msg.clienteListo._id}"]`)
        elemntForUpdate.replaceWith(replaceClient)

       

    }

    
})

// {"turno":, "cliente":}
socket.on("downturnRES", (res) => {

    if (res.turno){
        console.log(res)
    
        let lastActualClient = document.querySelector(".ACTUAL")
        lastActualClient.classList.remove("ACTUAL")
    
    
        let turnoBox = document.querySelector(".turno")
        turnoBox.innerHTML = res.turno
        
        
        let newActualClient = document.querySelector(`.list-client-li[idcliente="${res.turno}"]`)
        
        
        if (newActualClient.classList.contains("GREEN"))
        {
           let replaceClient = createWaitClient(res.cliente)
           replaceClient.classList.add("ACTUAL")
    
    
            let buttonDecline = replaceClient.querySelector(".decline-cliente-button")
            buttonDecline.addEventListener('click', event => {
                let target = event.currentTarget
                console.log(target)
                let id = target.getAttribute('idcliente');
                console.log(id)
                declineClient(id)
               
            })
    
           newActualClient.replaceWith(replaceClient)
    
        
        }
    }
    

})

// {_id:,name}
socket.on("newClientRES", (cliente)=>{
    console.log(cliente)
    let liElement = CRC.crtWaitClnt(cliente);
    let ul = document.querySelector(".list-client-ul")
    ul.appendChild(liElement)

    // console.log(liElement.childNodes)

    // let buttonInLiElm = liElement.querySelector(".decline-cliente-button") // boton de declinar
    // buttonInLiElm.addEventListener('click', event => {
    //     let target = event.currentTarget
    //     console.log(target)
    //     let id = target.getAttribute('idcliente');
    //     console.log(id)
    //     declineClient(id) })
       
})

//{"clienteDecl": clientForDecl, "newTurno": this.turno, "newActualClient": newActualClient}
socket.on("declineClientRES", (res)=>{
    let leElement = createDeclnClient(res.clienteDecl);
    let elemento2 = document.querySelector(`.list-client-li[idcliente="${res.clienteDecl._id}"]`);
    elemento2.replaceWith(leElement);

    if (res.newTurno){
        let turnoBox = document.querySelector(".turno")
        turnoBox.innerHTML = res.newTurno

        let newActualClient = document.querySelector(`.list-client-li[idcliente="${res.newTurno}"]`)
        newActualClient.classList.add("ACTUAL")
    }
})

socket.on("desDeclineRES", client =>{
    if (client.status == 'listo')
    {
        let clientDesDecline = CRC.crtGreenClnt(client)

        let elemntForUpdate = document.querySelector(`.list-client-li[idcliente="${client._id}"]`)

        elemntForUpdate.replaceWith(clientDesDecline)

    }else if (client.status == 'esperando'){
        let clientDesDecline = CRC.crtWaitClnt(client)

        let elemntForUpdate = document.querySelector(`.list-client-li[idcliente="${client._id}"]`)

        elemntForUpdate.replaceWith(clientDesDecline)
    }


})


function upturnFunc() {
    socket.emit('upturn')
    return
}

function addClient() {

    let inputAddClient = document.querySelector('.input-addclient')   
    const nombre = inputAddClient.value 

    socket.emit("newClient", nombre)
    inputAddClient.value = ''

    return
}

function downTurn(){
    socket.emit("downturn")
    return
}
// --------------- DECLINAR CLIENTE --------------- //

export function declineClient(id) {
    socket.emit('declineClient', id)
}

// --------------- DESDECLINAR CLIENTE --------------- //

function desDecline(id){
    socket.emit('desDecline', id)
    return
}


// --------------------------------------------------- //

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


const buttonUpTurn = document.querySelector(".button-upturn");
buttonUpTurn.addEventListener('click', upturnFunc);

const buttonAddClient = document.querySelector(".button-addclient");
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

// botones de eliminar clientes

let declineElementButtons = document.querySelectorAll('.decline-cliente-button')
declineElementButtons.forEach(button => {
button.addEventListener('click', event => {
    let target = event.currentTarget
    console.log(target)
    let id = target.getAttribute('idcliente');
    console.log(id)
    declineClient(id)
   
})})

// boton bajar turno

let buttonDownTurn = document.querySelector(".button-downturn")
buttonDownTurn.addEventListener("click", downTurn)


let desDeclineButton = document.querySelectorAll('.desdecline-button')
desDeclineButton.forEach(button => {
    button.addEventListener('click', event => {
        let target = event.currentTarget
        let id = target.getAttribute('idcliente')
        desDecline(id)
})})

// trabajar con el ioSocket