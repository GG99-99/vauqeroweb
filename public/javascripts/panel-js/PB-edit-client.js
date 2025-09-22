/*************************************
|                                     |
|   CLASE EClnt PARA EDITAR CLIENTES  |
|       - contador                    |
|       - editar                      |
|       - showEditBtn                 |
|       - hideEditsBtn                |
|       - hideFrmEditName             |
|       - clickEditBtnName            |
|                                     |
 *************************************/
 

/************************************************************************************************
|   contador: es para contar el tiempo que se mantiene presionado un cliente, para desencadenar  |
|   x o y evento las condiciones se manejan en el PB-panel                                       |
|                                                                                                |
|   editar: es para mostarar el frm oscuro y el cliente que a sido seleccionado se le agrega     |
|   la clase selected                                                                            |
|                                                                                                |
|   showEditBtn: es para mostrar el boton para editar nombre, contiene algunas condicionas       |
|   para la posicion del boton                                                                   |
|                                                                                                |
|   hideEditsBtn: para ocultar la caja con el input y el boton para cambiar el nombre            |
|   ingresado                                                                                    |
|                                                                                                |
|   hideFrmEditName: para ocultar especialmente el frm y desseleccionar el cliente               |
|                                                                                                |
|   clickEditBtnName: para cuando se presione el boton para proceder al cuadro de edicion        |
|   se llame a la funcion showEditBtn con las configuraciones de lugar                           |
|                                                                                                |
 ************************************************************************************************/




export class EClnt{

	
	static contador(callback, wait_time){
			let time = 0

			let interval = setInterval(() => {
				time += 0.1
				time = parseFloat(time.toFixed(1))
				if(parseFloat(time.toFixed(1)) >= wait_time){
					if(callback){
						callback()
						clearInterval(interval)
					}
					
				}
			}, 100)

			return{
				stop: () => clearInterval(interval),
				gettime: ()=> parseFloat(time.toFixed(1))

			}

	}
	
	static editar(elm){
		elm.classList.add('selected')
		let frm = document.querySelector(".edit-client-box")
		frm.style.display = 'flex'
		
		frm.addEventListener('click',(event)=>{
			if(event.target === frm){
				EClnt.hideEditsBtn(elm)
			
				frm.style.display = 'none'
				frm.style.zIndex = 1000;
				elm.classList.remove('selected')
			}
			
		})
	}
	
	static showEditBtn(elm){
		let btns_box = document.querySelector(".edits-btns-options")

		// boton cambio de nombre
		let edit_name_btn = document.querySelector(".change-name-btn");
		edit_name_btn.dataset.cliente_id = elm.getAttribute("cliente_id");

		// boton cambio de turno
		let edit_turno_btn = document.querySelector(".change-turno")
		edit_turno_btn.dataset.cliente_id = elm.getAttribute("cliente_id");

		elm.appendChild(btns_box);
		
		
		btns_box.style.display = 'flex'
		// btns_box.style.height = 'auto'
		
		// configurar si aparecera arriba o abajo del cliente el card
		let container = document.querySelector(`.clients-container[silla="${elm.getAttribute("silla")}"]`);
		let containerRect = container.getBoundingClientRect();
		let elmRect = elm.getBoundingClientRect();
		
		let distanceTop = Math.round(elmRect.top - containerRect.top);
		let distanceBottom = Math.round(containerRect.bottom - elmRect.bottom);
		
		if(distanceTop > distanceBottom){
			btns_box.style.top = "-170%";
		}
		else{
			btns_box.style.top = "135%";
		}
	}
	
	static hideEditsBtn(){
		let edits_btn = document.querySelector(".edits-btns-options");
		edits_btn.style.display = 'none'
		edits_btn.style.top = "0";

		let frmEditCLient = document.querySelector(".input-name-box")
		frmEditCLient.style.display = 'none';

		let textInput = frmEditCLient.querySelector("#new-name");
		textInput.value = ""

	}

	static hideFrmEditName(){
		let frm = document.querySelector(".edit-client-box")
		frm.style.display = 'none'
		frm.style.zIndex = 1000;
		let cliente = document.querySelector(".selected")
		cliente.classList.remove("selected")
	}

	static clickEditBtnName(){
		let frm = document.querySelector(".edit-client-box")
		frm.style.zIndex = 4000;

		let containerChangeName = document.querySelector(".input-name-box")
		containerChangeName.style.display = 'grid';

		let cliente = document.querySelector(".selected")
		let pastname = cliente.querySelector(".cliente-name-div")

		// asignar pastname al edit-client-box
		let pastname_box = containerChangeName.querySelector(".past-name")
		pastname_box.innerHTML = pastname.innerHTML

	}

	

	static changeName(){
		
	}
	


	
	
}
