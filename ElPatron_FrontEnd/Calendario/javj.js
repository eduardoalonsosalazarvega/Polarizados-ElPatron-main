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
    servicesContainer.innerHTML = `
        <div class="col-span-1 text-center text-gray-500 py-8">
            <span class="material-symbols-rounded text-4xl text-gray-300 mb-2 animate-spin">sync</span>
            <p>Cargando servicios...</p>
        </div>
    `;
    
    try {
        const response = await fetch('http://localhost:8087/Service');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const services = await response.json();
        servicesContainer.innerHTML = "";
        
        if (services.length === 0) {
            servicesContainer.innerHTML = `
                <div class="col-span-1 text-center text-gray-500 py-8">
                    <span class="material-symbols-rounded text-4xl text-gray-300 mb-2">inventory_2</span>
                    <p>No hay servicios disponibles</p>
                </div>
            `;
            return;
        }
        
        services.forEach(service => {
            const serviceCard = document.createElement("div");
            serviceCard.className = "service-card p-4 rounded-xl border-2 border-gray-200 hover:border-red-500 transition-all cursor-pointer";
            serviceCard.onclick = () => toggleService(service.Id, service.Nombre, service.Precio, serviceCard);
            
            serviceCard.innerHTML = `
                <div class="flex items-center justify-between gap-4">
                    <div class="flex-grow">
                        <h3 class="font-semibold text-gray-800">${service.Nombre}</h3>
                        <p class="text-xs text-gray-500 mt-1">${service.Descripcion || 'Sin descripción'}</p>
                    </div>
                    <span class="text-red-600 font-bold text-lg whitespace-nowrap">$${service.Precio}</span>
                </div>
            `;
            
            servicesContainer.appendChild(serviceCard);
        });
    } catch (error) {
        console.error("Error al cargar servicios:", error);
        servicesContainer.innerHTML = `
            <div class="col-span-1 text-center text-red-500 py-8">
                <span class="material-symbols-rounded text-4xl text-red-300 mb-2">error</span>
                <p>Error al cargar servicios</p>
                <p class="text-xs text-gray-400 mt-1">Verifica que el servidor esté activo</p>
            </div>
        `;
    }
}

