
const daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span");
      appointmentTable = document.querySelector("#appointment-table tbody"),
      selectedDateText = document.getElementById("selected-date-text"),
      nameInput = document.getElementById("nameInput");



let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() }; // Guarda día, mes y año

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === selectedDate.day && currMonth === selectedDate.month && currYear === selectedDate.year ? "active" : "";
        let isDisabled = currYear < date.getFullYear() || (currYear === date.getFullYear() && currMonth < date.getMonth()) || 
                         (currYear === date.getFullYear() && currMonth === date.getMonth() && i < date.getDate()) ? "disabled" : "";

        liTag += `<li class="${isToday} ${isDisabled}" onclick="selectDate(${i}, ${currMonth}, ${currYear})">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
};

// Función para seleccionar una fecha y guardarla correctamente
function selectDate(day, month, year) {
    selectedDate = { day, month, year };
    // Guarda correctamente la fecha seleccionada
    selectedDateText.innerText = `${day} de ${months[month]} de ${year}`;
    generateAppointmentSlots();
    renderCalendar();
}

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }

        renderCalendar();
    });
});

renderCalendar();






const generateAppointmentSlots = async () => {
    appointmentTable.innerHTML = "";

    // Obtener citas ocupadas desde el backend
    const response = await fetch('http://localhost:8087/Cita');
    const appointments = await response.json();

    // Filtrar citas del día seleccionado
    const selectedDayAppointments = appointments.filter(app => {
        const appointmentDate = new Date(app.Fecha_Inicio);
        return (
            appointmentDate.getFullYear() === selectedDate.year &&
            appointmentDate.getMonth() === selectedDate.month &&
            appointmentDate.getDate() === selectedDate.day
        );
    });

    // Si no hay citas, mostrar un mensaje
    if (selectedDayAppointments.length === 0) {
        appointmentTable.innerHTML = `<tr><td colspan="4">No hay citas programadas para esta fecha.</td></tr>`;
        return;
    }

    // Iterar sobre las citas y obtener los nombres de los clientes
    for (let app of selectedDayAppointments) {
    let appointmentDate = new Date(app.Fecha_Inicio);
    let day = appointmentDate.getDate();
    let month = months[appointmentDate.getMonth()];
    let year = appointmentDate.getFullYear();
    let startHour = appointmentDate.getHours();
    let endHour = startHour + 1;
    let formattedTime = `${day} de ${month} de ${year}, ${startHour}:00 - ${endHour}:00`;

    let userResponse = await fetch('/GetUser', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: app.Id_Cliente })
    });

    let userData = await userResponse.json();
    let clientName = `${userData.Nombre} ${userData.Apellido1} ${userData.Apellido2}`;

    let row = document.createElement("tr");
    row.innerHTML = `
        <td>${app.Id}</td>
        <td>${clientName}</td>
        <td>${formattedTime}</td>
        <td>${app.Estado}</td>
        <td>
            ${app.Estado === "Completada" ? "<span class='completed-text'>Cita atendida</span>" : `<button onclick="CompletarCita(${app.Id})" class="button-completar">Marcar como atendida</button>`}
        </td>
    `;
    appointmentTable.appendChild(row);
}


};


async function fetchCategories() {
    try {
        const response = await fetch("/Cita");
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

//fetchCategories()


// Función para renderizar categorías
    function renderCategories(categories) {
    const categoryTableBody = document.getElementById("appointment-container").querySelector("tbody");
    categoryTableBody.innerHTML = ""; // Limpiar contenido

    categories.forEach(category => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${category.Id}</td>
            <td>${category.Nombre}</td>
            <td>
                <button class="edit-btn" onclick="editCategory(${category.Id})">Editar</button>
                <button class="delete-btn" onclick="deleteCategory(${category.Id})">Eliminar</button>
            </td>
        `;
        categoryTableBody.appendChild(row);
    });
}

window.CompletarCita = function(id){

    const DateData = {id: id, Estado: "Completada"}

    fetch('/Cita', {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DateData)
        })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        alert("La cita ha sido atendida!");

        window.location.reload();
        fetchCategories()
    });   


}



