
function createWarnCard(txt){
	let warnDiv = document.createElement("div")
	warnDiv.classList.add("warn-event")
	warnDiv.classList.add("down-info")

	let span = document.createElement("span")
	span.innerHTML = txt;

	warnDiv.appendChild(span)

	let body = document.querySelector("body")
	body.appendChild(warnDiv)

	return warnDiv
	
	
}

export function warnEvent(txt){
	let warnElement = createWarnCard(txt)
	warnElement.classList.add("down")
	
	
	setTimeout(()=>{
		warnElement.remove()
	}, 4500)

	
	
	
}