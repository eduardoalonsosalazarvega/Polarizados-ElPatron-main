document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll("nav ul li a");
    const content = document.getElementById("content");
    const listaCitasBtn = document.getElementById("lista-citas");
    const listaCatBtn = document.getElementById("lista-categoria");
    const listaUserBtn = document.getElementById("lista-users");
    const calendarLoaded = false
    const registerUserBtn = document.getElementById("register-user-btn");
    const userForm = document.getElementById("user-form");
    const submitUserBtn = document.getElementById("submit-user");
    const usersTable = document.getElementById("users-table").querySelector("tbody");
    const btnSearch = document.getElementById("search-btn");
    const listaCategory = document.getElementById("lista-servicios");


    registerUserBtn.addEventListener("click", function() {
    userForm.classList.toggle("hidden");
});



    // Función de edición (puedes expandirla)
    
    

//Nuevo Cotenido

const categoryTableBody = document.querySelector("#category-table tbody");
const serviceTableBody = document.querySelector("#service-table tbody")
    const createCategoryBtn = document.getElementById("create-category-btn");


    async function fetchCategories() {
    try {
        const response = await fetch("/Service");
        if (!response.ok) {
            throw new Error("Error al obtener los datos");
        }
        const data = await response.json();
        console.log(data)
        renderCategories(data);
    } catch (error) {
        console.error("Hubo un problema con la solicitud:", error);
    }
}


window.deleteCategory = function deleteCategory(id) {
        //alert("Funcion de eliminacion");

        ServiceData = {id: id}

        fetch('/Service', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ServiceData)
    })
    .then(data => {
        fetchCategories()

        renderCategories()
        
    });

     
}


window.editCategory = function editCategory(id) {
    document.getElementById("edit-form").style.display = "block";

    document.getElementById("btn-edit").addEventListener("click", function actualizarServicio() {
        const Nombre = document.getElementById("nombre-servicio2").value.trim();
        const Precio = document.getElementById("Precio-edit").value.trim();
        const Descripcion = document.getElementById("descripcion-edit").value.trim();
        const Categoria = document.getElementById("EditarCategoria").value;

        if (!Nombre || !Precio) {
            alert("Por favor, completa el nombre y el precio.");
            return;
        }

        const ServiceData = { id, Nombre, Precio, Descripcion, Categoria };

        fetch('/Service', {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ServiceData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Actualización exitosa:", data);
            fetchCategories();
            document.getElementById("edit-form").style.display = "none"; // Ocultar el formulario tras la actualización
        })
        .catch(error => {
            console.error("Error en la actualización:", error);
            alert("Ocurrió un error al actualizar el servicio.");
        });

        // Remover el eventListener para evitar duplicación
        document.getElementById("btn-edit").removeEventListener("click", actualizarServicio);
    });
};



    fetchCategories()



    // Función para renderizar categorías
    function renderCategories(categories) {
    const categoryTableBody = document.getElementById("category-table").querySelector("tbody");
    categoryTableBody.innerHTML = ""; // Limpiar contenido

    categories.forEach(category => {
        console.log(category.Id_Categoria)

        CategoryData = {id: category.Id_Categoria}


        fetch('/getCategory', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(CategoryData)
        })
        .then(response => response.json())
        .then(data => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${category.Id}</td>
            <td>${category.Nombre}</td>
            <td>$${category.Precio}</td>
            <td>${data.Nombre}</td>
            <td>
                <button class="icon-btn edit-btn" onclick="editCategory(${category.Id})" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteCategory(${category.Id})" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </td>
        `;
        categoryTableBody.appendChild(row);
            
        });

    });
}


async function fetchServices() {
    try {
        const response = await fetch("http://localhost:8087/Categoria");
        if (!response.ok) throw new Error("Error al obtener categorías");
        
        const data = await response.json();
        renderServices(data);
    } catch (error) {
        console.error("Hubo un problema:", error);
    }
}

function renderServices(categories) {
    const serviceTableBody = document.getElementById("service-table").querySelector("tbody");
    serviceTableBody.innerHTML = ""; // Limpiar contenido previo

    categories.forEach(category => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${category.Id}</td>
            <td>${category.Nombre}</td>
            <td>
                <button class="icon-btn edit-btn" onclick="editService(${category.Id})" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteService(${category.Id})" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </td>
        `;
        serviceTableBody.appendChild(row);
    });
}

