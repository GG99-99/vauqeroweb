import { io } from 'https://cdn.socket.io/4.8.1/socket.io.esm.min.js';
const socket = io();
import {createWaitClient, createGreenClient, createDeclnClient, cElm} from "./complements/CreateClients.js"

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
		let btn_for_remove = cliente_decline.querySelector(".desdecline-button");
		btn_for_remove.remove()
		return cliente_decline;
	}

	static removeClientText(cliente) {
		let text = cliente.querySelector(".client-text");
		text.remove();

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
}



/********************
|   SOCKET HANDLERS  |
 ********************/
socket.on('upturnRES', (res) => {
	let clienteListo = document.querySelector(`.client[cliente_id="${res.clienteListo._id}"]`)
	let clienteListo_green = CRC.crtGreenClnt(res.clienteListo)
	clienteListo.replaceWith(clienteListo_green)


	let cliente_actual = CRC.crtActualClnt(res.clienteActual)
	let client_for_replace = document.querySelector(`.client[cliente_id="${res.clienteActual._id}"]`)
	client_for_replace.replaceWith(cliente_actual)

	// --- ACTUALIZAR TURNO
	let turnoBox = document.querySelector(`.turno[silla="${res.clienteListo.silla}"]`)
	turnoBox.innerHTML = res.newTurno
})

socket.on("downturnRES", (res) => {
	if(res){
		let lastActualClient = document.querySelector(`.ACTUAL[silla='${res.clienteActual.silla}']`);
		lastActualClient.classList.remove("ACTUAL")
		let last_client_text = lastActualClient.querySelector(".client-text");
		last_client_text.innerHTML = "esperando";



		let turnoBox = document.querySelector(`.turno[silla='${res.clienteActual.silla}']`)
		turnoBox.innerHTML = res.turno


		let newActualClient = document.querySelector(`.client[cliente_id="${res.clienteActual._id}"]`)

		// remover texto por defecto de elemento
		let newActualClient_wait = CRC.crtActualClnt(res.clienteActual)



		newActualClient.replaceWith(newActualClient_wait)
	}
})

socket.on("newClientRES", (cliente)=>{
	let new_cliente = CRC.crtWaitClnt(cliente);
	let ul = document.querySelector(".client-container")
	ul.appendChild(new_cliente)
})

socket.on("declineRES", (res) =>{
	let cliente_for_decline = document.querySelector(`.client[cliente_id="${res.clienteDecl._id}"]`)
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
	let cliente_for_replace = document.querySelector(`.client[cliente_id="${res.cliente._id}"]`)

	if(res.cliente.status === 'esperando'){
		let cliente_wait = CRC.crtWaitClnt(res.cliente)
		cliente_for_replace.replaceWith(cliente_wait)


	}
	else if (res.cliente.status === 'listo'){
		let cliente_gree = CRC.crtGreenClnt(res.cliente)
		cliente_for_replace.replaceWith(cliente_gree)
	}
})

socket.on("openAndCloseRES",(res) => {
	if(res.open){
		let open_box = document.querySelector(`.open-box[silla="${res.silla}"]`)
		open_box.setAttribute("open",res.open)
		open_box.classList.remove("close")
		open_box.classList.add("open")
		open_box.innerHTML = "Abierto"
	}else{
		let open_box = document.querySelector(`.open-box[silla="${res.silla}"]`)
		open_box.setAttribute("open",res.open)
		open_box.classList.remove("open")
		open_box.classList.add("close")
		open_box.innerHTML = "Cerrado"
	}
})

socket.on("changeNameRES", res => {
		let cliente = document.querySelector(`.client[cliente_id="${res.id}"]`)
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
		}
	})
}

// hay que llamarla almenos una vez para formatear
show_open_btn()




