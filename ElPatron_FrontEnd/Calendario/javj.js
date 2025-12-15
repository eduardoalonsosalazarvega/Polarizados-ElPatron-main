const daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      timeSlotsContainer = document.getElementById("time-slots-container"),
      selectedDateText = document.getElementById("selected-date-text");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() };

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

let selectedServices = []; // 🔥 ARRAY para múltiples servicios
let occupiedTimes = [];
let selectedTime = null;
const servicesContainer = document.getElementById("services-container");

// ============ FUNCIÓN PARA CARGAR SERVICIOS ============
async function loadServices() {
    servicesContainer.innerHTML = "<div class='col-span-3 text-center text-gray-500'>Cargando servicios...</div>";
    
    try {
        const response = await fetch('http://25.3.26.59:8087/Service');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const services = await response.json();
        servicesContainer.innerHTML = "";
        
        if (services.length === 0) {
            servicesContainer.innerHTML = "<div class='col-span-3 text-center text-gray-500'>No hay servicios disponibles</div>";
            return;
        }
        
        services.forEach(service => {
            const serviceCard = document.createElement("div");
            serviceCard.className = "service-card p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 transition-all cursor-pointer";
            serviceCard.onclick = () => toggleService(service.Id, service.Nombre, service.Precio, serviceCard);
            
            serviceCard.innerHTML = `
                <div class="flex flex-col h-full">
                    <h3 class="font-semibold text-lg text-gray-800 mb-2">${service.Nombre}</h3>
                    <p class="text-sm text-gray-600 mb-3 flex-grow">${service.Descripcion || 'Sin descripción'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-green-600 font-bold text-xl">$${service.Precio}</span>
                    </div>
                </div>
            `;
            
            servicesContainer.appendChild(serviceCard);
        });
    } catch (error) {
        console.error("Error al cargar servicios:", error);
        servicesContainer.innerHTML = "<div class='col-span-3 text-center text-red-500'>Error al cargar servicios. Verifica la conexión.</div>";
    }
}

// ============ FUNCIÓN PARA SELECCIONAR/DESELECCIONAR SERVICIOS (MÚLTIPLE) ============
function toggleService(id, nombre, precio, element) {
    const index = selectedServices.findIndex(s => s.id === id);
    
    if (index > -1) {
        // Ya está seleccionado, lo removemos
        selectedServices.splice(index, 1);
        element.classList.remove("selected-service", "border-green-500", "bg-green-50");
        element.classList.add("border-gray-200");
    } else {
        // No está seleccionado, lo agregamos
        selectedServices.push({ id, nombre, precio });
        element.classList.add("selected-service", "border-green-500", "bg-green-50");
        element.classList.remove("border-gray-200");
    }
    
    console.log("Servicios seleccionados:", selectedServices);
    actualizarResumenServicios();
}

// ============ MOSTRAR RESUMEN DE SERVICIOS SELECCIONADOS ============
function actualizarResumenServicios() {
    const resumenDiv = document.getElementById("resumen-servicios");
    if (!resumenDiv) return;
    
    if (selectedServices.length === 0) {
        resumenDiv.innerHTML = "<p class='text-gray-500'>No has seleccionado ningún servicio</p>";
        return;
    }
    
    const total = selectedServices.reduce((sum, s) => sum + parseFloat(s.precio), 0);
    
    resumenDiv.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">Servicios seleccionados:</h3>
            <ul class="space-y-1 mb-3">
                ${selectedServices.map(s => `
                    <li class="text-sm text-gray-700">• ${s.nombre} - $${s.precio}</li>
                `).join('')}
            </ul>
            <div class="border-t pt-2">
                <p class="font-bold text-green-600 text-lg">Total: $${total.toFixed(2)}</p>
            </div>
        </div>
    `;
}

// ============ RENDERIZAR CALENDARIO ============
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
        let isPast =
            currYear < date.getFullYear() ||
            (currYear === date.getFullYear() && currMonth < date.getMonth()) ||
            (currYear === date.getFullYear() && currMonth === date.getMonth() && i < date.getDate());

        let isToday =
            i === selectedDate.day &&
            currMonth === selectedDate.month &&
            currYear === selectedDate.year
                ? "active"
                : "";

        let classes = isToday;

        if (isPast) {
            classes += " opacity-40 cursor-default text-gray-400";
        } else {
            classes += " cursor-pointer hover:bg-blue-100";
        }

        liTag += `
            <li class="${classes}"
                ${isPast ? "" : `onclick="selectDate(${i}, ${currMonth}, ${currYear})"`}>
                ${i}
            </li>
        `;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
};

window.selectDate = function(day, month, year) {
    selectedDate = { day, month, year };
    selectedDateText.innerText = `${day} de ${months[month]} de ${year}`;
    generateAppointmentSlots();
    renderCalendar();
};

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

// ============ GENERAR HORARIOS ============
async function generateAppointmentSlots() {
    timeSlotsContainer.innerHTML = "<div class='col-span-2 text-center text-gray-500'>Cargando disponibilidad...</div>";

    const fechaSeleccionada = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

    try {
        const response = await fetch(`http://25.3.26.59:8087/Cita/disponibilidad?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        occupiedTimes = data.horasOcupadas.map(h => h.padStart(5, "0"));

    } catch (error) {
        console.error("Error al obtener disponibilidad de citas:", error);
        timeSlotsContainer.innerHTML = "<div class='col-span-2 text-center text-red-500'>Error al cargar el horario.</div>";
        return;
    }

    const times = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
    timeSlotsContainer.innerHTML = "";

    times.forEach(time => {
        const isOccupied = occupiedTimes.includes(time);

        const timeSlot = document.createElement("div");
        timeSlot.className = `time-slot p-4 rounded-xl text-center font-semibold transition-all cursor-pointer ${
            isOccupied 
                ? 'occupied bg-red-100 text-red-600 border-2 border-red-200' 
                : 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
        }`;
        
        if (!isOccupied) {
            timeSlot.onclick = () => selectTime(time, timeSlot);
        }

        timeSlot.innerHTML = `
            <div class="text-2xl mb-1">${time}</div>
            <div class="text-xs">${isOccupied ? 'Ocupado' : 'Disponible'}</div>
        `;

        timeSlotsContainer.appendChild(timeSlot);
    });
}