// ============ FUNCIÓN PARA SELECCIONAR/DESELECCIONAR SERVICIOS (MÚLTIPLE) ============
function toggleService(id, nombre, precio, element) {
    const index = selectedServices.findIndex(s => s.id === id);
    
    if (index > -1) {
        // Ya está seleccionado, lo removemos
        selectedServices.splice(index, 1);
        element.classList.remove("selected-service", "border-red-500", "bg-red-50");
        element.classList.add("border-gray-200");
    } else {
        // No está seleccionado, lo agregamos
        selectedServices.push({ id, nombre, precio });
        element.classList.add("selected-service", "border-red-500", "bg-red-50");
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
        resumenDiv.innerHTML = `
            <div class="bg-gray-50 rounded-xl p-6 text-center">
                <span class="material-symbols-rounded text-4xl text-gray-300 mb-2">checklist</span>
                <p class="text-gray-500">No has seleccionado ningún servicio</p>
            </div>
        `;
        return;
    }
    
    const total = selectedServices.reduce((sum, s) => sum + parseFloat(s.precio), 0);
    
    resumenDiv.innerHTML = `
        <div class="bg-red-50 p-5 rounded-xl border border-red-100">
            <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-rounded text-red-600">shopping_cart</span>
                <h3 class="font-semibold text-gray-800">Servicios seleccionados:</h3>
            </div>
            <ul class="space-y-2 mb-4">
                ${selectedServices.map(s => `
                    <li class="flex justify-between items-center text-sm bg-white p-3 rounded-lg">
                        <span class="text-gray-700">${s.nombre}</span>
                        <span class="font-semibold text-gray-800">$${s.precio}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="border-t border-red-200 pt-3 flex justify-between items-center">
                <span class="text-gray-600 font-medium">Total a pagar:</span>
                <span class="font-bold text-red-600 text-xl">$${total.toFixed(2)}</span>
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
    timeSlotsContainer.innerHTML = `
        <div class="col-span-3 text-center text-gray-500 py-8">
            <span class="material-symbols-rounded text-4xl text-gray-300 mb-2 animate-spin">sync</span>
            <p>Cargando disponibilidad...</p>
        </div>
    `;

    const fechaSeleccionada = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;

    try {
        const response = await fetch(`http://localhost:8087/Cita/disponibilidad?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        occupiedTimes = data.horasOcupadas.map(h => h.padStart(5, "0"));

    } catch (error) {
        console.error("Error al obtener disponibilidad de citas:", error);
        timeSlotsContainer.innerHTML = `
            <div class="col-span-3 text-center text-red-500 py-8">
                <span class="material-symbols-rounded text-4xl text-red-300 mb-2">error</span>
                <p>Error al cargar horarios</p>
                <p class="text-xs text-gray-400 mt-1">Verifica que el servidor esté activo</p>
            </div>
        `;
        return;
    }

    const times = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
    timeSlotsContainer.innerHTML = "";

    // 🔥 Verificar si es el día de hoy para bloquear horarios pasados
    const ahora = new Date();
    const esHoy = selectedDate.year === ahora.getFullYear() && 
                  selectedDate.month === ahora.getMonth() && 
                  selectedDate.day === ahora.getDate();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();

    times.forEach(time => {
        const isOccupied = occupiedTimes.includes(time);
        
        // 🔥 Verificar si el horario ya pasó (solo si es hoy)
        const [horaSlot] = time.split(':').map(Number);
        const isPast = esHoy && (horaSlot < horaActual || (horaSlot === horaActual && minutosActuales > 0));

        const timeSlot = document.createElement("div");
        
        // Determinar el estado y estilo del slot
        let slotClass = '';
        let slotStatus = '';
        let isClickable = false;

        if (isPast) {
            slotClass = 'bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed';
            slotStatus = 'Pasado';
        } else if (isOccupied) {
            slotClass = 'occupied bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed';
            slotStatus = 'Ocupado';
        } else {
            slotClass = 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:border-red-400 cursor-pointer';
            slotStatus = 'Disponible';
            isClickable = true;
        }

        timeSlot.className = `time-slot text-center font-semibold transition-all ${slotClass}`;
        
        if (isClickable) {
            timeSlot.onclick = () => selectTime(time, timeSlot);
        }

        timeSlot.innerHTML = `
            <div class="text-xl font-bold">${time}</div>
            <div class="text-xs mt-1 ${isPast ? 'text-gray-300' : (isOccupied ? 'text-gray-400' : 'text-red-500')}">${slotStatus}</div>
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
        toastWarning("Por favor, selecciona al menos un servicio.");
        return;
    }
    
    if (!selectedTime) {
        toastWarning("Por favor, selecciona un horario.");
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
            toastWarning("Por favor, completa todos los campos obligatorios.");
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
        const citaResponse = await fetch('http://localhost:8087/Cita', {
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
        toastSuccess(`Servicios: ${serviciosNombres}. Horario: ${selectedTime}`, "¡Cita agendada!");
        resetearFormulario();

    } catch (error) {
        toastError("Error al agendar la cita. Por favor intenta de nuevo.");
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
        const userResponse = await fetch('http://localhost:8087/Users', {
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

        const citaResponse = await fetch('http://localhost:8087/Cita', {
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
        toastSuccess(`Servicios: ${serviciosNombres}. Horario: ${selectedTime}`, "¡Cita agendada!");
        resetearFormulario();

    } catch (error) {
        toastError("Error al agendar la cita. Por favor intenta de nuevo.");
        console.error(error);
    }
}

// 🔥 Función para guardar TODOS los servicios de la cita
async function guardarServiciosDeCita(citaId) {
    const promises = selectedServices.map(servicio => {
        return fetch('http://localhost:8087/Cita/servicios', {
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
        card.classList.remove("selected-service", "border-red-500", "bg-red-50");
        card.classList.add("border-gray-200");
    });
    
    actualizarResumenServicios();
}

// ============ MANEJO DE AUTENTICACIÓN EN NAVBAR ============
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");
    
    const btnLogin = document.getElementById("btnLogin");
    const btnMisCitas = document.getElementById("btnMisCitas");
    const btnLogout = document.getElementById("btnLogout");

    if (token) {
        // Usuario logueado
        if (btnLogin) btnLogin.classList.add("hidden");
        if (btnMisCitas) {
            btnMisCitas.classList.remove("hidden");
            btnMisCitas.classList.add("flex");
        }
        if (btnLogout) {
            btnLogout.classList.remove("hidden");
            btnLogout.classList.add("flex");
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userData");
                window.location.href = "../index.html";
            });
        }
        
        // Cargar datos del usuario automáticamente
        cargarDatosUsuario(token);
    } else {
        // Usuario NO logueado
        if (btnLogin) btnLogin.classList.remove("hidden");
        if (btnMisCitas) btnMisCitas.classList.add("hidden");
        if (btnLogout) btnLogout.classList.add("hidden");
    }
});

// ============ CARGAR DATOS DEL USUARIO LOGUEADO ============
async function cargarDatosUsuario(token) {
    try {
        // Decodificar el token para obtener el userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;
        
        if (!userId) return;
        
        // Obtener datos del usuario
        const response = await fetch('http://localhost:8087/GetUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: userId })
        });
        
        if (!response.ok) return;
        
        const userData = await response.json();
        
        if (userData) {
            // Autocompletar campos
            const nameInput = document.getElementById("nameInput");
            const apellido1Input = document.getElementById("Apellido1Input");
            const apellido2Input = document.getElementById("Apellido2Input");
            const emailInput = document.getElementById("emailInput");
            const phoneInput = document.getElementById("phoneInput");
            
            if (nameInput && userData.Nombre) {
                nameInput.value = userData.Nombre;
                nameInput.classList.add("filled");
            }
            if (apellido1Input && userData.Apellido1) {
                apellido1Input.value = userData.Apellido1;
                apellido1Input.classList.add("filled");
            }
            if (apellido2Input && userData.Apellido2) {
                apellido2Input.value = userData.Apellido2 || '';
                apellido2Input.classList.add("filled");
            }
            if (emailInput && userData.Correo) {
                emailInput.value = userData.Correo;
                emailInput.classList.add("filled");
            }
            if (phoneInput && userData.Telefono) {
                phoneInput.value = userData.Telefono;
                phoneInput.classList.add("filled");
            }
            
            // Mostrar mensaje de bienvenida
            const loggedMessage = document.getElementById("loggedUserMessage");
            const welcomeName = document.getElementById("welcomeUserName");
            const userBadge = document.getElementById("userLoggedBadge");
            
            if (loggedMessage) loggedMessage.classList.remove("hidden");
            if (welcomeName) welcomeName.textContent = userData.Nombre || "Usuario";
            if (userBadge) userBadge.classList.remove("hidden");
            
            // Validar campos autocargados
            validarTodosLosCampos();
        }
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
    }
}

// ============ VALIDACIONES DEL FORMULARIO ============
const validacionesCita = {
    nameInput: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        messages: {
            required: "El nombre es obligatorio",
            minLength: "Mínimo 2 caracteres",
            maxLength: "Máximo 50 caracteres",
            pattern: "Solo letras y espacios"
        }
    },
    Apellido1Input: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        messages: {
            required: "El primer apellido es obligatorio",
            minLength: "Mínimo 2 caracteres",
            maxLength: "Máximo 50 caracteres",
            pattern: "Solo letras y espacios"
        }
    },
    Apellido2Input: {
        required: false,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
        messages: {
            maxLength: "Máximo 50 caracteres",
            pattern: "Solo letras y espacios"
        }
    },
    emailInput: {
        required: true,
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        messages: {
            required: "El correo es obligatorio",
            pattern: "Correo electrónico inválido"
        }
    },
    phoneInput: {
        required: true,
        minLength: 10,
        maxLength: 15,
        pattern: /^[0-9]+$/,
        messages: {
            required: "El teléfono es obligatorio",
            minLength: "Mínimo 10 dígitos",
            maxLength: "Máximo 15 dígitos",
            pattern: "Solo números"
        }
    }
};

function validarCampo(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return { valid: true };
    
    const reglas = validacionesCita[inputId];
    if (!reglas) return { valid: true };
    
    const valor = input.value.trim();
    const wrapper = input.closest('.input-field-wrapper');
    const errorElement = wrapper?.querySelector('.error-msg');
    const inputField = input.closest('.input-field');
    
    // Limpiar estados previos
    inputField?.classList.remove('error', 'valid');
    if (errorElement) {
        errorElement.classList.add('hidden');
        errorElement.textContent = '';
    }
    
    // Validar required
    if (reglas.required && !valor) {
        mostrarErrorCampo(inputField, errorElement, reglas.messages.required);
        return { valid: false };
    }
    
    // Validar minLength
    if (reglas.minLength && valor && valor.length < reglas.minLength) {
        mostrarErrorCampo(inputField, errorElement, reglas.messages.minLength);
        return { valid: false };
    }
    
    // Validar maxLength
    if (reglas.maxLength && valor && valor.length > reglas.maxLength) {
        mostrarErrorCampo(inputField, errorElement, reglas.messages.maxLength);
        return { valid: false };
    }
    
    // Validar pattern
    if (reglas.pattern && valor && !reglas.pattern.test(valor)) {
        mostrarErrorCampo(inputField, errorElement, reglas.messages.pattern);
        return { valid: false };
    }
    
    // Campo válido
    if (valor) {
        inputField?.classList.add('valid');
    }
    
    return { valid: true };
}

function mostrarErrorCampo(inputField, errorElement, mensaje) {
    inputField?.classList.add('error');
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.classList.remove('hidden');
    }
}

function validarTodosLosCampos() {
    let todosValidos = true;
    
    Object.keys(validacionesCita).forEach(inputId => {
        const resultado = validarCampo(inputId);
        if (!resultado.valid) {
            todosValidos = false;
        }
    });
    
    return todosValidos;
}

// Agregar eventos de validación en tiempo real
document.addEventListener("DOMContentLoaded", () => {
    Object.keys(validacionesCita).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Validar al salir del campo
            input.addEventListener('blur', () => validarCampo(inputId));
            
            // Validar mientras escribe (con delay)
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (input.value.trim()) {
                        validarCampo(inputId);
                    }
                }, 500);
            });
        }
    });
    
    // Solo números en teléfono
    const phoneInput = document.getElementById("phoneInput");
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
});

