import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io();
import {createWaitClient, createGreenClient, createDeclnClient, crcTextClient, cElm, searchClnID} from "../complements/CreateClients.js"
import {container_scroll} from "./container-scroll.js"

class CRC{
	static crtWaitClnt(cliente) {
		let cliente_wait = createWaitClient(cliente);
		let client_text = cElm('div')
		client_text.innerHTML = 'esperando';
		client_text.classList.add('client-text');

		cliente_wait.appendChild(client_text)
		let dcl_btn_for_remove = cliente_wait.querySelector(".decline-client-button")
		dcl_btn_for_remove.remove();

		return cliente_wait;
	}

	static crtGreenClnt(cliente) {
		return createGreenClient(cliente);

	}

	static crtDeclineClnt(cliente) {
		let cliente_decline = createDeclnClient(cliente);
		let btn_for_remove = cliente_decline.querySelector(".desdecline-box");
		btn_for_remove.remove()

		let text = crcTextClient("declinado");
		cliente_decline.appendChild(text)

		return cliente_decline;
	}
	static crtActualClnt(cliente) {
		let cliente_actual = CRC.crtWaitClnt(cliente);

		// remover client-text por default
		CRC.removeClientText(cliente_actual)

		// agregar clase "ACTUAL"
		cliente_actual.classList.add('ACTUAL');

		// agregar texto de "en turno"
		let client_text = cElm('div')
		client_text.classList.add("client-text")
		client_text.innerHTML = "En turno"

		cliente_actual.appendChild(client_text)

		return cliente_actual;

	}
	static removeClientText(cliente) {
		let text = cliente.querySelector(".client-text");
		text.remove();

	}

	
}




/**************************************************************
|   htmlToClient                                               |
|       - sirve para pasar lso div .client a objetos clientes  |
 **************************************************************/
function htmlToClient(elm){
	let client = {
		"_id": elm.getAttribute("client_id"),
		"nturno": elm.getAttribute("nturno"),
		"silla": elm.getAttribute("silla"),
		"name": elm.getAttribute("name")
	}
	return client
}


/***************************************************************
|   updateTurn                                                  |
|       - funcion que llamamos cada vez que se cambia el turno  |
 ***************************************************************/
function updateTurn(turn, silla){
	let turnoBox = document.querySelector(`.turno[silla="${silla}"]`)
	turnoBox.innerHTML = turn;
}


//
// 
// 
// 
// 
// 
// 
// 

/*****************************
|   OPERACIONES CON CLIENTES  |
 *****************************/
function elmToEsperando(elm){
	let elmObj = htmlToClient(elm);
	elm.replaceWith(CRC.crtWaitClnt(elmObj))
}
function elmToListo(elm){
	let elmObj = htmlToClient(elm);
	elm.replaceWith(CRC.crtGreenClnt(elmObj))
}

function elmToDecline(elm){
	let elmObj = htmlToClient(elm);
	elm.replaceWith(CRC.crtDeclineClnt(elmObj))
}

function elmToActual(elm){
	let elmObj = htmlToClient(elm);
	elm.replaceWith(CRC.crtActualClnt(elmObj))
}


/****************************************************
|   desdeclineFunc                                   |
|       - la utilizamos para desdeclinar un cliente  |
 ****************************************************/
function desdeclineFunc(client){

	if(client.status === 'esperando'){
		elmToEsperando(searchClnID(client._id))
	}
	else if (client.status === 'listo'){
		elmToListo(searchClnID(client._id))
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

/*************************
|   ABRIR O CERRAR SILLA  |
 *************************/
function mngStatusSilla(silla, isOpen){
	let open_box = document.querySelector(`.open-box[silla="${silla}"]`)
	open_box.setAttribute("open",isOpen)

	let text = open_box.querySelector("#open-text")
	let ring = open_box.querySelector(".ring")

	if(isOpen){
		ring.classList.remove("close")
		ring.classList.add("open")
		text.innerHTML = "ABIERTO"

	}else{
		ring.classList.remove("open")
		ring.classList.add("close")
		text.innerHTML = "CERRADO"
	}
}



/********************
|   SOCKET HANDLERS  |
 ********************/
socket.on('upturnRES', (res) => {
	/*
		"newTurno": upturnRes.turno,
		"clienteListo": upturnRes.clienteListo,
		"clienteActual": upturnRes.clienteActual,
		"silla": upturnRes.silla
	*/

	if(res){
		 updateTurn(res.newTurno, res.silla);
		 elmToListo(searchClnID(res.clienteListo._id))
		 elmToActual(searchClnID(res.clienteActual._id))
	}
})

socket.on("downturnRES", (res) => {
	/* 
		"newTurno": this.turnoNow, 
		"clienteActual": cliente, 
		"lastActual": lastActual 
	*/

	if(res){
		updateTurn(res.newTurno, res.clienteActual.silla)
		elmToActual(searchClnID(res.clienteActual._id))
		elmToEsperando(searchClnID(res.lastActual._id))
	}
})

socket.on("newClientRES", (cliente)=>{
	let new_cliente = CRC.crtWaitClnt(cliente);
	let container = document.querySelector(`.client-container[silla='${cliente.silla}']`)
	container.appendChild(new_cliente)
})


socket.on("declineRES", (res) =>{

	/* 
		"clientDecl": undefined, 
		"turno": undefined, 
		"newActualClient": undefined, 
		"silla": this.silla
	*/

	if(res.turno) updateTurn(res.turno, res.silla);
	elmToDecline(searchClnID(res.clientDecl._id))
	if(res.newActualClient) elmToActual(searchClnID(res.newActualClient._id))
})


socket.on("desDeclineRES", (res) =>{
	/* 
	{"cliente": client, 
	"is_actual": undefined/true}
	*/

	desdeclineFunc(res.cliente)	
})


socket.on("openAndCloseRES",(res) => {
	/*
		'open': this.open, 
		'silla':this.silla
	*/
	mngStatusSilla(res.silla, res.open)
})


socket.on("changeNameRES", res => {
	/*
		'name':name,
		 'id': id
	*/
		let cliente = searchClnID(res.id)
		let name_box = cliente.querySelector(".client-name")
		name_box.innerHTML = res.name;

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
btnSillas.forEach(btnSilla => {


	// evento de click
	btnSilla.addEventListener('click', () => {
		//seleccionamos el ultimo boton con el focus y se lo removemos
		let lastFocus = document.querySelector('.focus')
		lastFocus.classList.remove('focus')
		btnSilla.classList.add('focus')


		let sillas = document.querySelectorAll('.plq-div')
		// para ocultar o aparecer la lista de silla relacionada al boton
		sillas.forEach(silla => {
			if (silla.getAttribute('silla') === btnSilla.getAttribute('silla')) {
				silla.style.display = 'flex'
				show_open_btn()
				
        container_scroll(silla.getAttribute('silla'));
				
			}else{
				silla.style.display = 'none'
			}
		})
	})})



/* ---------------- MANEJO DE BOTOS DE OPEN AND CLOSE ---------------------- */

// ------ se va utilizar en el evento click del boton silla ------ //
function show_open_btn(){
	let focus_silla = document.querySelector('.focus').getAttribute('silla')

	let open_divs = document.querySelectorAll('.open-box')
	open_divs.forEach(open_div => {
		if(open_div.getAttribute('silla') !== focus_silla) {
			open_div.classList.add('hide')
		}else{
			open_div.classList.remove('hide')
			container_scroll(focus_silla)
		}
	})
}

// hay que llamarla almenos una vez para formatear
show_open_btn()




