document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll("nav ul li a");
    const content = document.getElementById("content");
    const listaCitasBtn = document.getElementById("lista-citas");

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            menuItems.forEach(menu => menu.classList.remove("active"));
            this.classList.add("active");
        });
    });


    listaCitasBtn.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        console.log("click en el boton")

        content.innerHTML = "";
        
        // Cargar el HTML del calendario en el contenedor
        fetch("http://127.0.0.1:5500/Tests/Date2.html")
            .then(response => response.text())
            .then(data => {
                content.innerHTML = data;
                loadCalendarScripts();
            })
            .catch(error => console.error("Error al cargar el contenido:", error));
    });
/*
    function loadCalendarScripts() {
        const scriptCSS = document.createElement("link");
        scriptCSS.rel = "stylesheet";
        scriptCSS.href = "http://127.0.0.1:5500/Tests/CSS/Date2.css";

        const scriptJS = document.createElement("script");
        scriptJS.src = "http://127.0.0.1:5500/Tests/JS/Date2.js";
        scriptJS.defer = true;

        document.head.appendChild(scriptCSS);
        document.body.appendChild(scriptJS);
    }

*/

function loadCalendarScripts() {
    // Eliminar scripts previos si existen
    document.querySelectorAll("script[src*='http://127.0.0.1:5500/Tests/JS/Date2.js']").forEach(script => script.remove());
    document.querySelectorAll("link[href*='http://127.0.0.1:5500/Tests/CSS/Date2.css']").forEach(link => link.remove());

    const scriptCSS = document.createElement("link");
    scriptCSS.rel = "stylesheet";
    scriptCSS.href = "http://127.0.0.1:5500/Tests/CSS/Date2.css";

    const scriptJS = document.createElement("script");
    scriptJS.src = "http://127.0.0.1:5500/Tests/JS/Date2.js";
    scriptJS.defer = true;

    document.head.appendChild(scriptCSS);
    document.body.appendChild(scriptJS);
}

});