// ============ ACTUALIZAR RESUMEN ANTES DE AGENDAR ============
function actualizarResumenCita() {
    const summaryDiv = document.getElementById("bookingSummary");
    const summaryFecha = document.getElementById("summaryFecha");
    const summaryHora = document.getElementById("summaryHora");
    const summaryServicios = document.getElementById("summaryServicios");
    
    if (!summaryDiv) return;
    
    const tieneServicios = selectedServices.length > 0;
    const tieneHora = selectedTime !== null;
    const tieneFecha = selectedDate !== null;
    
    if (tieneServicios && tieneHora && tieneFecha) {
        summaryDiv.classList.remove("hidden");
        
        // Fecha
        const fechaFormateada = `${selectedDate.day} de ${months[selectedDate.month]} de ${selectedDate.year}`;
        if (summaryFecha) summaryFecha.textContent = fechaFormateada;
        
        // Hora
        if (summaryHora) summaryHora.textContent = selectedTime;
        
        // Servicios
        const nombresServicios = selectedServices.map(s => s.nombre).join(", ");
        if (summaryServicios) summaryServicios.textContent = nombresServicios;
    } else {
        summaryDiv.classList.add("hidden");
    }
}

// Modificar la función selectTime para actualizar el resumen
const originalSelectTime = window.selectTime || function() {};
window.selectTime = function(time, element) {
    document.querySelectorAll(".time-slot").forEach(slot => {
        slot.classList.remove("selected");
    });
    element.classList.add("selected");
    selectedTime = time;
    console.log("Horario seleccionado:", selectedTime);
    actualizarResumenCita();
};

