import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io('ws://localhost:3000');
import {createWaitClient, createGreenClient, createDeclnClient, cElm} from "./complements/CreateClients.js"

class CRC{
    static crtWaitClnt(cliente) {
        let cliente_wait = createWaitClient(cliente);
        cliente_wait.replaceWith(
            cliente_wait.querySelector(".decline-cliente-button"))
        return cliente_wait;
    }

    static crtGreenClnt(cliente) {
        return createGreenClient(cliente);

    }

    static crtDeclineClnt(cliente) {
        let cliente_decline = createDeclnClient(cliente);
        let btn_for_remove = cliente_decline.querySelector(".desdecline-button");
        btn_for_remove.remove()
        return cliente_decline;
    }
}

// --------- sockets handlers (respuestas) ---------- \\
socket.on('upturnRES', (res) => {
    console.log(res)
    let clienteListo = document.querySelector(`.list-client-li[cliente_id="${res.clienteListo._id}"]`)
    let clienteListo_green = CRC.crtGreenClnt(res.clienteListo)
    clienteListo.replaceWith(clienteListo_green)



    // --- NUEVO CLIENTE ACTUAL
    let clienteActual = document.querySelector(`.list-client-li[cliente_id="${res.clienteActual._id}"]`)
    clienteActual.classList.add("ACTUAL")

    //agregar text de EN TURNO al clienteActual
    let client_text2 = cElm('div')
    client_text2.classList.add("client-text")
    client_text2.innerHTML = "En turno"
    clienteActual.appendChild(client_text2)

    // --- ACTUALIZAR TURNO
    let turnoBox = document.querySelector(".turno")
    turnoBox.innerHTML = res.newTurno
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

        let newActualClient_wait = CRC.crtWaitClnt(res.clienteActual)
        newActualClient_wait.classList.add("ACTUAL")

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
    let new_cliente = CRC.crtWaitClnt(cliente);
    let ul = document.querySelector(".list-client-ul")
    ul.appendChild(new_cliente)
})

socket.on("declineRES", (res) =>{
    let cliente_for_decline = document.querySelector(`.list-client-li[cliente_id="${res.clienteDecl._id}"]`)
    cliente_for_decline.replaceWith(CRC.crtDeclineClnt(res.clienteDecl))  // cambiar el cliente a declinado

    if(res.turno){
        let turnoBox = document.querySelector(`.turno[silla="${res.clienteDecl.silla}"]`)
        turnoBox.innerHTML = res.turno
    }

    if(res.newActualClient){
        //document.querySelector('.ACTUAL').classList.remove("ACTUAL") // remover la etiqueta actual al cliente en turno

        let new_cliente_actual = CRC.crtWaitClnt(res.newActualClient)
        new_cliente_actual.classList.add("ACTUAL")

        // --- REMPLAZAR EL CLIENTE A SU FORMA CON CLIENTE ACTUAL
        document.querySelector(`.li-client-li[cliente_id="${res.newActualClient._id}"]`).replaceWith(new_cliente_actual)
    }



})

socket.on("desDeclineRES", (res) =>{
    if(res.cliente.status === 'esperando'){
        let cliente_wait = CRC.crtWaitClnt(res.cliente)
        let cliente_for_replace = document.querySelector(`.list-client-li[cliente_id="${res.cliente._id}"]`)
        cliente_for_replace.replaceWith(cliente_wait)


    }
    else if (res.cliente.status === 'listo'){
        let cliente_gree = CRC.crtGreenClnt(res.cliente)
        let cliente_for_replace = document.querySelector(`.list-client-li[cliente_id="${res.cliente._id}"]`)
        cliente_for_replace.replaceWith(cliente_gree)
    }
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