

import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

import { createWaitClient, createDeclnClient, createGreenClient } from './complements/CreateClients.js';


const socket = io('ws://localhost:3000');

// --------- sockets handlers (respuestas) ---------- \\


socket.on('upturnRES', (msg) => {
    console.log(msg)

    // ultimo cliente
    //let elemento = document.querySelector(`.list-client-li[idcliente="${msg.lastcliente_id}"]`)
    //console.log(elemento)

    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = msg.newTurno

    let replaceClient = createGreenClient(msg.clienteListo[0]);
    let elemntForUpdate = document.querySelector(`.list-client-li[idcliente="${msg.clienteListo[0]._id}"]`)
    elemntForUpdate.replaceWith(replaceClient)

    let newActualClient = document.querySelector(`.list-client-li[idcliente="${msg.newTurno}"]`)
    newActualClient.classList.add("ACTUAL")
})

socket.on("downturnRES", (turno) => {
    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = turno
})

socket.on("newClientRES", (cliente)=>{
    console.log(cliente)
    let liElement = createWaitClient(cliente);
    let ul = document.querySelector(".list-client-ul")
    ul.appendChild(liElement)
    console.log(liElement.childNodes)

    let buttonInLiElm = liElement.querySelector(".decline-cliente-button")
    buttonInLiElm.addEventListener('click', event => {
        let target = event.currentTarget
        console.log(target)
        let id = target.getAttribute('idcliente');
        console.log(id)
        declineClient(id)
       
    })
})


socket.on("declineClientRES", (cliente)=>{
    let leElement = createDeclnClient(cliente[0]);
    let elemento2 = document.querySelector(`.list-client-li[idcliente="${cliente[0]._id}"]`);

    elemento2.replaceWith(leElement);
})
// -------------------------------------


/*async function upturnFunc() {
    //console.log('se esta asiendo la peticion fetch para subir el turno')
    const url = 'http://localhost:3000/panel'
    const accion = 'upturn'

    fetch(url, {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({accion})
    }).then(async response => {
        try {
            if(!response.ok){throw new Error("Ah ocurrido un error")};
            if(response.ok){
                //console.log('todo nice con la peticion fetch de subir turno')
                let res = await response.json()  // para poder acceder a la propiedad turnoNow
                console.log(res)
                let turno = document.querySelector(".turno")
                turno.innerHTML = res

                let idGreen = parseInt(res) - 1
                let elemento = document.querySelector(`.list-client-li[idcliente="${idGreen}"]`)
                
                if(!elemento.classList.contains("declinado") && !elemento.classList.contains("OPASITY30")){
                    elemento.classList.add("GREEN")
                    let trashBlock = elemento.querySelector(":scope > div.decline-cliente-button")
                    trashBlock.outerHTML = `<div class="listo-text">listo</div>`
                }
                
            }
        } catch(err){console.error('Error al actualizar el turno:', err);}
    });
}*/

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
