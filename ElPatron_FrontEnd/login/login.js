// Toggle entre Login y Registro
document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector(".container");
    const signupLink = document.querySelector(".signup-link");
    const loginLink = document.querySelector(".login-link");

    if (signupLink) {
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            container.classList.add("show-signup");
        });
    }

    if (loginLink) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            container.classList.remove("show-signup");
        });
    }

    // Toggle para mostrar/ocultar contraseña
    const eyeIcons = document.querySelectorAll(".eye-icon");
    eyeIcons.forEach(icon => {
        icon.addEventListener("click", function() {
            const input = this.previousElementSibling;
            if (input.type === "password") {
                input.type = "text";
                this.classList.remove("bx-hide");
                this.classList.add("bx-show");
            } else {
                input.type = "password";
                this.classList.remove("bx-show");
                this.classList.add("bx-hide");
            }
        });
    });

    // Prevenir copiar/pegar en campos de contraseña
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.onpaste = function(e) {
            e.preventDefault();
            if (typeof toastWarning === 'function') toastWarning("No se permite pegar contenido en este campo");
        };
        input.oncopy = function(e) {
            e.preventDefault();
            if (typeof toastWarning === 'function') toastWarning("No se permite copiar contenido de este campo");
        };
    });
});

// Función de Login
function login(event) {
    event.preventDefault();

    const form = document.getElementById("loginForm");

    // Validación HTML required
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const btnIngresar = document.getElementById("btningresar");
    btnIngresar.innerText = "Ingresando...";
    btnIngresar.disabled = true;

    const username = document.getElementById("Username").value;
    const password = document.getElementById("Password").value;

    // Ocultar mensajes de error previos
    document.getElementById("hide-username-credential").style.display = "none";
    document.getElementById("hide-password-credential").style.display = "none";
    document.getElementById("hide-div").style.display = "none";

    if (!username) {
        document.getElementById("hide-username-credential").style.display = "block";
        btnIngresar.innerText = "Ingresar";
        btnIngresar.disabled = false;
        return;
    }

    if (!password) {
        document.getElementById("hide-password-credential").style.display = "block";
        btnIngresar.innerText = "Ingresar";
        btnIngresar.disabled = false;
        return;
    }

    fetch("http://localhost:8087/users/auth", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        if (data.token) {
            // Guardar token
            localStorage.setItem("authToken", data.token);

            // Redirección
            const redirect = localStorage.getItem("redirectAfterLogin") || "../index.html";
            localStorage.removeItem("redirectAfterLogin");
            window.location.href = redirect;
            return;
        }

        // Login fallido
        btnIngresar.innerText = "Ingresar";
        btnIngresar.disabled = false;
        document.getElementById("hide-div").style.display = "block";
    })
    .catch(error => {
        console.error(error);
        btnIngresar.innerText = "Ingresar";
        btnIngresar.disabled = false;
        if (typeof toastError === 'function') {
            toastError("Error de conexión. Verifica que el servidor esté corriendo.");
        }
    });
}
