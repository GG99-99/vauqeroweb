

import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

import { createWaitClient, createDeclnClient, createGreenClient } from '../complements/CreateClients.js';
import {container_scroll} from "./PB-panelTabs.js";
import {EClnt} from "./PB-edit-client.js"


var socket = io();

//  MODIFICACION A LOS METODOS DE CREAR CLIENTES
class CRC{

	static crtWaitClnt(client){
		let elm = createWaitClient(client)
		let declineButton = elm.querySelector(".decline-client-button") // boton de declinar


		declineButton.addEventListener('click', event => {
			let target = event.currentTarget
			let id = target.getAttribute('cliente_id');
			let silla = target.getAttribute('silla');
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

	static crtActualClnt(client){
		let cliente_actual = CRC.crtWaitClnt(client);
		cliente_actual.classList.add('ACTUAL');
		return cliente_actual;

	}
}



// --------- SOCKETS HANDLER (respuestas) ---------- \\


socket.on('upturnRES', (msg) => {


	let turnoBox = document.querySelector(`.turno[silla="${msg.silla}"]`)
	turnoBox.innerHTML = msg.newTurno

	let newActualClient = document.querySelector(`.list-client-li[cliente_id="${msg.clienteActual._id}"]`)
	newActualClient.classList.add("ACTUAL")
	container_scroll(msg.silla)

	if(msg.clienteListo)
	{
		let replaceClient = CRC.crtGreenClnt(msg.clienteListo);

		let elemntForUpdate = document.querySelector(`.list-client-li[cliente_id="${msg.clienteListo._id}"]`)
		elemntForUpdate.replaceWith(replaceClient)



	}


})

socket.on("downturnRES", (res) => {

	if (res){

		let lastActualClient = document.querySelector(`.ACTUAL[silla='${res.clienteActual.silla}']`)
		lastActualClient.classList.remove("ACTUAL")


		let turnoBox = document.querySelector(`.turno[silla='${res.clienteActual.silla}']`)
		turnoBox.innerHTML = res.turno


		let newActualClient = document.querySelector(`.list-client-li[cliente_id="${res.clienteActual._id}"]`)

		let replaceClient = CRC.crtWaitClnt(res.clienteActual)
		replaceClient.classList.add("ACTUAL")



		newActualClient.replaceWith(replaceClient)

		//let container = document.querySelector(`.clients-container[silla="${res.clienteActual.silla}"]`)
		container_scroll(res.clienteActual.silla)



	}


})

socket.on("newClientRES", (cliente)=>{

	let liElement = CRC.crtWaitClnt(cliente);
	//let ul = document.querySelector(`.plq-div[silla="${cliente.silla}"]`)
	let list = document.querySelector(`.clients-container[silla="${cliente.silla}"]`)
	list.appendChild(liElement)



})

socket.on("declineRES", (res)=>{
	let declineClientEl = CRC.crtDeclineClnt(res.clienteDecl);

	let client_for_decline = document.querySelector(`.list-client-li[cliente_id="${res.clienteDecl._id}"]`);

	client_for_decline.replaceWith(declineClientEl);

	if (res.turno){
		let turnoBox = document.querySelector(`.turno[silla='${res.clienteDecl.silla}']`)
		turnoBox.innerHTML = res.turno

		let newActualClient = document.querySelector(`.list-client-li[cliente_id="${res.turno}"]`)
		newActualClient.classList.add("ACTUAL")
	}
})

socket.on("desDeclineRES", res =>{
	let client = res.cliente;
	if (client.status === 'listo')
	{
		let clientDesDecline = CRC.crtGreenClnt(client)
		let elemntForUpdate = document.querySelector(`.list-client-li[cliente_id="${client._id}"]`)

		elemntForUpdate.replaceWith(clientDesDecline)

	}else if (client.status === 'esperando' && !res.is_actual){
		let client_DesDecline = CRC.crtWaitClnt(client)
		let elemnt_for_update = document.querySelector(`.list-client-li[cliente_id="${client._id}"]`)
		elemnt_for_update.replaceWith(client_DesDecline)

	}else if(res.is_actual){
		let client_DesDecline = CRC.crtActualClnt(client)
		let elemnt_for_update = document.querySelector(`.list-client-li[cliente_id="${client._id}"]`)
		elemnt_for_update.replaceWith(client_DesDecline)
	}


})

socket.on("openAndCloseRES", (res) => {
	let open_box = document.querySelector(`.open-box[silla="res.silla"]`)
	if(res.open){
		let open_box = document.querySelector(`.open-box[silla="${res.silla}"]`)
		open_box.setAttribute("open",res.open)

		let outer_circle = open_box.querySelector(`#outer-circle`)
		if(outer_circle.classList.contains("red-outer")){outer_circle.classList.remove("red-outer")}
		outer_circle.classList.add("green-outer")

		let inner_circle = open_box.querySelector(`#inner-circle`)
		if(inner_circle.classList.contains("red-inner")){inner_circle.classList.remove("red-inner")}
		inner_circle.classList.add("green-inner")

		let open_text = open_box.querySelector(`#open-text`)
		open_text.innerText = "Abierto"
	}
	else {
		let open_box = document.querySelector(`.open-box[silla="${res.silla}"]`)
		open_box.setAttribute("open", res.open)

		let outer_circle = open_box.querySelector(`#outer-circle`)
		if (outer_circle.classList.contains(
			"green-outer")) {outer_circle.classList.remove("green-outer")}
		outer_circle.classList.add("red-outer")

		let inner_circle = open_box.querySelector(`#inner-circle`)
		if (inner_circle.classList.contains(
			"green-inner")) {inner_circle.classList.remove("green-inner")}
		inner_circle.classList.add("red-inner")

		let open_text = open_box.querySelector(`#open-text`)
		open_text.innerText = "Cerrado"
	}

})



// FUNCION PARA VALIDAR APERTURA
function verify_is_open(){
	let btn_silla_focus = document.querySelector(`.btn-silla.focus`)
	let silla = btn_silla_focus.getAttribute("silla")

	let open_box = document.querySelector(`.open-box[silla="${silla}"]`)
	let open = Number(open_box.getAttribute('open'))

	if(open === 1){
		return true
	}else{
		let frm = document.querySelector(`.frmContainer-not-open`)
		frm.style.display = "flex"
		return false
	}
}



// --------------- SUBIR TURNO --------------- //

function upturnFunc(silla) {
	if(verify_is_open()){
		socket.emit('upturn', silla)
	}

}

// --------------- BAJAR TURNO--------------- //

function downTurn(silla){
	if(verify_is_open()){
		socket.emit('downturn', silla)
	}


}

// --------------- AGREGAR CLIENTE --------------- //

function addClient(silla) {
	if(verify_is_open()){
		let inputAddClient = document.querySelector('.input-addclient')
		const nombre = inputAddClient.value

		socket.emit("newClient", nombre, silla)
		inputAddClient.value = ''
		let frmContainer = document.querySelector('.frmContainer')
		frmContainer.style.display = 'none'
	}



}

// --------------- DECLINAR CLIENTE --------------- //

function declineClient(id, silla) {
	if(verify_is_open()){
		let msg = {'id': id, 'silla': silla};
		socket.emit('decline', msg)
	}

}

// --------------- DES-DECLINAR CLIENTE --------------- //

function desDecline(id, silla){
	if (verify_is_open()){
		let msg = {'id': id, 'silla': silla};
		socket.emit('desDecline', msg)
	}


}

// --------------- BOTON DECLINAR BOTON --------------- //


// --------------- ABRIR O CERRAR SILLA --------------- //

function openAndClose(silla){
	socket.emit('openAndClose', silla)
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
	let logoutScreen = document.querySelector('.screen.logout')
	logoutScreen.style.display = 'flex'
}

function closeScreenLogout(){
	let logoutScreen = document.querySelector('.screen.logout')
	logoutScreen.style.display = 'none'
}
// -------------------------------------------- //

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
buttonAddClient.addEventListener('click', event => {
	let btn_silla_focus = document.querySelector(`.btn-silla.focus`)
	let silla = btn_silla_focus.getAttribute("silla")
	addClient(silla)
});

// boton de abrir la pantalla para cerrar sesion
const oppenLogoutScreenButton = document.querySelector(".openLogoutScreenButton")
oppenLogoutScreenButton.addEventListener('click', openScreenLogout)

// boton de cerrar la pantala de cerrar sesion
const closeLogoutScreenButton = document.querySelector(".logout-no-close")
closeLogoutScreenButton.addEventListener('click', closeScreenLogout)

// boton cerrar sesion
const buttonLogout = document.querySelector(".logout-close");
buttonLogout.addEventListener('click', closeSesion)



// SELECCIONAR TODOS LOS CLIENTES Y AGREGAR EVENTOS (decline btn, desdecline btn, sostener)
let all_clientes = document.querySelectorAll('.list-client-li')
all_clientes.forEach(cliente => {
	
	// boton de declinar
	let declineElementButton = cliente.querySelector('.decline-client-button')
	if(declineElementButton){
		// timer lo usaremos para el contador
		let timer;
		
		declineElementButton.addEventListener('mousedown', event => {
			timer = EClnt.contador(()=>{return true}, 0.6)
			// si la pulsacion llega a 0.6 no realizara la accion de declinar
			
			
		})
		
		declineElementButton.addEventListener('mouseup', event => {
			timer.stop() //detengo el contador
			let total_time = timer.gettime();
			// si el tiempo de pulsasion es menor al 0.2 s
			if(total_time <= 0.2){
				let target = event.currentTarget
				let id = target.getAttribute('cliente_id');
				let silla = target.getAttribute('silla');
				declineClient(id, silla)
			}
			
		})

	}

	// boton de desdeclinar
	let desDeclineButton = cliente.querySelector('.desdecline-button')
	if(desDeclineButton){
		let timer;
		desDeclineButton.addEventListener('mousedown', event => {
			 timer = EClnt.contador(()=>{return true}, 0.6)
		})
		
		desDeclineButton.addEventListener('mouseup', event => {
			event.preventDefault();
			timer.stop() // detenemos el temporizador
			let total_time = timer.gettime(); // obtenemos el tiempo que duro el contador corriendo
			
			if(total_time <= 0.2){
				let target = event.currentTarget
				let id = target.getAttribute('cliente_id');
				let silla = target.getAttribute('silla');
				desDecline(id, silla)
			}
		})
	}

	
	let timer;
	// evento de sostener
	cliente.addEventListener("mousedown", event => {
		// let edit_btn = document.querySelector(".change-name-btn");
		event.preventDefault();
		let elm = event.currentTarget;
		
		timer = EClnt.contador(()=>{
			EClnt.editar(elm);
			EClnt.showEditBtn(elm)
		}, 0.6)

	})

	cliente.addEventListener("mouseup", event => {
		event.preventDefault();
		timer.stop();
		// console.log("el tiempo total fue: " + timer.gettime());
		
	})
	

})

// CONTENEDOR DE VENTANA AGREGAR CLIENTES

let frmContainer = document.querySelector('.frmContainer')

let addClientButton = document.querySelector('.btn-AddClient-box')
addClientButton.addEventListener('click', (event) => {
	if(verify_is_open()){
		frmContainer.style.display = 'flex';
	}

})

frmContainer.addEventListener('click', (event) => {
	if(event.target === frmContainer){
		frmContainer.style.display = 'none'
	}
});



// ------- EVENTOS PARA CAJA DE ABIERTO O CERRADO ------------ //
let open_boxs = document.querySelectorAll('.open-box');
open_boxs.forEach(open_box => {
	open_box.addEventListener('click', (event) => {
		let target = event.currentTarget
		let silla = target.getAttribute('silla');
		openAndClose(silla)
	})
})

let ok_button = document.querySelector('.ok-button')
ok_button.addEventListener('click', (event) => {
	let frm = document.querySelector('.frmContainer-not-open')
	frm.style.display = 'none'
})

let frm_not_open = document.querySelector('.frmContainer-not-open')
frm_not_open.addEventListener('click', (event) => {
	let target = event.currentTarget
	target.style.display = 'none'
})



// -------- EVENTO PARA BOTON EDITAR NOMBRE -------- //
let edit_btn = document.querySelector(".change-name-btn")
edit_btn.addEventListener('click', (event)=>{
	// let target = event.eventTarget; 
	EClnt.clickEditBtn()

})