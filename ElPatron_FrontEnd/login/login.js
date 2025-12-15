javascript: window.onload = function() {
  var myInput = document.getElementById('Password');
  myInput.onpaste = function(e) {
    e.preventDefault();
    alert("No se permite pegar contenido en este campo");
  }
  
  myInput.oncopy = function(e) {
    e.preventDefault();
    alert("no se permite pegar contenido");
  }
}


function login() {

    event.preventDefault()

    const form = document.getElementById("loginForm");

    // Validación HTML required
    if (!form.checkValidity()) {
        form.reportValidity(); // Esto muestra los mensajes nativos de HTML5
        return;
    }

    document.getElementById("btningresar").innerText = "ingresando........."
    const username = document.getElementById("Username").value;
    const password = document.getElementById("Password").value;
/*
    if (!username || !password) {
        console.error("Faltan datos en el formulario.");
        return;
    }

*/
    if(!username){

        document.getElementById("hide-username-credential").style.display = "flow"
        console.log("Falta el campo nombre de usuario")
        return;
    }
    else if (!password){
        document.getElementById("hide-password-credential").style.display = "flow"
    }

    fetch("http://25.3.26.59:8087/users/auth", {
    method: "POST",
    credentials: "include",         
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username,
        password
    })
})
.then(response => response.json())
.then(data => {
    console.log(data);

    if (data.token) {
        // Guardar token
        localStorage.setItem("authToken", data.token);

        // Redirección correcta
        const redirect =
            localStorage.getItem("redirectAfterLogin") || "/index2.html";

        localStorage.removeItem("redirectAfterLogin");

        window.location.href = redirect;
        return;
    }

    // Login fallido
    if (data.message === "Autenticación fallida") {
        document.getElementById("btningresar").innerText = "Ingresar";
        document.getElementById("hide-div").style.display = "flow";
    }
})


.catch(error => console.error(error));


}