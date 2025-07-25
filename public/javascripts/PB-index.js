import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io('ws://localhost:3000');
import {createWaitClient, createGreenClient, createDeclnClient, cElm} from "./complements/CreateClients.js"


// --------- sockets handlers (respuestas) ---------- \\
socket.on('upturnRES', (msg) => {
    console.log(msg)
    let clienteListo = document.querySelector(`.list-client-li[cliente_id="${msg.clienteListo._id}"]`)
    let clienteListo_green = createGreenClient(msg.clienteListo)
    clienteListo.replaceWith(clienteListo_green)



    let clienteActual = document.querySelector(`.list-client-li[cliente_id="${msg.clienteActual._id}"]`)
    clienteActual.classList.add("ACTUAL")

    //agregar text de EN TURNO al clienteActual
    let client_text2 = cElm('div')
    client_text2.classList.add("client-text")
    client_text2.innerHTML = "En turno"
    clienteActual.appendChild(client_text2)

    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = msg.newTurno
})

socket.on("downturnRES", (res) => {
    if(res){
        console.log(res)
        let lastActualClient = document.querySelector(`.ACTUAL[silla='${res.clienteActual.silla}']`);
        lastActualClient.classList.remove("ACTUAL")

        // formatear todos los client-text
        let AllClient_text = document.querySelectorAll('.client-text')
        AllClient_text.forEach(text => {
            text.innerHTML = ""

        })


        let turnoBox = document.querySelector(`.turno[silla='${res.clienteActual.silla}']`)
        turnoBox.innerHTML = res.turno


        let newActualClient = document.querySelector(`.list-client-li[cliente_id="${res.clienteActual._id}"]`)

        let newActualClient_wait = createWaitClient(res.clienteActual)
        newActualClient_wait.classList.add("ACTUAL")
        newActualClient_wait.removeChild(newActualClient_wait.querySelector(".decline-cliente-button"))  // remover el boton de declinar

        //agregar text de EN TURNO al newActualClient_wait
        let client_text = cElm('div')
        client_text.classList.add("client-text")
        client_text.innerHTML = "En turno"
        newActualClient_wait.appendChild(client_text)



        newActualClient.replaceWith(newActualClient_wait)
    }
})

socket.on("newClientRES", (cliente)=>{
    console.log(cliente)
    let liElement = createWaitClient(cliente);
    liElement.removeChild(liElement.querySelector(".decline-cliente-button"))
    let ul = document.querySelector(".list-client-ul")
    ul.appendChild(liElement)
})




/* ---------------- DIVISION DE CLIENTES POR SU SILLA ----------------------*/


let firtsBtnSilla = document.querySelector('.btn-silla')
firtsBtnSilla.classList.add('focus')

let sillas = document.querySelectorAll('.plq-div')
sillas.forEach(silla => {
    if (silla.getAttribute('silla') === firtsBtnSilla.getAttribute('silla')) {
        silla.style.display = 'flex'
    }else{
        silla.style.display = 'none'
    }
})

// agregar evento de toque a los btn-silla
const btnSillas = document.querySelectorAll('.btn-silla')
btnSillas.forEach(btnSilla => {btnSilla.addEventListener('click', () => {

    //seleccionamos el ultimo boton con el focus y se lo removemos
    let lastFocus = document.querySelector('.focus')
    lastFocus.classList.remove('focus')
    btnSilla.classList.add('focus')


    let sillas = document.querySelectorAll('.plq-div')
    // para ocultar o aparecer la lista de silla relacionada al boton
    sillas.forEach(silla => {
        if (silla.getAttribute('silla') === btnSilla.getAttribute('silla')) {
            silla.style.display = 'flex'
        }else{
            silla.style.display = 'none'
        }
    })
})})