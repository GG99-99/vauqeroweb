



async function upturnFunc() {
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
                res = await response.json()  // para poder acceder a la propiedad turnoNow
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
}


async function addClient() {
    //console.log('se esta asiendo la peticion fetch para agregar un cliente')
    let inputAddClient = document.querySelector('.input-addclient')
    const url = 'http://localhost:3000/panel'
    const accion = 'addclient'
    const nombre = inputAddClient.value 

    fetch(url, {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({accion, nombre})
    }).then(async response => {
        try {
            if(!response.ok){throw new Error("Ah ocurrido un error")};
            if(response.ok){
               // console.log('todo nice con la peticion fetch de agregar cliente')
                let res = await response.json()  // para poder acceder a la propiedad del turno que se le asigno al cliente y su nombre para agregarlo al body
                console.log(res)

                ulListClientes = document.querySelector(".list-client-ul")
                ulListNewClient =`

                <li class="list-client-li" idcliente=${res.turnoCliente}>
                    <div class="li_client-information">
                        <strong> 
                            <div class="cliente-id-div">${res.turnoCliente}</div>
                        </strong>
                        <div class="cliente-name-div">
                            ${res.name}
                        </div>
                    </div>
                    <div class="decline-cliente-button" idcliente=${res.turnoCliente}>
                        <img class="decline-client-icon" src="/images/trash.png" alt="">
                    </div>                    
                </li>
                `

                ulListClientes.innerHTML += ulListNewClient
                inputAddClient.value = ''

                declineElementButtons.forEach(button => {
                    button.addEventListener('click', event => {
                        let target = event.target
                        console.log(target)
                        let id = target.getAttribute('idCliente')
                        declineClient(id)
                    
                    })})
                
                
            }
        } catch(err){console.error('Error al agregar al cliente:', err);}
    } )
    
    ;
}

// --------------- ELIMINAR CLIENTE --------------- //
async function declineClient(id) {
    const url = "http://localhost:3000/panel"
    const accion = "declinecliente"
    console.log("se esta iniciano la declinacion")
    

    const response = await fetch(url, {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({accion, id})
    })
    console.log(await response.json())
    if(!response.ok){throw new Error("Ah ocurrido un error")};
    if(response.ok){console.log("todo salio bien")}

    

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
button.addEventListener('click', async event => {
    let target = event.target
    let id = target.getAttribute('idCliente');
    await declineClient(id)

    
    let listFather = document.querySelector(`li[idcliente="${id}"]`)
    listFather.classList.add('OPASITY30')

    let declineBoxForChange = document.querySelector(`.decline-cliente-button[idcliente="${id}"]`)
    declineBoxForChange.outerHTML= '<div class="declinado-text">turno declinado </div>'
    
})})