// Agregar estilos CSS para resaltar los horarios ocupados
const style = document.createElement('style');
style.innerHTML = `
    .booked {
        background-color: red;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

generateAppointmentSlots();


function selectTime(time) {
    document.querySelectorAll(".appointment-container button").forEach(btn => btn.classList.remove("selected"));
    event.target.classList.add("selected");
    event.target.dataset.time = time;
}

let selectedUserId = null;
function bookAppointment() {
        if (!selectedUserId) {
            alert("Por favor, selecciona un usuario antes de agendar la cita.");
            return;
        }

        let selectedButton = document.querySelector(".appointment-container button.selected");
        if (!selectedButton) {
            alert("Por favor, selecciona un horario antes de agendar la cita.");
            return;
        }

        const horaInicio = selectedButton.dataset.time;
        const horaFin = parseInt(horaInicio.split(":")[0]) + 1;

        const appointmentData = {
            Id_Cliente: selectedUserId,
            StartDate: `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day} ${horaInicio}:00`,
            EndDate: `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day} ${horaFin}:00`,
            Estado: "Pendiente"
        };

        fetch('/Cita', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Cita agendada correctamente");
            console.log(data);
        })
        .catch(error => {
            alert("Error al agendar la cita");
            console.error(error);
        });
    }

document.addEventListener("DOMContentLoaded", async function() {
    const nameInput = document.getElementById("name");
    const nameList = document.getElementById("nameList");
    const emailInput = document.getElementById("Email");
    const openFormBtn = document.getElementById("open-form-btn");
    const closeFormBtn = document.getElementById("close-form-btn");
    const closeFormBtnSchedule = document.getElementById("close-form-btn2");
    const appointmentForm = document.getElementById("appointment-form");
    //const userInfoSection = document.getElementById('userInfoSection')

    openFormBtn.addEventListener("click", () => {
        appointmentForm.style.display = "block";
    });

    closeFormBtn.addEventListener("click", () => {
        appointmentForm.style.display = "none";
    });

    closeFormBtnSchedule.addEventListener("click", () => {
        appointmentForm.style.display = "none";
    });

   let Id_Cliente = 0;


   

document.getElementById("submit-appointment").addEventListener("click", () => {
    const nombre = document.getElementById("name").value;
    const apellido1 = document.getElementById("surname1").value;
    const apellido2 = document.getElementById("surname2").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("phone").value;

    const UsersData = { Nombre: nombre, Apellido1: apellido1, Apellido2: apellido2, Email: email, Telefono: telefono };

    fetch('/Users', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(UsersData)
    })
    .then(response => response.json())
    .then(data => {
        Id_Cliente = data.Id; // Ahora sí tenemos el ID correcto

        let selectedButton = document.querySelector(".appointment-container button.selected");
        const horaInicio = selectedButton.dataset.time;
        const horaFin = parseInt(horaInicio.split(":")[0]) + 1;

        const appointmentData = {
            Id_Cliente: Id_Cliente,
            StartDate: `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day} ${horaInicio}:00`,
            EndDate: `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day} ${horaFin}:00`,
            Estado: "Pendiente"
        };

        console.log(appointmentData.Id_Cliente);
        console.log(appointmentData.StartDate);
        console.log(appointmentData.EndDate);
        console.log(appointmentData.Estado);

        return fetch('/Cita', { // Se ejecuta después de obtener `Id_Cliente`
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData)
        });
    })
    .then(response => response.json())
    .then(data => {
        alert("Cita agendada correctamente tu código de usuario es: " + Id_Cliente);
        console.log(data);
    })
    .catch(error => {
        alert("Error al agendar la cita");
        console.error(error);
    });

    appointmentForm.style.display = "none";
});


    let users = [];

    const fetchUsers = async () => {
        const response = await fetch('/Users');
        users = await response.json();
    };

    await fetchUsers();

    const filterUsers = () => {
        const query = nameInput.value.trim().toLowerCase();
        nameList.innerHTML = "";

        if (query.length > 0) {
            const filteredUsers = users.filter(user => 
                user.Nombre.toLowerCase().includes(query)
            );

            filteredUsers.forEach(user => {
                let option = document.createElement("option");
                option.value = `${user.Nombre} - ID: ${user.Id}`;
                option.dataset.userId = user.Id;
                nameList.appendChild(option);
            });
        }
    };

    // Evento para detectar selección y asignar email y ID del usuario
    nameInput.addEventListener("change", () => {
        const selectedOption = [...nameList.children].find(option => option.value === nameInput.value);
        
        if (selectedOption) {
            const selectedUser = users.find(user => user.Id == selectedOption.dataset.userId);
            if (selectedUser) {
                emailInput.value = selectedUser.Correo;
                selectedUserId = selectedUser.Id; // Guarda el ID en la variable global
            }
        } else {
            emailInput.value = "";
            selectedUserId = null;
        }
    });

    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedFilterUsers = debounce(filterUsers, 500);
    nameInput.addEventListener("input", debouncedFilterUsers);





document.getElementById("next-step").addEventListener("click", () => {
    const userInfoSection = document.getElementById("user-info");
    const scheduleSection = document.getElementById("appointment-schedule");

    console.log("click en siguiente")

    // Validar campos antes de avanzar
    const fields = userInfoSection.querySelectorAll("input");
    let allFilled = true;
    fields.forEach(field => {
        if (!field.value.trim()) {
            allFilled = false;
        }
    });

    

    if (!allFilled) {
        alert("Por favor, llena todos los campos antes de continuar.");
        return;
    }

    userInfoSection.classList.add("hidden");
    userInfoSection.style.display = "none";
    scheduleSection.classList.remove("hidden");
    scheduleSection.style.display = "block";
    scheduleSection.classList.add("visible");

    document.getElementById("appointment-schedule").classList.remove("hidden");

    // Animación de expansión
    

    generateAppointmentSlots2(); // Llamar a la función para mostrar horarios
});

// Función para generar horarios
const generateAppointmentSlots2 = async () => {
    const appointmentTable = document.querySelector("#appointment-table-schedule tbody");
    appointmentTable.innerHTML = "";

    // Obtener citas ocupadas desde el backend
    const response = await fetch('/Cita');
    const appointments = await response.json();

    for (let hour = 8; hour <= 16; hour++) {
        let isBooked = appointments.some(app => {
            const appointmentDate = new Date(app.Fecha_Inicio);
            return (
                appointmentDate.getFullYear() === selectedDate.year &&
                appointmentDate.getMonth() === selectedDate.month &&
                appointmentDate.getDate() === selectedDate.day &&
                appointmentDate.getHours() === hour
            );
        });

        let row = document.createElement("tr");
        let availability = isBooked ? "Reservado" : "Disponible";
        let buttonClass = isBooked ? "booked" : "";
        let buttonDisabled = isBooked ? "disabled" : "";

        row.innerHTML = `
            <td>${hour}:00 - ${hour + 1}:00</td>
            <td>${availability}</td>
            <td><button class="${buttonClass}" ${buttonDisabled} onclick="selectTime('${hour}:00')" onmousedown="this.style.transform='scale(0.9)'; this.style.backgroundColor='green';" >Reservar</button></td>
        `;
        appointmentTable.appendChild(row);
    }
};



});



/*
clients.forEach(client => {
    let option = document.createElement("option");
    option.value = client.nombre;
    nameList.appendChild(option);
}); 
*/