window.deleteService = function(id) {
    console.log("click en eliminar")
    fetch("http://localhost:8087/Categoria", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    }).then(() => fetchServices()); // Actualizar la tabla después de eliminar
}

window.editService = function(id) {

    console.log("click en editar")
    document.getElementById("edit-form-category").style.display = "block";

    document.getElementById("Editarcat-btn").addEventListener("click", function() {
        const Nombre = document.getElementById("servicioedit").value;
        
        fetch("http://localhost:8087/Categoria", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, Nombre })
        }).then(() => fetchServices());
    });
}


document.getElementById("guardarEdit-btn").addEventListener("click", function() {

    event.preventDefault()
    
    const Nombre = document.getElementById("nombre-categorynew").value

    console.log("escribiste" + Nombre)

    datacategory = {Nombre: Nombre}

    fetch("http://localhost:8087/Categoria", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datacategory)
        }).then(() => 
            fetchServices());    
});






document.getElementById("create-service-btn").addEventListener("click", function() {
    document.getElementById("mini-formulario").style.display = "block";
});



fetchServices()


    // Función para eliminar una categoría
    

    // Crear nueva categoría (ejemplo sencillo)
    document.getElementById("create-category-btn").addEventListener("click", function() {
    document.getElementById("mini-formulario").style.display = "block";

    });

    document.getElementById("create-service-btn").addEventListener("click", function() {
    document.getElementById("mini-service").style.display = "block";

    });

document.querySelector(".close").addEventListener("click", function() {
    document.getElementById("mini-formulario").style.display = "none";
    //document.getElementById("edit-form").style.display = "none";
});

document.querySelector(".closeCategoryEdit").addEventListener("click", function() {
    document.getElementById("edit-form-category").style.display = "none";
    //document.getElementById("edit-form").style.display = "none";
});


document.querySelector(".closeDetail").addEventListener("click", function() {
    document.getElementById("edit-form").style.display = "none";
    //document.getElementById("edit-form").style.display = "none";
});

document.querySelector(".closeDetail2").addEventListener("click", function() {
    document.getElementById("Detail-form").style.display = "none";
    //document.getElementById("edit-form").style.display = "none";
});

document.querySelector(".closeCategory").addEventListener("click", function() {
    document.getElementById("mini-service").style.display = "none";
    //document.getElementById("edit-form").style.display = "none";
});

    document.getElementById("guardar-btn").addEventListener("click", async function() {

        event.preventDefault();
    const NombreService = document.getElementById("nombre-servicio").value;
    const Precio = document.getElementById("Precio").value;
    const categoriaId = document.getElementById("categorias-select").value;
    const imagen = document.getElementById("imagen").files[0];
    const Descripcion = document.getElementById("descripcion").value

    if (!NombreService || !Precio || !imagen) {
        alert("Todos los campos son requeridos");
        return;
    }

    // 🔹 Usar FormData en lugar de JSON.stringify()
    const formData = new FormData();
    formData.append("NombreService", NombreService);
    formData.append("Precio", Precio);
    formData.append("Id_Categoria", categoriaId);
    formData.append("imagen", imagen);
    formData.append("Descripcion", Descripcion); 

    try {
        const response = await fetch("/Service", {
            method: "POST",
            body: formData // 🔹 Enviar como FormData, no JSON
        });

        //const result = await response.json();
        console.log("aqui llegamos")
        //console.log(result);
        alert("Servicio creado correctamente, revise el catalogo de categorias del cliente");

        window.location.reload();

        fetchCategories(); // Si necesitas actualizar las categorías después

    } catch (error) {
        console.error("Error al crear servicio:", error);
    }
});

    // Renderizar categorías al cargar
    




document.getElementById('existing-client').addEventListener('change', function() {
        const clientCodeInput = document.getElementById('client-code');
        const clientCodeLabel = document.getElementById('client-code-label');
        
        clientCodeInput.disabled = !this.checked;
        clientCodeLabel.classList.toggle('disabled', !this.checked);
    });

