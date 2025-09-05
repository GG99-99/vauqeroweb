

async function sendData(){
    const url = "http://localhost:3000/register"

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;


        await fetch(url, {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({email, username, password})
        }).then(async response => {

        try {
            if (!response.ok){
                let error = await response.json()
                console.log(error)


                // ESTILOS PARA INGRESOS INCORRECTOS
                let inputs = document.querySelectorAll(".input");
                inputs.forEach(input => {
                    input.classList.add("red-input");
                })

                let span_invalid_data = document.querySelector(".span_invalid_data")
                span_invalid_data.innerHTML = error.message;
                span_invalid_data.classList.remove('hide')

                let login_p = document.querySelector(".login-p")
                login_p.classList.add("red-shadow")



                throw new Error("Ah ocurrido un error")
            };
            if (response.ok){
                console.log("todo esta bien")
                window.location = "http://localhost:3000/";
            };
        } catch(error){console.log(error)}
});
}
        


const submit = document.getElementById("submit");
submit.addEventListener('click', sendData);

document.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        sendData();
    }
})