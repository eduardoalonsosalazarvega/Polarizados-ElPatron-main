document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");

    // Verificar autenticación
    if (!token) {
        // La función toast puede no estar cargada aún, usar setTimeout
        setTimeout(() => toastWarning("Debes iniciar sesión para ver tus citas"), 100);
        localStorage.setItem("redirectAfterLogin", "miscitas.html");
        window.location.href = "login/login.html";
        return;
    }

    // Configurar botón de logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            window.location.href = "index.html";
        });
    }

    // Variables para el modal de reagendar
    let modalFechaSeleccionada = null;
    let modalHoraSeleccionada = null;
    let modalMesActual = new Date().getMonth();
    let modalAnioActual = new Date().getFullYear();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // Elementos del modal
    const modal = document.getElementById("modalReagendar");
    const cerrarModal = document.getElementById("cerrarModalReagendar");
    const btnCancelarReagendar = document.getElementById("btnCancelarReagendar");
    const btnConfirmarReagendar = document.getElementById("btnConfirmarReagendar");
    const prevMes = document.getElementById("prevMesModal");
    const nextMes = document.getElementById("nextMesModal");

    // Eventos del modal
    cerrarModal?.addEventListener("click", cerrarModalReagendar);
    btnCancelarReagendar?.addEventListener("click", cerrarModalReagendar);
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModalReagendar();
    });

    prevMes?.addEventListener("click", () => {
        modalMesActual--;
        if (modalMesActual < 0) {
            modalMesActual = 11;
            modalAnioActual--;
        }
        renderizarCalendarioModal();
    });

    nextMes?.addEventListener("click", () => {
        modalMesActual++;
        if (modalMesActual > 11) {
            modalMesActual = 0;
            modalAnioActual++;
        }
        renderizarCalendarioModal();
    });

    btnConfirmarReagendar?.addEventListener("click", confirmarReagendamiento);

    // Cargar citas
    cargarCitas();

    // ===================== FUNCIONES PRINCIPALES =====================

    async function cargarCitas() {
        const contenedor = document.getElementById("listaCitas");
        
        try {
            const response = await fetch("http://localhost:8087/Cita/cliente", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toastError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
                    localStorage.removeItem("authToken");
                    window.location.href = "login/login.html";
                    return;
                }
                throw new Error("Error al cargar citas");
            }

            const data = await response.json();
            const citas = data.citas || data || [];
            
            // 🔍 DEBUG: Ver qué datos están llegando
            console.log("📅 Citas recibidas del servidor:");
            citas.forEach((c, i) => {
                console.log(`Cita ${i + 1}: Fecha_Inicio = "${c.Fecha_Inicio}", Estado = "${c.Estado}"`);
            });
            
            actualizarEstadisticas(citas);
            contenedor.innerHTML = "";

            if (citas.length === 0) {
                contenedor.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-calendar-times text-3xl text-gray-400"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes citas</h3>
                        <p class="text-gray-500 mb-6">Agenda tu primera cita y comienza a disfrutar de nuestros servicios</p>
                        <a href="Calendario/date.html" class="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-medium">
                            <i class="fas fa-plus"></i>
                            Agendar mi primera cita
                        </a>
                    </div>
                `;
                return;
            }

            // Ordenar citas por fecha (más recientes primero)
            citas.sort((a, b) => new Date(b.Fecha_Inicio || b.StartDate) - new Date(a.Fecha_Inicio || a.StartDate));

            citas.forEach(cita => {
                const citaElement = crearTarjetaCita(cita);
                contenedor.appendChild(citaElement);
            });

            agregarEventos();

        } catch (error) {
            console.error("Error:", error);
            contenedor.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Error al cargar las citas</h3>
                    <p class="text-gray-500 mb-4">No pudimos conectar con el servidor</p>
                    <button onclick="location.reload()" class="text-red-600 hover:text-red-700 font-medium">
                        <i class="fas fa-redo mr-1"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    function actualizarEstadisticas(citas) {
        const total = citas.length;
        const pendientes = citas.filter(c => c.Estado === "Pendiente").length;
        const completadas = citas.filter(c => c.Estado === "Completada" || c.Estado === "Confirmada").length;

        document.getElementById("totalCitas").textContent = total;
        document.getElementById("citasPendientes").textContent = pendientes;
        document.getElementById("citasCompletadas").textContent = completadas;
    }

    // 🔥 Función para parsear fecha sin conversión de zona horaria
    function parseDateTimeLocal(dateStr) {
        if (!dateStr) return { year: 2025, month: 0, day: 1, hour: 0, minute: 0 };
        const str = String(dateStr).replace('T', ' ').replace('Z', '');
        const [datePart, timePart] = str.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = (timePart || '00:00').split(':').map(Number);
        
        // Devolver objeto con valores para evitar conversiones de zona horaria
        return { year, month: month - 1, day, hour, minute };
    }

    // 🔥 Formatear hora en formato 24h (consistente con el calendario)
    function formatHora24h(hour, minute) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    // 🔥 Formatear fecha legible
    function formatFechaLegible(parsed) {
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        const dateObj = new Date(parsed.year, parsed.month, parsed.day);
        const diaSemana = dias[dateObj.getDay()];
        const mes = meses[parsed.month];
        
        return `${diaSemana}, ${parsed.day} de ${mes} de ${parsed.year}`;
    }

    function crearTarjetaCita(cita) {
        const div = document.createElement("div");
        div.className = "border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all bg-white";
        
        // 🔥 Parsear sin conversión de zona horaria
        const fechaOriginal = cita.Fecha_Inicio || cita.StartDate;
        console.log(`🔍 Parseando fecha: "${fechaOriginal}"`);
        
        const parsed = parseDateTimeLocal(fechaOriginal);
        console.log(`📋 Resultado parseado:`, parsed);
        
        const fecha = formatFechaLegible(parsed);
        const hora = formatHora24h(parsed.hour, parsed.minute);
        console.log(`⏰ Hora formateada: ${hora}`);

        let estadoClase = '';
        let estadoIcono = '';
        switch (cita.Estado) {
            case 'Pendiente':
                estadoClase = 'bg-yellow-100 text-yellow-700';
                estadoIcono = 'fas fa-clock';
                break;
            case 'Confirmada':
                estadoClase = 'bg-blue-100 text-blue-700';
                estadoIcono = 'fas fa-check';
                break;
            case 'Completada':
                estadoClase = 'bg-green-100 text-green-700';
                estadoIcono = 'fas fa-check-double';
                break;
            case 'Cancelada':
                estadoClase = 'bg-red-100 text-red-700';
                estadoIcono = 'fas fa-times';
                break;
            default:
                estadoClase = 'bg-gray-100 text-gray-700';
                estadoIcono = 'fas fa-question';
        }

        // 🔥 Verificar si es hoy o fecha pasada
        const hoy = new Date();
        const mesesCortos = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mesCorto = mesesCortos[parsed.month];
        const esHoy = parsed.day === hoy.getDate() && parsed.month === hoy.getMonth() && parsed.year === hoy.getFullYear();
        const fechaCita = new Date(parsed.year, parsed.month, parsed.day);
        const esPasada = fechaCita < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) && !esHoy;
        const puedeModificar = cita.Estado === "Pendiente" && !esPasada;

        div.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-14 h-14 ${esHoy ? 'bg-red-100' : 'bg-gray-100'} rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                            <span class="text-xs font-semibold ${esHoy ? 'text-red-600' : 'text-gray-500'} uppercase">
                                ${mesCorto}
                            </span>
                            <span class="text-xl font-bold ${esHoy ? 'text-red-600' : 'text-gray-800'}">
                                ${parsed.day}
                            </span>
                        </div>
                        
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                ${esHoy ? '<span class="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">HOY</span>' : ''}
                                <p class="text-sm text-gray-500 capitalize">${fecha}</p>
                            </div>
                            <p class="text-lg font-semibold text-gray-800">
                                <i class="far fa-clock text-gray-400 mr-1"></i> ${hora}
                            </p>
                        </div>
                    </div>

                    <span class="${estadoClase} px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 self-start md:self-center">
                        <i class="${estadoIcono} text-xs"></i>
                        ${cita.Estado}
                    </span>
                </div>

                <!-- Botones de acción -->
                <div class="flex gap-2 pt-2 border-t border-gray-100">
                    <button 
                        class="detalles-btn flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-md"
                        data-id="${cita.Id}"
                        data-fecha="${fecha}"
                        data-horario="${hora}"
                        data-estado="${cita.Estado}">
                        <i class="fas fa-eye"></i>
                        Detalles
                    </button>
                    ${puedeModificar ? `
                        <button 
                            class="reagendar-btn flex-1 bg-white border-2 border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            data-id="${cita.Id}"
                            data-fecha="${cita.Fecha_Inicio || cita.StartDate}">
                            <i class="fas fa-calendar-alt"></i>
                            Reagendar
                        </button>
                        <button 
                            class="cancel-btn flex-1 bg-white border-2 border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all text-sm font-medium flex items-center justify-center gap-2"
                            data-id="${cita.Id}">
                            <i class="fas fa-times"></i>
                            Cancelar
                        </button>
                    ` : ""}
                </div>
            </div>
        `;

        return div;
    }

    function agregarEventos() {
        // Eventos para cancelar
        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.addEventListener("click", () => cancelarCita(btn));
        });

        // Eventos para reagendar
        document.querySelectorAll(".reagendar-btn").forEach(btn => {
            btn.addEventListener("click", () => abrirModalReagendar(btn));
        });

        // Eventos para ver detalles
        document.querySelectorAll(".detalles-btn").forEach(btn => {
            btn.addEventListener("click", () => abrirModalDetalle(btn));
        });
    }

    // ===================== MODAL DETALLE CITA =====================
    const modalDetalle = document.getElementById("modalDetalleCita");
    const cerrarModalDetalleBtn = document.getElementById("cerrarModalDetalle");
    const btnCerrarDetalle = document.getElementById("btnCerrarDetalle");

    function abrirModalDetalle(btn) {
        const id = btn.dataset.id;
        const fecha = btn.dataset.fecha;
        const horario = btn.dataset.horario;
        const estado = btn.dataset.estado;

        // Llenar datos básicos
        document.getElementById("modal-cita-numero").textContent = `#${id}`;
        document.getElementById("modal-fecha").textContent = fecha;
        document.getElementById("modal-horario").querySelector("span").textContent = horario;
        
        // Estado en header
        const estadoHeader = document.getElementById("modal-estado-header");
        estadoHeader.textContent = estado;
        estadoHeader.className = "inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ";
        switch(estado) {
            case 'Pendiente':
                estadoHeader.className += "bg-white/90 text-yellow-600";
                break;
            case 'Completada':
                estadoHeader.className += "bg-white/90 text-green-600";
                break;
            case 'Cancelada':
                estadoHeader.className += "bg-white/90 text-red-600";
                break;
            default:
                estadoHeader.className += "bg-white/90 text-blue-600";
        }
        
        // Estado en body
        const estadoBody = document.getElementById("modal-estado");
        estadoBody.textContent = estado;
        estadoBody.className = "inline-block px-3 py-1 rounded-full text-sm font-semibold ";
        switch(estado) {
            case 'Pendiente':
                estadoBody.className += "bg-yellow-100 text-yellow-700";
                break;
            case 'Completada':
                estadoBody.className += "bg-green-100 text-green-700";
                break;
            case 'Cancelada':
                estadoBody.className += "bg-red-100 text-red-700";
                break;
            default:
                estadoBody.className += "bg-blue-100 text-blue-700";
        }

        // Cargar servicios
        cargarServiciosCita(id);

        // Mostrar modal
        modalDetalle.classList.remove("hidden");
    }

    function cerrarModalDetalle() {
        modalDetalle.classList.add("hidden");
    }

    async function cargarServiciosCita(citaId) {
        const contenedor = document.getElementById("modal-servicios-lista");
        const totalElement = document.getElementById("modal-total-precio");

        contenedor.innerHTML = '<p class="text-center text-gray-400 py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Cargando servicios...</p>';
        totalElement.textContent = "$0.00";

        try {
            const response = await fetch(`http://localhost:8087/Cita/${citaId}/servicios`);
            if (!response.ok) throw new Error("Error al cargar servicios");

            const data = await response.json();
            const servicios = data.servicios || [];

            if (servicios.length === 0) {
                contenedor.innerHTML = '<p class="text-center text-gray-400 py-6"><i class="fas fa-info-circle mr-2"></i> No hay servicios registrados</p>';
                return;
            }

            let total = 0;
            contenedor.innerHTML = "";

            servicios.forEach(servicio => {
                total += parseFloat(servicio.Precio) || 0;

                // Icono según categoría
                let icono = "fa-car";
                const cat = (servicio.Categoria || "").toLowerCase();
                if (cat.includes("alarma")) icono = "fa-bell";
                else if (cat.includes("sonido") || cat.includes("audio")) icono = "fa-volume-up";
                else if (cat.includes("polarizado")) icono = "fa-car-side";

                const servicioDiv = document.createElement("div");
                servicioDiv.className = "flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 mb-2";
                servicioDiv.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                            <i class="fas ${icono}"></i>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-800 text-sm">${servicio.Nombre}</p>
                            <p class="text-xs text-gray-400">${servicio.Categoria || "Sin categoría"}</p>
                        </div>
                    </div>
                    <p class="font-bold text-red-600">$${parseFloat(servicio.Precio).toFixed(2)}</p>
                `;
                contenedor.appendChild(servicioDiv);
            });

            totalElement.textContent = `$${total.toFixed(2)}`;

        } catch (error) {
            console.error("Error al cargar servicios:", error);
            contenedor.innerHTML = '<p class="text-center text-red-400 py-4"><i class="fas fa-exclamation-triangle mr-2"></i> Error al cargar servicios</p>';
        }
    }

    // Event listeners para cerrar modal de detalles
    if (cerrarModalDetalleBtn) {
        cerrarModalDetalleBtn.addEventListener("click", cerrarModalDetalle);
    }
    if (btnCerrarDetalle) {
        btnCerrarDetalle.addEventListener("click", cerrarModalDetalle);
    }
    if (modalDetalle) {
        modalDetalle.addEventListener("click", (e) => {
            if (e.target === modalDetalle) cerrarModalDetalle();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modalDetalle.classList.contains("hidden")) {
            cerrarModalDetalle();
        }
    });

    // ===================== CANCELAR CITA =====================

    async function cancelarCita(btn) {
        const id = btn.dataset.id;

        if (!confirm("¿Estás seguro de que deseas cancelar esta cita?\n\nEsta acción no se puede deshacer.")) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';

        try {
            // Endpoint correcto: PATCH /Cita/:id/cancelar
            const response = await fetch(`http://localhost:8087/Cita/${id}/cancelar`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const body = await response.json();

            if (!response.ok) {
                toastError(body.mensaje || "Error al cancelar la cita");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
                return;
            }

            toastSuccess("Tu cita ha sido cancelada correctamente.", "Cita cancelada");
            cargarCitas();

        } catch (error) {
            console.error(error);
            toastError("Error de conexión. Por favor intenta de nuevo.");
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        }
    }

    // ===================== REAGENDAR CITA =====================

    function abrirModalReagendar(btn) {
        const citaId = btn.dataset.id;
        document.getElementById("citaIdReagendar").value = citaId;
        
        // Resetear selección
        modalFechaSeleccionada = null;
        modalHoraSeleccionada = null;
        modalMesActual = new Date().getMonth();
        modalAnioActual = new Date().getFullYear();
        
        document.getElementById("fechaSeleccionadaModal").textContent = "--";
        document.getElementById("horariosModal").innerHTML = '<p class="col-span-3 text-center text-gray-400 text-sm py-4">Selecciona una fecha</p>';
        btnConfirmarReagendar.disabled = true;
        btnConfirmarReagendar.classList.add("opacity-50", "cursor-not-allowed");
        
        renderizarCalendarioModal();
        modal.classList.remove("hidden");
    }

    function cerrarModalReagendar() {
        modal.classList.add("hidden");
        modalFechaSeleccionada = null;
        modalHoraSeleccionada = null;
    }

    function renderizarCalendarioModal() {
        const hoy = new Date();
        const primerDia = new Date(modalAnioActual, modalMesActual, 1).getDay();
        const ultimoDia = new Date(modalAnioActual, modalMesActual + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(modalAnioActual, modalMesActual, 0).getDate();

        document.getElementById("mesActualModal").textContent = `${meses[modalMesActual]} ${modalAnioActual}`;

        let html = "";

        // Días del mes anterior
        for (let i = primerDia; i > 0; i--) {
            html += `<li class="inactive text-gray-300">${ultimoDiaMesAnterior - i + 1}</li>`;
        }

        // Días del mes actual
        for (let i = 1; i <= ultimoDia; i++) {
            const fechaActual = new Date(modalAnioActual, modalMesActual, i);
            const esPasado = fechaActual < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const esSeleccionado = modalFechaSeleccionada && 
                                   modalFechaSeleccionada.getDate() === i && 
                                   modalFechaSeleccionada.getMonth() === modalMesActual &&
                                   modalFechaSeleccionada.getFullYear() === modalAnioActual;

            if (esPasado) {
                html += `<li class="past text-gray-300">${i}</li>`;
            } else {
                html += `<li class="${esSeleccionado ? 'active' : ''} hover:bg-red-100 cursor-pointer" 
                            onclick="window.seleccionarFechaModal(${i}, ${modalMesActual}, ${modalAnioActual})">${i}</li>`;
            }
        }

        // Días del mes siguiente
        const diasRestantes = 42 - (primerDia + ultimoDia);
        for (let i = 1; i <= diasRestantes; i++) {
            html += `<li class="inactive text-gray-300">${i}</li>`;
        }

        document.getElementById("diasModal").innerHTML = html;
    }

    // Función global para seleccionar fecha
    window.seleccionarFechaModal = async function(dia, mes, anio) {
        modalFechaSeleccionada = new Date(anio, mes, dia);
        modalHoraSeleccionada = null;
        
        // 🔥 Formato consistente de fecha
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const fechaStr = `${dias[modalFechaSeleccionada.getDay()]}, ${dia} de ${meses[mes]}`;
        document.getElementById("fechaSeleccionadaModal").textContent = fechaStr;
        
        renderizarCalendarioModal();
        await cargarHorariosDisponibles();
        actualizarBotonConfirmar();
    };

    async function cargarHorariosDisponibles() {
        const contenedor = document.getElementById("horariosModal");
        contenedor.innerHTML = '<p class="col-span-3 text-center text-gray-400 text-sm py-4"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando horarios...</p>';

        const fechaFormateada = `${modalFechaSeleccionada.getFullYear()}-${String(modalFechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(modalFechaSeleccionada.getDate()).padStart(2, '0')}`;

        try {
            const response = await fetch(`http://localhost:8087/Cita/disponibilidad?fecha=${fechaFormateada}`);
            const data = await response.json();
            
            const horasOcupadas = data.horasOcupadas || [];
            const todosLosHorarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
            
            // 🔥 Verificar si es el día de hoy para bloquear horarios pasados
            const ahora = new Date();
            const esHoy = modalFechaSeleccionada.getFullYear() === ahora.getFullYear() && 
                          modalFechaSeleccionada.getMonth() === ahora.getMonth() && 
                          modalFechaSeleccionada.getDate() === ahora.getDate();
            const horaActual = ahora.getHours();
            const minutosActuales = ahora.getMinutes();
            
            contenedor.innerHTML = "";
            
            todosLosHorarios.forEach(hora => {
                const ocupado = horasOcupadas.includes(hora);
                
                // 🔥 Verificar si el horario ya pasó (solo si es hoy)
                const [horaSlot] = hora.split(':').map(Number);
                const isPast = esHoy && (horaSlot < horaActual || (horaSlot === horaActual && minutosActuales > 0));
                
                const btn = document.createElement("button");
                btn.type = "button";
                
                // Determinar estado y estilo
                let btnClass = '';
                let statusText = '';
                let isClickable = false;
                
                if (isPast) {
                    btnClass = 'time-option p-3 rounded-lg border-2 text-center font-medium transition bg-gray-50 border-gray-100 cursor-not-allowed opacity-50';
                    statusText = 'Pasado';
                } else if (ocupado) {
                    btnClass = 'time-option p-3 rounded-lg border-2 text-center font-medium transition occupied border-gray-200 cursor-not-allowed';
                    statusText = 'Ocupado';
                } else {
                    btnClass = 'time-option p-3 rounded-lg border-2 text-center font-medium transition border-gray-200 hover:border-red-500 cursor-pointer';
                    statusText = 'Disponible';
                    isClickable = true;
                }
                
                btn.className = btnClass;
                btn.innerHTML = `
                    <span class="block text-lg ${isPast ? 'text-gray-300' : ''}">${hora}</span>
                    <span class="block text-xs ${isPast ? 'text-gray-300' : (ocupado ? 'text-gray-400' : 'text-gray-500')}">${statusText}</span>
                `;
                
                if (isClickable) {
                    btn.addEventListener("click", () => seleccionarHora(hora, btn));
                }
                
                contenedor.appendChild(btn);
            });

        } catch (error) {
            console.error("Error al cargar horarios:", error);
            contenedor.innerHTML = '<p class="col-span-3 text-center text-red-500 text-sm py-4"><i class="fas fa-exclamation-triangle mr-2"></i>Error al cargar horarios</p>';
        }
    }

    function seleccionarHora(hora, btn) {
        // Quitar selección anterior
        document.querySelectorAll(".time-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        modalHoraSeleccionada = hora;
        actualizarBotonConfirmar();
    }

    function actualizarBotonConfirmar() {
        const habilitado = modalFechaSeleccionada && modalHoraSeleccionada;
        btnConfirmarReagendar.disabled = !habilitado;
        
        if (habilitado) {
            btnConfirmarReagendar.classList.remove("opacity-50", "cursor-not-allowed");
        } else {
            btnConfirmarReagendar.classList.add("opacity-50", "cursor-not-allowed");
        }
    }

    async function confirmarReagendamiento() {
        if (!modalFechaSeleccionada || !modalHoraSeleccionada) {
            toastWarning("Por favor selecciona una fecha y hora");
            return;
        }

        const citaId = document.getElementById("citaIdReagendar").value;
        const fechaStr = `${modalFechaSeleccionada.getFullYear()}-${String(modalFechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(modalFechaSeleccionada.getDate()).padStart(2, '0')}`;
        const horaInicio = modalHoraSeleccionada;
        const horaFin = `${String(parseInt(horaInicio.split(':')[0]) + 1).padStart(2, '0')}:00`;

        btnConfirmarReagendar.disabled = true;
        btnConfirmarReagendar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            const response = await fetch("http://localhost:8087/Cita", {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: parseInt(citaId),
                    Fecha_Inicio: `${fechaStr} ${horaInicio}:00`,
                    Fecha_Final: `${fechaStr} ${horaFin}:00`
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || "Error al reagendar");
            }

            toastSuccess("Tu cita ha sido reagendada correctamente.", "Cita reagendada");
            cerrarModalReagendar();
            cargarCitas();

        } catch (error) {
            console.error("Error:", error);
            toastError("Error al reagendar la cita: " + error.message);
        } finally {
            btnConfirmarReagendar.disabled = false;
            btnConfirmarReagendar.innerHTML = '<i class="fas fa-check"></i> Confirmar';
        }
    }
});
