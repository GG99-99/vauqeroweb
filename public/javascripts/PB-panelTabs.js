let firtsBtnSilla = document.querySelector('.btn-silla')
firtsBtnSilla.classList.add('focus')


// asignar por defecto la silla con focus al btn de agregar cliente
let btnAddClient = document.querySelector('.btn-addClient')
btnAddClient.dataset.silla = firtsBtnSilla.getAttribute("silla")


// Para que cuando inicie la tab no seleccionada no se vea
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
btnSillas.forEach(btnSilla => {btnSilla.addEventListener('click', () => {

  //seleccionamos el ultimo boton con el focus y se lo removemos
  let lastFocus = document.querySelector('.focus')
  lastFocus.classList.remove('focus')
  btnSilla.classList.add('focus')


  // para cambiar el atributo silla del boton para agregar clientes
  let btnAddClient = document.querySelector(".btn-addClient")
  btnAddClient.dataset.silla = btnSilla.getAttribute("silla")



  let sillas = document.querySelectorAll('.plq-div')
  // para ocultar o aparecer la lista de silla relacionada al boton
  sillas.forEach(silla => {
    if (silla.getAttribute('silla') === btnSilla.getAttribute('silla')) {
      silla.style.display = 'flex'
    }else{
      silla.style.display = 'none'
    }
  })
})})




