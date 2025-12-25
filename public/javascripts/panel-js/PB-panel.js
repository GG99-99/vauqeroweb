

import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';

import { createWaitClient, createDeclnClient, createGreenClient, searchClnID } from '../complements/CreateClients.js';
import {container_scroll} from "./PB-panelTabs.js";
import {EClnt} from "./PB-edit-client.js"



var socket = io();


/***************************************************
|   MIDDLEWARE PARA LOS METODOS DE AGREGAR CLIENES  |
 ***************************************************/
class CRC{

	static crtWaitClnt(client){
		let elm = createWaitClient(client)
		let declineButton = elm.querySelector(".decline-client-button") // boton de declinar


		declineButton.addEventListener('click', event => {
			let target = event.currentTarget
			let id = target.getAttribute('client_id');
			let silla = target.getAttribute('silla');
			declineClient(id, silla)

		})

		elm.addEventListener("mousedown", mouseDownCln)
		elm.addEventListener("mouseup", mouseUpCln)
		elm.addEventListener("mouseleave", mouseLeaveCln)

		return elm
	}

	static crtGreenClnt(client){
		let elm = createGreenClient(client)

		elm.addEventListener("mousedown", mouseDownCln)
		elm.addEventListener("mouseup", mouseUpCln)
		elm.addEventListener("mouseleave", mouseLeaveCln)

		return elm
	}

	static crtDeclineClnt(client){
		let elm = createDeclnClient(client)
		let desDeclineButton = elm.querySelector(".desdecline-button")
		desDeclineButton.addEventListener('click', event => {
			let target = event.currentTarget
			let id = target.getAttribute('client_id');
			let silla = target.getAttribute('silla');
			desDecline(id, silla)


		})

		elm.addEventListener("mousedown", mouseDownCln)
		elm.addEventListener("mouseup", mouseUpCln)
		elm.addEventListener("mouseleave", mouseLeaveCln)


		return elm
	}

	static crtActualClnt(client){
		let cliente_actual = CRC.crtWaitClnt(client);
		cliente_actual.classList.add('ACTUAL');
		return cliente_actual;

	}
}

//
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 

// cambiar el turno
function changeTurno(turno, silla){
  let turnoBox = document.querySelector(`.turno[silla="${silla}"]`);
  turnoBox.innerHTML = turno;
}

// convertir a actual
function convertActual(id){
  let newActualClient = document.querySelector(`.client[client_id="${id}"]`)
	newActualClient.classList.add("ACTUAL")
}

// convertir cliente a listo
function convertListo(client){
  let replaceClient = CRC.crtGreenClnt(client);
	let elemntForUpdate = document.querySelector(`.client[client_id="${client._id}"]`)
	elemntForUpdate.replaceWith(replaceClient)
}

// cambiar silla a rojo
function sillaToRed(open_box){
  let outer_circle = open_box.querySelector(`#outer-circle`)
	outer_circle.classList.remove("green-outer")
	outer_circle.classList.add("red-outer")

	let inner_circle = open_box.querySelector(`#inner-circle`)
	inner_circle.classList.remove("green-inner")
	inner_circle.classList.add("red-inner")
	
	let open_text = open_box.querySelector(`#open-text`)
	open_text.innerText = "Cerrado"
}

// cambiar silla a verde
function sillaToGreen(open_box){
  let outer_circle = open_box.querySelector(`#outer-circle`)
		outer_circle.classList.remove("red-outer")
		outer_circle.classList.add("green-outer")

		let inner_circle = open_box.querySelector(`#inner-circle`)
		inner_circle.classList.remove("red-inner") 
		inner_circle.classList.add("green-inner")

		let open_text = open_box.querySelector(`#open-text`)
		open_text.innerText = "Abierto"
}


//
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 

/*********************
|   SOCKETS HABDLERS  |
 *********************/

socket.on('upturnRES', (res) => {
   // { "newTurno": this.turnoNow, "clienteListo": clienteListo, "clienteActual": newClientActual, 'silla': this.silla }
   // 
	changeTurno(res.newTurno, res.silla)

	convertActual(res.clienteActual._id)
	container_scroll(res.silla)

	if(res.clienteListo){ convertListo(res.clienteListo) }
})