// Modificar toggleService para actualizar el resumen
const originalToggleService = window.toggleService || toggleService;
window.toggleService = function(id, nombre, precio, element) {
    const index = selectedServices.findIndex(s => s.id === id);
    
    if (index > -1) {
        selectedServices.splice(index, 1);
        element.classList.remove("selected-service", "border-red-500", "bg-red-50");
        element.classList.add("border-gray-200");
    } else {
        selectedServices.push({ id, nombre, precio });
        element.classList.add("selected-service", "border-red-500", "bg-red-50");
        element.classList.remove("border-gray-200");
    }
    
    console.log("Servicios seleccionados:", selectedServices);
    actualizarResumenServicios();
    actualizarResumenCita();
};

// ============ MODIFICAR bookAppointment PARA INCLUIR VALIDACIONES ============
const originalBookAppointment = window.bookAppointment;
window.bookAppointment = async function() {
    const errorGeneral = document.getElementById("formErrorGeneral");
    const btnAgendar = document.getElementById("btnAgendarCita");
    
    // Ocultar error previo
    errorGeneral?.classList.add("hidden");
    
    // Validar servicios seleccionados
    if (selectedServices.length === 0) {
        toastWarning("Por favor, selecciona al menos un servicio.");
        return;
    }
    
    // Validar horario seleccionado
    if (!selectedTime) {
        toastWarning("Por favor, selecciona un horario.");
        return;
    }
    
    // Validar formulario
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // Solo validar si no hay token (usuario no logueado)
        const formularioValido = validarTodosLosCampos();
        
        if (!formularioValido) {
            errorGeneral?.classList.remove("hidden");
            const primerError = document.querySelector('.input-field.error input');
            primerError?.focus();
            return;
        }
    }
    
    // Cambiar estado del botón
    if (btnAgendar) {
        btnAgendar.disabled = true;
        btnAgendar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Agendando...';
    }
    
    // Continuar con el proceso original
    const horaInicio = selectedTime;
    const horaFin = parseInt(horaInicio.split(":")[0]) + 1;
    const fecha = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    
    try {
        if (token) {
            await agendarCitaConToken(token, fecha, horaInicio, horaFin);
        } else {
            const nombre = document.getElementById("nameInput").value.trim();
            const apellido1 = document.getElementById("Apellido1Input").value.trim();
            const apellido2 = document.getElementById("Apellido2Input").value.trim();
            const email = document.getElementById("emailInput").value.trim();
            const telefono = document.getElementById("phoneInput").value.trim();
            
            await agendarCitaSinToken(nombre, apellido1, apellido2, email, telefono, fecha, horaInicio, horaFin);
        }
    } catch (error) {
        console.error(error);
        toastError("Error al agendar la cita. Por favor intenta de nuevo.");
    } finally {
        if (btnAgendar) {
            btnAgendar.disabled = false;
            btnAgendar.innerHTML = '<span class="material-symbols-rounded">calendar_month</span> Agendar Cita';
        }
    }
};

// ============ INICIALIZAR ============
loadServices();
renderCalendar();
selectDate(date.getDate(), date.getMonth(), date.getFullYear());