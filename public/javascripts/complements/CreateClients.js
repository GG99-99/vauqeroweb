//import { declineClient } from "../PB-panel"


export function createWaitClient(cliente){
    //let ulFather = document.getElementsByClassName("list-client-ul") 
    // [ 1 ]

    // [ 1.1 ]
    let liElement = cElm("li")
    liElement.classList.add("list-client-li")
    liElement.setAttribute('cliente_id', cliente._id)
    liElement.setAttribute("nturno", cliente.nturno)
    liElement.setAttribute("silla", cliente.silla)

    // [ 1.1.1  A ]
    let divInformation = cElm("div")
    divInformation.classList.add("li_client-information")
    

    // [ 1.1.1.1 A ]
    let strongE = cElm("strong")
    

    // [ 1.1.1.1.1A  ]
    let divClientID = cElm("div")
    divClientID.classList.add('cliente-nturno-div')
    divClientID.innerHTML = cliente.nturno
    

    // [ 1.1.1.1 B]
    let divClientName = cElm("div")
    divClientName.classList.add("cliente-name-div")
    divClientName.innerHTML = cliente.name
    

    let declineButton = cElm('div')
    declineButton.classList.add('decline-client-button')
    declineButton.setAttribute("cliente_id", cliente._id)
    declineButton.setAttribute("silla", cliente.silla)
    

    let arrow1 = cElm('div')
    arrow1.classList.add("arrow1")
    

    let arrow2 = cElm('div')
    arrow2.classList.add("arrow2")
    

    liElement.appendChild(divInformation)
    divInformation.appendChild(strongE)
    strongE.appendChild(divClientID)
    divInformation.appendChild(divClientName)
    liElement.appendChild(declineButton)
    declineButton.appendChild(arrow1)
    declineButton.appendChild(arrow2)
    //ulFather.appendChild(liElement)

    
    return liElement
    
}

export function createGreenClient(cliente){

    let liClient = cElm("li")
    liClient.classList.add("list-client-li",  "GREEN")
    liClient.setAttribute('cliente_id', cliente._id)
    liClient.setAttribute("nturno", cliente.nturno)
    liClient.setAttribute("silla", cliente.silla)


    // crear div con clase li_client-information
    let divLiClientInformation = cElm("div")
    divLiClientInformation.classList.add("li_client-information")
    

    
    let divStrong = cElm("strong")

    let divClientID = cElm("div")
    divClientID.classList.add("cliente-nturno-div")
    divClientID.innerHTML = cliente.nturno

    let divClientName = cElm("div")
    divClientName.classList.add("cliente-name-div")
    divClientName.innerHTML = cliente.name


    let divListoText = cElm("div")
    divListoText.classList.add("client-text")
    divListoText.innerHTML = "listo"


    divStrong.appendChild(divClientID)
    divLiClientInformation.append(divStrong, divClientName)
    liClient.append(divLiClientInformation, divListoText)
    //ulFather.appendChild(liClient)

    return liClient
}

export function createDeclnClient (cliente){

    let liElement = cElm("li")
    liElement.classList.add("list-client-li")
    liElement.classList.add("OPASITY30")
    liElement.classList.add("declinado")
    liElement.setAttribute("cliente_id", cliente._id)
    liElement.setAttribute("nturno", cliente.nturno)
    liElement.setAttribute("silla", cliente.silla)

    let divInformation = cElm("div")
    divInformation.classList.add("li_client-information")

    let strongE = cElm("strong")

    let divClientID = cElm("div")
    divClientID.classList.add('cliente-nturno-div')
    divClientID.innerHTML = cliente.nturno

    let divClientName = cElm("div")
    divClientName.classList.add("cliente-name-div")
    divClientName.innerHTML = cliente.name

    let buttonSide = cElm("div")
    buttonSide.classList.add('buttonSide')

    let dclinadoText = cElm("div")
    dclinadoText.classList.add("client-text")

    let spanDcln = cElm("span")
    spanDcln.innerHTML = "Declinado"

    let desDeclineButton = cElm("div")
    desDeclineButton.classList.add("desdecline-button")
    desDeclineButton.setAttribute('cliente_id', cliente._id)
    desDeclineButton.setAttribute('silla', cliente.silla)

    let circularButton = cElm('div')
    circularButton.classList.add('circular-button')
    
   // ulFather.appendChild(liElement)
    liElement.appendChild(divInformation)
        divInformation.appendChild(strongE)
            strongE.appendChild(divClientID)
            divInformation.appendChild(divClientName)
    liElement.appendChild(buttonSide)
        buttonSide.appendChild(dclinadoText)
            dclinadoText.appendChild(spanDcln)
        buttonSide.appendChild(desDeclineButton)
            desDeclineButton.appendChild(circularButton)
    //liElement.appendChild(divDeclnText)
    
    return liElement
}

// cElm ==> significa Create Element, la uso para escribir menos
export function cElm(e) {
    return document.createElement(`${e}`)
}

//module.exports = {createWaitClient, createGreenClient, createDeclnClient}
