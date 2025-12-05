

export function container_scroll(silla) {
	const container = document.querySelector(`.client-container[silla="${silla}"]`);
	const client_focus = container.querySelector(`.ACTUAL[silla="${silla}"]`);
	if(client_focus){
		// Calcular posición relativa
		const containerRect = container.getBoundingClientRect();
		const elementRect = client_focus.getBoundingClientRect();


		const relativeTop = container.scrollTop + (elementRect.top - containerRect.top) - 3;

		// Scroll manual
		container.scrollTo({
			top: relativeTop,
			behavior: 'smooth'
		});
	}

}