submitUserBtn.addEventListener("click", function() {
    const clientCode = document.getElementById("client-code").value;
    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    if (!clientCode || !fullName || !email || !phone) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${clientCode}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>
            <button class="edit-user">Editar</button>
            <button class="delete-user">Eliminar</button>
        </td>
    `;

    usersTable.appendChild(newRow);

    document.getElementById("client-code").value = "";
    document.getElementById("full-name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    userForm.classList.add("hidden");
});

// Event delegation for Edit/Delete
usersTable.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-user")) {
        event.target.closest("tr").remove();
    } else if (event.target.classList.contains("edit-user")) {
        alert("Función de edición pendiente de implementación.");
    }
});

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            menuItems.forEach(menu => menu.classList.remove("active"));
            this.classList.add("active");
        });
    });


    listaCitasBtn.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        document.getElementById("Calendar-Section").style.display = "block"

        document.getElementById("Categoria-Section").style.display = "none"

        document.getElementById("Service-Section").style.display = "none"

        document.getElementById("menu-container").classList.add("hidden");
    });

    listaCatBtn.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        document.getElementById("Calendar-Section").style.display = "none"
        document.getElementById("Service-Section").style.display = "none"

        document.getElementById("Categoria-Section").style.display = "block"

        document.getElementById("Usuario-Section").style.display = "none"

        document.getElementById("menu-container").classList.remove("hidden");
    });

    listaCitasBtn.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        document.getElementById("Calendar-Section").style.display = "block"

        document.getElementById("Categoria-Section").style.display = "none"

        document.getElementById("Usuario-Section").style.display = "none"

        document.getElementById("Service-Section").style.display = "none"
    });

    listaUserBtn.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        document.getElementById("Calendar-Section").style.display = "none"

        document.getElementById("Categoria-Section").style.display = "none"

        document.getElementById("Usuario-Section").style.display = "block"

        document.getElementById("Service-Section").style.display = "none"

        document.getElementById("menu-container").classList.add("hidden");


    });

    listaCategory.addEventListener("click", function(event) {
        event.preventDefault();  // Evita que el enlace recargue la página

        document.getElementById("Calendar-Section").style.display = "none"

        document.getElementById("Categoria-Section").style.display = "none"

        document.getElementById("Usuario-Section").style.display = "none"

        document.getElementById("Service-Section").style.display = "block"

        document.getElementById("menu-container").classList.add("hidden");


    });

    btnSearch.addEventListener("click", function(event) {
    event.preventDefault();
    IdCliente = parseInt(document.getElementById("client-code").value)
    console.log("click en buscar")

    const GetUsersData = { userId: IdCliente};

    fetch('/GetUser', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(GetUsersData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("NombreRegister").value = data.Nombre
        document.getElementById("Apellido1Register").value = data.Apellido1
        document.getElementById("Apellido2Register").value = data.Apellido2
        document.getElementById("CorreoRegister").value = data.Correo
        document.getElementById("TelefonoRegister").value = data.Telefono
    });

});






async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:8087/Categoria');
        const categorias = await response.json();
        const select = document.getElementById('categorias-select');
        //const selectEdit = document.getElementById('categorias-select-edit"');

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            //const option2 = document.createElement('option');
            option.value = categoria.Id;
            option.textContent = categoria.Nombre;
            //option2.value = categoria.Id;
            //option2.textContent = categoria.Nombre;
            select.appendChild(option);
            //selectEdit.appendChild(option2)
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    }
}


async function cargarCategoriasEdit() {
    try {
        const response = await fetch('http://localhost:8087/Categoria');
        const categorias = await response.json();
        const select = document.getElementById('EditarCategoria');
        //const selectEdit = document.getElementById('categorias-select-edit"');

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            //const option2 = document.createElement('option');
            option.value = categoria.Id;
            option.textContent = categoria.Nombre;
            //option2.value = categoria.Id;
            //option2.textContent = categoria.Nombre;
            select.appendChild(option);
            //selectEdit.appendChild(option2)
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    }
}

cargarCategorias();

cargarCategoriasEdit();





});


function SaveUser(){

    
    const Nombre = document.getElementById("NombreRegister").value
    const Apellido1 = document.getElementById("Apellido1Register").value
    const Apellido2 = document.getElementById("Apellido2Register").value
    const Username = document.getElementById("UsernameRegister").value
    const Password = document.getElementById("PasswordRegister").value
    const email = document.getElementById("CorreoRegister").value
    const phone = document.getElementById("TelefonoRegister").value

    const UsersData = { Nombre: Nombre, Apellido1: Apellido1, Apellido2: Apellido2, Username: Username,Contrasenia: Password,Email: email, Telefono: phone };

    fetch('/Users', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(UsersData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    });

    console.log("click en el boton")

}




    