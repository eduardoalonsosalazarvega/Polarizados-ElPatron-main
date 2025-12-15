//aray de nuestros usuarios

let users = [{username: "Admin", password: "Admin1234"},]

//elemento h1 que imprimira mas adelante un mensaje de correcto o incorrecto dependiendo si lo que teclea el usuario es el nombre de usuario Admin
const title = document.createElement("h1");

// en esta funcion validamos la contraseña y se llamara al hacer click en ingresar
function validatecredentials(event){

    event.preventDefault();
    // obtenemos los datos del html de lo que el usuario escribio
    let txtuser = String(document.getElementById("username").value)
    let password = document.getElementById("password").value

//iteramos nuestros usuarios
    users.forEach(function (user){

        //en caso de existir se imprimira correcto dentro del h1 que agregamos antes
        if(user.username === txtuser && user.password === password){

        title.style.color = "green";

        title.textContent = "correcto";

        document.body.appendChild(title);

        document.getElementById()
        }
        else{
        //de no exisitr se imprimira usuario incorrecto

        title.style.color = "red";

        title.textContent = "usuario incorrecto";

        document.body.appendChild(title);
        }
    });

}
