

function createClientBase(client, clases){
    let Client = cElm("div")
    Client.classList.add("client")
    Client.setAttribute("client_id", client._id)
    Client.setAttribute("nturno", client.nturno)
    Client.setAttribute("silla", client.silla)
    Client.setAttribute("name", client.name)

    if(clases){
        clases.forEach(clase => {
            Client.classList.add(clase)
        });
    }

    // [ 1.1.1  A ]
    let Info = cElm("div")
    Info.classList.add("client-info")
    

    let strongE = cElm("strong")
    

    let divClientID = cElm("div")
    divClientID.classList.add('client-nturno')
    divClientID.innerHTML = client.nturno
    

    let divClientName = cElm("div")
    divClientName.classList.add("client-name")
    divClientName.innerHTML = client.name

    Client.appendChild(Info)
    Info.appendChild(strongE)
    strongE.appendChild(divClientID)
    Info.appendChild(divClientName)

    return Client

}

function crcBtnDeclinar(client){
    let declineButton = cElm('div')
    declineButton.classList.add('decline-client-button')
    declineButton.setAttribute("client_id", client._id)
    declineButton.setAttribute("silla", client.silla)
    

    let arrow1 = cElm('div')
    arrow1.classList.add("arrow1")
    

    let arrow2 = cElm('div')
    arrow2.classList.add("arrow2")

    declineButton.appendChild(arrow1)
    declineButton.appendChild(arrow2)

    return declineButton;
}

function crcBoxDesDeclinar(client){
    let desdecline_box = cElm("div")
    desdecline_box.classList.add('desdecline-box')

    desdecline_box.innerHTML += "Declinado"

    let desDeclineButton = cElm("div")
    desDeclineButton.classList.add("desdecline-button")
    desDeclineButton.setAttribute('client_id', client._id)
    desDeclineButton.setAttribute('silla', client.silla)

    let circularButton = cElm('div')
    circularButton.classList.add('circular-button')

    desdecline_box.appendChild(desDeclineButton)
        desDeclineButton.appendChild(circularButton)

    return desdecline_box
}

export function crcTextClient(msg){
    let divListoText = cElm("div")
    divListoText.classList.add("client-text")
    divListoText.innerHTML = msg

    return divListoText;
}





export function createWaitClient(client){
    
    
    let Client = createClientBase(client)

    // boton de declinar
    let declineButton = crcBtnDeclinar(client);


    Client.appendChild(declineButton)
    
    

    
    return Client
    
}

export function createGreenClient(client){


    let Client = createClientBase(client, ["GREEN"])


    let divListoText = crcTextClient("listo")
    Client.append(divListoText)
    

    return Client
}

export function createDeclnClient (client){

    let Client = createClientBase(client, ["DECLINADO", "declinado"])
    

    let desdecline_box = crcBoxDesDeclinar(client);
    
    
    Client.appendChild(desdecline_box)
    return Client
}

// cElm ==> significa Create Element, la uso para escribir menos
export function cElm(e) {
    return document.createElement(`${e}`)
}

export function searchClnID(id){
    let elm = document.querySelector(`.client[client_id="${id}"]`);
    return elm;
}

//module.exports = {createWaitClient, createGreenClient, createDeclnClient}