socket.on("downturnRES", (res) => {

  if (res){
  
  		let lastActualClient = document.querySelector(`.ACTUAL[silla='${res.clienteActual.silla}']`)
  		lastActualClient.classList.remove("ACTUAL")
  
  		changeTurno(res.newTurno, res.clienteActual.silla)
  
  		let client_for_actual = document.querySelector(`.client[client_id="${res.clienteActual._id}"]`)
  		let client_actual_create = CRC.crtActualClnt(res.clienteActual)
  		client_for_actual.replaceWith(client_actual_create)
  
  		
  		container_scroll(res.clienteActual.silla)
  }
})

socket.on("newClientRES", (cliente)=>{

	let liElement = CRC.crtWaitClnt(cliente);
	let list = document.querySelector(`.clients-container[silla="${cliente.silla}"]`)
	list.appendChild(liElement)
})

socket.on("declineRES", (res)=>{
	let declineClientEl = CRC.crtDeclineClnt(res.clientDecl);
	let client_for_decline = searchClnID(res.clientDecl._id);
	client_for_decline.replaceWith(declineClientEl);

	if (res.turno){
		let turnoBox = document.querySelector(`.turno[silla='${res.clientDecl.silla}']`)
		turnoBox.innerHTML = res.turno

		let newActualClient = searchClnID(res.newActualClient._id)
		newActualClient.classList.add("ACTUAL")
	}
})

socket.on("desDeclineRES", res =>{
	let client = res.cliente;
	let element_for_update = searchClnID(client._id)

	if (client.status === 'listo')
	{
		let client_DesDecline = CRC.crtGreenClnt(client)
		element_for_update.replaceWith(client_DesDecline)

	}else if (client.status === 'esperando' && !res.is_actual){
		let client_DesDecline = CRC.crtWaitClnt(client)
		element_for_update.replaceWith(client_DesDecline)

	}else if(res.is_actual){
		let client_DesDecline = CRC.crtActualClnt(client)
		element_for_update.replaceWith(client_DesDecline)
	}
})

socket.on("openAndCloseRES", (res) => {
  
	let open_box = document.querySelector(`.open-box[silla="${res.silla}"]`)
	open_box.setAttribute("open",res.open)
	
	if(res.open){ 
    sillaToGreen(open_box)
    return
	}
	
	sillaToRed(open_box)
})

socket.on("changeNameRES", res =>{
	let client = searchClnID(res.id)
	let name_div = client.querySelector(".client-name")
	name_div.innerHTML = res.name
})

//
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 


/**************************************************
|   FUNCION PARA VALIDAR LA APERTURA DE UNA SILLA  |
 **************************************************/
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


/***********************************
|   FUNCION PARA CAMBIAR EL NOMBRE  |
 ***********************************/
