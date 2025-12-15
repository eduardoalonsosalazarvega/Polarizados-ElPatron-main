window.onload = function() {
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


/*

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de la manera tradicional

    const formData = new FormData(this); // Captura los datos del formulario

    fetch("/employees/auth", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la solicitud");
        }
        return response.json(); // Si el servidor envía JSON, convierte la respuesta
    })
    .then(data => {
        console.log("Respuesta del servidor:", data);
        // Aquí puedes manejar la respuesta, por ejemplo, redireccionar al usuario o mostrar un mensaje
    })
    .catch(error => {
        console.error("Hubo un problema con la solicitud:", error);
    });
});


*/

function login() {

    event.preventDefault()

    const form = document.getElementById("loginForm");

    // Validación HTML `required`
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
        return;
    }

    fetch("/employees/auth", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: document.getElementById("Username").value,
        password: document.getElementById("Password").value
    })
})
.then(response => response.json())
.then(data => {
    console.log(data)
    if (data.redirectUrl) {
        window.location.href = data.redirectUrl; // Redirige al usuario
    } else {
        console.log("Respuesta del servidor:", data);
        if(data.message === "Autenticación fallida"){
            document.getElementById("btningresar").innerText = "Ingresar"
            document.getElementById("hide-div").style.display = "flow"
        }

    }
})

.catch(error => console.error(error));


}