// ============ SELECCIONAR HORARIO ============
function selectTime(time, element) {
    document.querySelectorAll(".time-slot").forEach(slot => {
        slot.classList.remove("selected");
    });
    element.classList.add("selected");
    selectedTime = time;
    console.log("Horario seleccionado:", selectedTime);
}

// ============ AGENDAR CITA CON MÚLTIPLES SERVICIOS ============
async function bookAppointment() {
    if (selectedServices.length === 0) {
        alert("Por favor, selecciona al menos un servicio.");
        return;
    }
    
    if (!selectedTime) {
        alert("Por favor, selecciona un horario.");
        return;
    }

    const horaInicio = selectedTime;
    const horaFin = parseInt(horaInicio.split(":")[0]) + 1;
    const fecha = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    
    const token = localStorage.getItem('authToken');
    
    if (token) {
        await agendarCitaConToken(token, fecha, horaInicio, horaFin);
    } else {
        const nombre = document.getElementById("nameInput").value;
        const apellido1 = document.getElementById("Apellido1Input").value;
        const apellido2 = document.getElementById("Apellido2Input").value;
        const email = document.getElementById("emailInput").value;
        const telefono = document.getElementById("phoneInput").value;

        if (!nombre || !apellido1 || !email || !telefono) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }
        
        await agendarCitaSinToken(nombre, apellido1, apellido2, email, telefono, fecha, horaInicio, horaFin);
    }
}

// 🔥 Función para usuarios CON sesión
async function agendarCitaConToken(token, fecha, horaInicio, horaFin) {
    const appointmentData = {
        StartDate: `${fecha} ${horaInicio}:00`,
        EndDate: `${fecha} ${horaFin.toString().padStart(2, "0")}:00`,
        Estado: "Pendiente"
    };

    try {
        // 1. Crear la cita
        const citaResponse = await fetch('http://25.3.26.59:8087/Cita', {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });

        if (!citaResponse.ok) throw new Error("Error al crear la cita");
        
        const citaData = await citaResponse.json();
        const citaId = citaData.Id;

        // 2. Guardar todos los servicios seleccionados
        await guardarServiciosDeCita(citaId);

        const serviciosNombres = selectedServices.map(s => s.nombre).join(", ");
        alert(`¡Cita agendada correctamente!\nServicios: ${serviciosNombres}\nHorario: ${selectedTime}`);
        resetearFormulario();

    } catch (error) {
        alert("Error al agendar la cita.");
        console.error(error);
    }
}

// 🔥 Función para usuarios SIN sesión
async function agendarCitaSinToken(nombre, apellido1, apellido2, email, telefono, fecha, horaInicio, horaFin) {
    const UsersData = {
        Nombre: nombre,
        Apellido1: apellido1,
        Apellido2: apellido2,
        Email: email,
        Telefono: telefono
    };

    try {
        // 1. Crear usuario
        const userResponse = await fetch('http://25.3.26.59:8087/Users', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(UsersData)
        });

        if (!userResponse.ok) throw new Error("Error al crear usuario");
        
        const userData = await userResponse.json();
        const Id_Cliente = userData.Id;

        // 2. Crear la cita
        const appointmentData = {
            Id_Cliente: Id_Cliente,
            StartDate: `${fecha} ${horaInicio}:00`,
            EndDate: `${fecha} ${horaFin.toString().padStart(2, "0")}:00`,
            Estado: "Pendiente"
        };

        const citaResponse = await fetch('http://25.3.26.59:8087/Cita', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData)
        });

        if (!citaResponse.ok) throw new Error("Error al crear la cita");
        
        const citaData = await citaResponse.json();
        const citaId = citaData.Id;

        // 3. Guardar todos los servicios seleccionados
        await guardarServiciosDeCita(citaId);

        const serviciosNombres = selectedServices.map(s => s.nombre).join(", ");
        alert(`¡Cita agendada correctamente!\nServicios: ${serviciosNombres}\nHorario: ${selectedTime}`);
        resetearFormulario();

    } catch (error) {
        alert("Error al agendar la cita.");
        console.error(error);
    }
}

// 🔥 Función para guardar TODOS los servicios de la cita
async function guardarServiciosDeCita(citaId) {
    const promises = selectedServices.map(servicio => {
        return fetch('http://25.3.26.59:8087/Cita/servicios', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cita_servicio_id: citaId,
                Id_Cita: citaId,
                Id_Servicio: servicio.id
            })
        });
    });

    await Promise.all(promises);
}

// Función auxiliar para limpiar formulario
function resetearFormulario() {
    document.getElementById("nameInput").value = "";
    document.getElementById("Apellido1Input").value = "";
    document.getElementById("Apellido2Input").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("phoneInput").value = "";
    
    selectedServices = [];
    selectedTime = null;
    
    generateAppointmentSlots();
    
    document.querySelectorAll(".service-card").forEach(card => {
        card.classList.remove("selected-service", "border-green-500", "bg-green-50");
        card.classList.add("border-gray-200");
    });
    
    actualizarResumenServicios();
}

// ============ INICIALIZAR ============
loadServices();
renderCalendar();
selectDate(date.getDate(), date.getMonth(), date.getFullYear());