function changeNameFunc(id, value){
	let msg = {'id': id, 'newName' : value}
	socket.emit("changeName", msg )
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

/*************************
|   // BOTON SUBIR TURNO  |
 *************************/
const buttonUpTurn = document.querySelectorAll(".button-upturn");
buttonUpTurn.forEach(button => {
	button.addEventListener('click', (e)=>{
		let silla = e.currentTarget.getAttribute('silla');
		upturnFunc(silla)
	});
})


/*************************
|   // BOTON BAJAR TURNO  |
 *************************/
const buttonDownTurn = document.querySelectorAll(".button-downturn")
buttonDownTurn.forEach((button)=>{
	button.addEventListener("click", (e)=>{
		let silla = e.currentTarget.getAttribute('silla');
		downTurn(silla)
	})
})


/*****************************
|   // BOTON AGREGAR CLIENTE  |
 *****************************/
const buttonAddClient = document.querySelector(".btn-addClient");
buttonAddClient.addEventListener('click', event => {
	let btn_silla_focus = document.querySelector(`.btn-silla.focus`)
	let silla = btn_silla_focus.getAttribute("silla")
	addClient(silla)
});

/*****************************************************
|   // BOTON DE ABRIR LA PANTALLA PARA CERRAR SESION  |
 *****************************************************/
const oppenLogoutScreenButton = document.querySelector(".openLogoutScreenButton")
oppenLogoutScreenButton.addEventListener('click', openScreenLogout)

/***************************************************
|   // BOTON DE CERRAR LA PANTALA DE CERRAR SESION  |
 ***************************************************/
const closeLogoutScreenButton = document.querySelector(".logout-no-close")
closeLogoutScreenButton.addEventListener('click', closeScreenLogout)

/***************************
|   // BOTON CERRAR SESION  |
 ***************************/
const buttonLogout = document.querySelector(".logout-close");
buttonLogout.addEventListener('click', closeSesion)



/************************************************************************************************
|   // SELECCIONAR TODOS LOS CLIENTES Y AGREGAR EVENTOS (DECLINE BTN, DESDECLINE BTN, SOSTENER)  |
 ************************************************************************************************/
let mouseDown = false;
let timer;

function mouseDownCln(event){
	mouseDown = true;
	event.preventDefault();
	let elm = event.currentTarget;
	
	timer = EClnt.contador(()=>{
		EClnt.editar(elm);
		EClnt.showEditBtn(elm)
	}, 0.4)
}
function mouseUpCln(event){
	mouseDown = false;
	event.preventDefault();
	if(timer){
		timer.stop();
	}
}
function mouseLeaveCln(event){
	event.preventDefault();
	if(mouseDown){
		timer.stop();
		mouseDown = false
	}
}

let all_clientes = document.querySelectorAll('.client')
all_clientes.forEach(cliente => {
    /**********************
    |   BOTON DE DECLINAR  |
     **********************/
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
				let id = target.getAttribute('client_id');
				let silla = target.getAttribute('silla');
				declineClient(id, silla)
			}
			
		})

	}

    /*************************
    |   BOTON DE DESDECLINAR  |
     *************************/
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
				let id = target.getAttribute('client_id');
				let silla = target.getAttribute('silla');
				desDecline(id, silla)
			}
		})
	}

	
	
    /******************************************
    |   EVENTO SOSTENER, MOUSE-UP, MOUSE-DOWN  |
     ******************************************/
	
	
	
	cliente.addEventListener("mousedown", mouseDownCln)

	cliente.addEventListener("mouseup", mouseUpCln)

	cliente.addEventListener("mouseleave", mouseLeaveCln)

})




/*******************************************
|   CONTENEDOR DE VENTANAS AGREGAR CLIENTE  |
 *******************************************/

let frmContainer = document.querySelector('.frmContainer')
frmContainer.addEventListener('click', (event) => {
	if(event.target === frmContainer){
		frmContainer.style.display = 'none'
	}
});

let addClientButton = document.querySelector('.btn-AddClient-box')
addClientButton.addEventListener('click', (event) => {
	if(verify_is_open()){
		frmContainer.style.display = 'flex';
	}

})





/**********************************************
|   EVENTOS PARA EL DIV DE OPEN Y CLOSE SILLA  |
 **********************************************/

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



/***********************************
|   EVENTO PARA EL BOTON DE EDITAR  |
 ***********************************/
let edit_btn = document.querySelector(".change-name-btn")
edit_btn.addEventListener('click', (event)=>{
	EClnt.clickEditBtnName()

})


/**********************************************
|   EVENTO PARA EL BOTON DE CAMBIAR EL NOMBRE  |
 **********************************************/

let btn_changeName = document.querySelector("#btn-change-name")
btn_changeName.addEventListener('click', event => {
	let selectedClient = document.querySelector(".selected")
	let id = selectedClient.getAttribute("client_id")
	let inputBox = document.querySelector("#new-name")
	let newName = inputBox.value.trim();

	if(newName){
		changeNameFunc(id, newName)
		EClnt.hideEditsBtn();
		EClnt.hideFrmEditName();
	}
})