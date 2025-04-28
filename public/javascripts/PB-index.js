import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io('ws://localhost:3000');
import {createWaitClient, createGreenClient, createDeclnClient} from "./complements/CreateClients.js"



// --------- sockets handlers (respuestas) ---------- \\
socket.on('upturnRES', (msg) => {
    console.log(msg)
    let elemento = document.querySelector(`.list-client-li[idcliente="${msg.cliente._id}"]`)
    console.log(elemento)

    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = msg.newTurno
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
})