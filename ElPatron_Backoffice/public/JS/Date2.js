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

/*

const generateAppointmentSlots = async () => {
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
        let buttonClass = isBooked ? "booked" : "";
        let buttonDisabled = isBooked ? "disabled" : "";

        row.innerHTML = `<td>${hour}:00 - ${hour + 1}:00</td>
                         <td><button class="${buttonClass}" ${buttonDisabled} onclick="selectTime('${hour}:00')">Reservar</button></td>`;
        appointmentTable.appendChild(row);
    }
};

*/

const generateAppointmentSlots = async () => {
    appointmentTable.innerHTML = "";

    // Obtener citas ocupadas desde el backend
    const response = await fetch('/Cita');
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

        // Hacer un request para obtener el nombre del cliente usando el ID
        let userResponse = await fetch('/GetUser', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: app.Id_Cliente })
        });

        let userData = await userResponse.json();
        let clientName = `${userData.Nombre} ${userData.Apellido1} ${userData.Apellido2}`; // Nombre completo
        console.log(clientName)

        // Crear la fila en la tabla
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${app.Id}</td>
            <td>${clientName}</td>
            <td>${formattedTime}</td>
            <td>${app.Estado}</td>
        `;
        appointmentTable.appendChild(row);
    }
};






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
    const nameInput = document.getElementById("nameInput");
    const nameList = document.getElementById("nameList");
    const emailInput = document.getElementById("Email");

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
});



/*
clients.forEach(client => {
    let option = document.createElement("option");
    option.value = client.nombre;
    nameList.appendChild(option);
}); 
*/