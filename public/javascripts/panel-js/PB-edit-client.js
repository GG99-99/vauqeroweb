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
		let edit_btn = document.querySelector(".change-name-btn");
		edit_btn.dataset.cliente_id = elm.getAttribute("cliente_id");
		elm.appendChild(edit_btn);
		
		
		edit_btn.style.display = 'block'
		edit_btn.style.height = 'auto'
		
		// configurar si aparecera arriba o abajo del cliente el card
		let container = document.querySelector(`.clients-container[silla="${elm.getAttribute("silla")}"]`);
		let containerRect = container.getBoundingClientRect();
		let elmRect = elm.getBoundingClientRect();
		
		let distanceTop = Math.round(elmRect.top - containerRect.top);
		let distanceBottom = Math.round(containerRect.bottom - elmRect.bottom);
		
		if(distanceTop > distanceBottom){
			edit_btn.style.top = "-80%";
		}
		else{
			edit_btn.style.top = "120%";
		}
	}
	
	static hideEditsBtn(){
		let edit_btn = document.querySelector(".change-name-btn");
		edit_btn.style.display = 'none'
		edit_btn.style.top = "0";

		let frmEditCLient = document.querySelector(".input-name-box")
		frmEditCLient.style.display = 'none';


	}

	static clickEditBtn(){
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
	


	
	
}
