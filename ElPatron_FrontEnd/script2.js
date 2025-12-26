// ===================== VARIABLES GLOBALES =====================
let todosLosServicios = [];
let categoriaActual = 'all';

// ===================== CARGAR SERVICIOS =====================
document.addEventListener("DOMContentLoaded", async function () {
    const servicesGrid = document.getElementById("services-grid");
    
    try {
        // Obtener categorías
        const categoriaResponse = await fetch("http://localhost:8087/Categoria");
        if (!categoriaResponse.ok) throw new Error("Error al obtener las categorías");
        const categorias = await categoriaResponse.json();

        // Obtener servicios de cada categoría
        todosLosServicios = [];
        
        for (const categoria of categorias) {
            const serviceResponse = await fetch('http://localhost:8087/getServiceCategory', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: categoria.Id })
            });
            const servicios = await serviceResponse.json();
            
            // Agregar categoría a cada servicio
            servicios.forEach(servicio => {
                servicio.Categoria = categoria.Nombre;
                servicio.CategoriaId = categoria.Id;
                todosLosServicios.push(servicio);
            });
        }

        // Debug: mostrar servicios cargados
        console.log("✅ Servicios cargados:", todosLosServicios.length);
        console.log("📋 Categorías encontradas:", [...new Set(todosLosServicios.map(s => s.Categoria))]);
        
        // Mostrar todos los servicios
        renderizarServicios('all');
        
        // Configurar tabs
        configurarTabs();
        
        // Configurar links del dropdown
        configurarCategoryLinks();

    } catch (error) {
        console.error("Error al cargar servicios:", error);
        servicesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p class="text-gray-400">Error al cargar los servicios</p>
                <button onclick="location.reload()" class="mt-4 text-red-500 hover:text-red-400">
                    <i class="fas fa-redo mr-2"></i>Reintentar
                </button>
            </div>
        `;
    }
});

// ===================== RENDERIZAR SERVICIOS =====================

// Función para normalizar nombres de categorías (Polarizados -> Polarizado, Sonidos -> Sonido)
function normalizarCategoria(nombre) {
    if (!nombre) return '';
    const lower = nombre.toLowerCase().trim();
    // Mapeo de nombres en tabs a nombres en BD
    const mapeo = {
        'polarizados': 'polarizado',
        'sonidos': 'sonido',
        'alarmas': 'alarmas'
    };
    return mapeo[lower] || lower;
}

function renderizarServicios(categoria) {
    const servicesGrid = document.getElementById("services-grid");
    servicesGrid.innerHTML = "";
    
    let serviciosFiltrados = todosLosServicios;
    
    if (categoria !== 'all') {
        const categoriaNormalizada = normalizarCategoria(categoria);
        serviciosFiltrados = todosLosServicios.filter(s => {
            const servicioCategoria = normalizarCategoria(s.Categoria);
            return servicioCategoria === categoriaNormalizada;
        });
    }

    if (serviciosFiltrados.length === 0) {
        servicesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
                <p class="text-gray-400">No hay servicios en esta categoría</p>
            </div>
        `;
        return;
    }

    serviciosFiltrados.forEach((service, index) => {
        const card = document.createElement("div");
        card.className = "service-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10";
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Determinar el color del badge según la categoría
        const catNormalizada = normalizarCategoria(service.Categoria);
        let badgeColor = 'bg-red-600';
        let badgeIcon = 'fas fa-car-side';
        if (catNormalizada === 'alarmas') {
            badgeColor = 'bg-orange-600';
            badgeIcon = 'fas fa-bell';
        } else if (catNormalizada === 'sonido') {
            badgeColor = 'bg-purple-600';
            badgeIcon = 'fas fa-volume-up';
        } else if (catNormalizada === 'polarizado') {
            badgeColor = 'bg-red-600';
            badgeIcon = 'fas fa-car-side';
        }

        card.innerHTML = `
            <div class="relative">
                <div class="aspect-square bg-gray-700 flex items-center justify-center p-6">
                    ${service.Imagen ? 
                        `<img src="http://localhost:8087${service.Imagen}" alt="${service.Nombre}" class="w-full h-full object-contain rounded-lg bg-white p-3">` :
                        `<i class="${badgeIcon} text-6xl text-gray-500"></i>`
                    }
                </div>
                <span class="absolute top-3 right-3 ${badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <i class="${badgeIcon} text-xs"></i>
                    ${service.Categoria}
                </span>
            </div>
            <div class="p-5">
                <h3 class="text-lg font-bold text-white mb-2 line-clamp-1">${service.Nombre}</h3>
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${service.Descripcion || 'Servicio profesional de alta calidad'}</p>
                <div class="flex items-center justify-between">
                    <p class="text-red-500 text-2xl font-bold">$${service.Precio}</p>
                    <a href="Calendario/date.html" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                        <i class="fas fa-calendar-plus"></i>
                        Reservar
                    </a>
                </div>
            </div>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// ===================== CONFIGURAR TABS =====================
function configurarTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase active de todos
            tabs.forEach(t => {
                t.classList.remove('bg-red-600', 'text-white');
                t.classList.add('bg-gray-800', 'text-gray-300');
            });
            
            // Agregar clase active al tab clickeado
            tab.classList.remove('bg-gray-800', 'text-gray-300');
            tab.classList.add('bg-red-600', 'text-white');
            
            // Filtrar servicios
            const categoria = tab.dataset.tab;
            categoriaActual = categoria;
            renderizarServicios(categoria);
        });
    });
}

// ===================== CONFIGURAR LINKS DEL DROPDOWN =====================
function configurarCategoryLinks() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const categoria = link.dataset.category;
            
            // Scroll suave a la sección de categorías
            const section = document.getElementById('Categorias-section');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Esperar a que termine el scroll y luego activar el tab
            setTimeout(() => {
                // Activar el tab correspondiente
                const tabs = document.querySelectorAll('.category-tab');
                tabs.forEach(tab => {
                    tab.classList.remove('bg-red-600', 'text-white');
                    tab.classList.add('bg-gray-800', 'text-gray-300');
                    
                    if (tab.dataset.tab === categoria) {
                        tab.classList.remove('bg-gray-800', 'text-gray-300');
                        tab.classList.add('bg-red-600', 'text-white');
                    }
                });
                
                // Filtrar servicios
                categoriaActual = categoria;
                renderizarServicios(categoria);
            }, 500);
        });
    });
}

// ===================== MODAL COTIZACIÓN =====================
document.addEventListener("DOMContentLoaded", () => {
    const btnCotizar = document.getElementById("btnAbrirCotizacion");
    const modal = document.getElementById("modalCotizacion");
    const contenedorModal = document.getElementById("contenedorModal");
    const cerrarModal = document.getElementById("cerrarModal");
    const selectCategoria = document.getElementById("selectCategoria");
    const selectServicio = document.getElementById("selectServicio");
    const precioServicioDiv = document.getElementById("precioServicio");
    const form = document.getElementById("formCotizacion");
    const errorGeneral = document.getElementById("errorGeneral");

    let serviciosCargados = [];

    // ========== REGLAS DE VALIDACIÓN ==========
    const validaciones = {
        nombre: {
            required: true,
            minLength: 3,
            maxLength: 100,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            messages: {
                required: "El nombre es obligatorio",
                minLength: "El nombre debe tener al menos 3 caracteres",
                maxLength: "El nombre no puede exceder 100 caracteres",
                pattern: "El nombre solo puede contener letras y espacios"
            }
        },
        correo: {
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            messages: {
                required: "El correo es obligatorio",
                pattern: "Ingresa un correo electrónico válido"
            }
        },
        telefono: {
            required: true,
            minLength: 10,
            maxLength: 15,
            pattern: /^[0-9]+$/,
            messages: {
                required: "El teléfono es obligatorio",
                minLength: "El teléfono debe tener al menos 10 dígitos",
                maxLength: "El teléfono no puede exceder 15 dígitos",
                pattern: "El teléfono solo puede contener números"
            }
        },
        modelo: {
            required: true,
            minLength: 2,
            maxLength: 50,
            messages: {
                required: "El modelo del carro es obligatorio",
                minLength: "El modelo debe tener al menos 2 caracteres",
                maxLength: "El modelo no puede exceder 50 caracteres"
            }
        },
        categoria: {
            required: true,
            messages: {
                required: "Selecciona una categoría"
            }
        },
        servicio: {
            required: true,
            messages: {
                required: "Selecciona un servicio"
            }
        }
    };

    // ========== FUNCIÓN VALIDAR CAMPO ==========
    function validarCampo(campo, nombreCampo) {
        const reglas = validaciones[nombreCampo];
        if (!reglas) return { valid: true };

        const valor = campo.value.trim();
        const formGroup = campo.closest('.form-group');
        const errorElement = formGroup?.querySelector('.error-message');

        // Limpiar estado previo
        campo.classList.remove('border-red-500', 'border-green-500');
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
        }

        // Validar required
        if (reglas.required && !valor) {
            mostrarError(campo, errorElement, reglas.messages.required);
            return { valid: false, message: reglas.messages.required };
        }

        // Validar minLength
        if (reglas.minLength && valor.length < reglas.minLength) {
            mostrarError(campo, errorElement, reglas.messages.minLength);
            return { valid: false, message: reglas.messages.minLength };
        }

        // Validar maxLength
        if (reglas.maxLength && valor.length > reglas.maxLength) {
            mostrarError(campo, errorElement, reglas.messages.maxLength);
            return { valid: false, message: reglas.messages.maxLength };
        }

        // Validar pattern
        if (reglas.pattern && valor && !reglas.pattern.test(valor)) {
            mostrarError(campo, errorElement, reglas.messages.pattern);
            return { valid: false, message: reglas.messages.pattern };
        }

        // Campo válido
        campo.classList.add('border-green-500');
        return { valid: true };
    }

    function mostrarError(campo, errorElement, mensaje) {
        campo.classList.add('border-red-500');
        if (errorElement) {
            errorElement.textContent = mensaje;
            errorElement.classList.remove('hidden');
        }
    }

    // ========== VALIDACIÓN EN TIEMPO REAL ==========
    const camposAValidar = [
        { id: 'inputNombre', nombre: 'nombre' },
        { id: 'inputCorreo', nombre: 'correo' },
        { id: 'inputTelefono', nombre: 'telefono' },
        { id: 'inputModelo', nombre: 'modelo' },
        { id: 'selectCategoria', nombre: 'categoria' },
        { id: 'selectServicio', nombre: 'servicio' }
    ];

    camposAValidar.forEach(({ id, nombre }) => {
        const campo = document.getElementById(id);
        if (campo) {
            // Validar al salir del campo
            campo.addEventListener('blur', () => validarCampo(campo, nombre));
            
            // Validar mientras escribe (con debounce)
            let timeout;
            campo.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (campo.value.trim()) {
                        validarCampo(campo, nombre);
                    }
                }, 500);
            });

            // Para selects, validar al cambiar
            if (campo.tagName === 'SELECT') {
                campo.addEventListener('change', () => validarCampo(campo, nombre));
            }
        }
    });

    // ========== SOLO NÚMEROS EN TELÉFONO ==========
    const inputTelefono = document.getElementById('inputTelefono');
    if (inputTelefono) {
        inputTelefono.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // ========== ABRIR MODAL ==========
    if (btnCotizar) {
        btnCotizar.addEventListener("click", (e) => {
            e.preventDefault();
            modal.classList.remove("hidden");
            setTimeout(() => {
                contenedorModal.classList.remove("opacity-0", "scale-95");
                contenedorModal.classList.add("opacity-100", "scale-100");
            }, 10);
            precioServicioDiv.textContent = "";
            limpiarFormulario();
        });
    }

    // ========== CERRAR MODAL ==========
    function cerrarModalAnimado() {
        contenedorModal.classList.remove("opacity-100", "scale-100");
        contenedorModal.classList.add("opacity-0", "scale-95");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 300);
    }

    if (cerrarModal) {
        cerrarModal.addEventListener("click", cerrarModalAnimado);
    }

    if (modal) {
        modal.addEventListener("click", function (e) {
            if (!contenedorModal.contains(e.target)) {
                cerrarModalAnimado();
            }
        });
    }

    // ========== LIMPIAR FORMULARIO ==========
    function limpiarFormulario() {
        if (form) form.reset();
        if (errorGeneral) errorGeneral.classList.add('hidden');
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('border-red-500', 'border-green-500');
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });
        
        if (selectServicio) {
            selectServicio.innerHTML = '<option value="">Selecciona un servicio</option>';
        }
        if (precioServicioDiv) {
            precioServicioDiv.textContent = '';
        }
    }

    // ========== CARGAR CATEGORÍAS ==========
    if (selectCategoria) {
        fetch("http://localhost:8087/Categoria")
            .then(res => res.json())
            .then(categorias => {
                categorias.forEach(cat => {
                    const option = document.createElement("option");
                    option.value = cat.Id;
                    option.textContent = cat.Nombre;
                    selectCategoria.appendChild(option);
                });
            })
            .catch(err => console.error("Error cargando categorías:", err));

        selectCategoria.addEventListener("change", () => {
            const categoriaId = selectCategoria.value;
            
            if (!categoriaId) {
                selectServicio.innerHTML = '<option value="">Selecciona un servicio</option>';
                precioServicioDiv.textContent = "";
                return;
            }
            
            selectServicio.innerHTML = '<option value="">Cargando...</option>';
            precioServicioDiv.textContent = "";

            fetch("http://localhost:8087/getServiceCategory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: categoriaId })
            })
            .then(res => res.json())
            .then(servicios => {
                serviciosCargados = servicios;
                selectServicio.innerHTML = '<option value="">Selecciona un servicio</option>';
                servicios.forEach(serv => {
                    const option = document.createElement("option");
                    option.value = serv.Id;
                    option.textContent = serv.Nombre;
                    selectServicio.appendChild(option);
                });
            })
            .catch(err => {
                console.error("Error cargando servicios:", err);
                selectServicio.innerHTML = '<option value="">Error al cargar</option>';
            });
        });
    }

    // ========== MOSTRAR PRECIO ==========
    if (selectServicio) {
        selectServicio.addEventListener("change", () => {
            const servicioId = parseInt(selectServicio.value);
            const servicio = serviciosCargados.find(s => s.Id === servicioId);
            precioServicioDiv.textContent = servicio ? `💰 Precio estimado: $${servicio.Precio} MXN` : "";
        });
    }

    // ========== ENVIAR FORMULARIO ==========
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Validar todos los campos
            let formularioValido = true;
            
            camposAValidar.forEach(({ id, nombre }) => {
                const campo = document.getElementById(id);
                if (campo) {
                    const resultado = validarCampo(campo, nombre);
                    if (!resultado.valid) {
                        formularioValido = false;
                    }
                }
            });

            if (!formularioValido) {
                errorGeneral?.classList.remove('hidden');
                
                // Scroll al primer error
                const primerError = form.querySelector('.border-red-500');
                if (primerError) {
                    primerError.focus();
                }
                return;
            }

            // Ocultar error general
            errorGeneral?.classList.add('hidden');

            // Cambiar estado del botón
            const btnSubmit = document.getElementById('btnEnviarCotizacion');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }

            // Simular envío (aquí iría la llamada al API)
            setTimeout(() => {
                // Mostrar éxito
                toastSuccess("Pronto te contactaremos al correo y teléfono proporcionados.", "¡Cotización enviada!");
                
                cerrarModalAnimado();
                limpiarFormulario();
                
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar cotización';
                }
            }, 1500);
        });
    }
});

// ===================== AUTENTICACIÓN =====================
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
        }
        if (btnLogout) {
            btnLogout.classList.remove("hidden");
            btnLogout.classList.add("flex");
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userData");
                window.location.href = "index.html";
            });
        }
    } else {
        // Usuario NO logueado
        if (btnLogin) btnLogin.classList.remove("hidden");
        if (btnMisCitas) btnMisCitas.classList.add("hidden");
        if (btnLogout) btnLogout.classList.add("hidden");
    }
});

// ===================== SMOOTH SCROLL =====================
document.addEventListener("DOMContentLoaded", () => {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && !this.classList.contains('category-link')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
});
