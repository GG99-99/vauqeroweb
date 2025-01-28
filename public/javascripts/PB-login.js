
async function sendData(){
    const url = "http://localhost:3000/login"

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;


        await fetch(url, {
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        }).then(response => {

        try {
            if (!response.ok){throw new Error("Ah ocurrido un error")};
            if (response.ok){
                console.log("todo esta bien")
                window.location = "http://localhost:3000/panel";
            };
        } catch(error){console.log(error)}
});
}
        


const submit = document.getElementById("submit");
submit.addEventListener('click', sendData);