
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://25.3.26.59:8087/Categoria");
        if (!response.ok) throw new Error("Error al obtener las categorías");

        const categorias = await response.json();
        const CategoriaSection = document.getElementById("Categorias-section");
        CategoriaSection.innerHTML = "";

        categorias.forEach(categoria => {
            const section = document.createElement("section");
            section.className = "transition-all duration-700 px-4 py-8 bg-gray-900 text-white";
            section.id = `seccion-${categoria.Nombre}`;
            CategoriaSection.appendChild(section);

            const NombreCategory = document.createElement("p");
            NombreCategory.className = "text-lg font-bold mb-4";
            NombreCategory.textContent = categoria.Nombre;
            section.appendChild(NombreCategory);

            const divservice = document.createElement("div");
            divservice.className = "flex flex-wrap gap-8 justify-start items-stretch"; // Horizontal con separación
            section.appendChild(divservice);

            const ServiceCategoryData = { id: categoria.Id };

            fetch('http://25.3.26.59:8087/getServiceCategory', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ServiceCategoryData)
            })
            .then(response => response.json())
            .then(data => {
                data.forEach(service => {
                    const divserviceget = document.createElement("div");
                    divserviceget.className = "bg-gray-800 p-5 rounded-lg shadow-lg text-center flex flex-col items-center justify-between border border-green-400";

                    // Estilos clave para tarjeta adaptable y horizontal
                    divserviceget.style.width = "260px";
                    divserviceget.style.height = "auto";
                    divserviceget.style.minHeight = "420px";
                    divserviceget.style.padding = "20px";
                    divserviceget.style.borderRadius = "12px";
                    divserviceget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
                    divserviceget.style.background = "linear-gradient(to right, #292929, #3d3d3d)";
                    divserviceget.style.border = "2px solid #4caf50";
                    divserviceget.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
                    divserviceget.style.display = "flex";
                    divserviceget.style.flexDirection = "column";
                    divserviceget.style.alignItems = "center";
                    divserviceget.style.justifyContent = "space-between";

                    // Animación hover
                    divserviceget.addEventListener("mouseover", () => {
                        divserviceget.style.transform = "scale(1.08)";
                        divserviceget.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.3)";
                    });
                    divserviceget.addEventListener("mouseout", () => {
                        divserviceget.style.transform = "scale(1)";
                        divserviceget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
                    });

                    divservice.appendChild(divserviceget);

                    const image = document.createElement("img");
                    image.src = "http://25.3.26.59:8087" + service.Imagen;
                    image.alt = service.Nombre;
                    image.style.width = "180px";
                    image.style.height = "180px";
                    image.style.objectFit = "cover";
                    image.style.borderRadius = "10px";
                    image.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
                    image.style.padding = "10px";
                    image.style.background = "#fff";
                    divserviceget.appendChild(image);

                    const h3 = document.createElement("h3");
                    h3.className = "text-lg font-bold mb-3 text-white";
                    h3.textContent = service.Nombre;
                    divserviceget.appendChild(h3);

                    const p1 = document.createElement("p");
                    p1.className = "text-sm text-gray-300 mb-3";
                    p1.textContent = service.Descripcion;
                    divserviceget.appendChild(p1);

                    const p2 = document.createElement("p");
                    p2.className = "text-green-400 text-lg font-bold";
                    p2.textContent = "$" + service.Precio;
                    divserviceget.appendChild(p2);

                    const a = document.createElement("a");
                    a.href = "/calendario/date.html";
                    a.className = "mt-auto px-5 py-3 border border-green-500 text-green-500 rounded hover:bg-green-600 hover:text-white transition inline-block text-sm shadow-md";
                    a.style.width = "90%";
                    a.style.textAlign = "center";
                    a.style.marginTop = "auto";
                    a.style.padding = "12px";
                    a.textContent = "Reservar";
                    divserviceget.appendChild(a);
                });
            });
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
});


document.addEventListener("DOMContentLoaded", () => {
  const btnCotizar = document.getElementById("btnAbrirCotizacion");
  const modal = document.getElementById("modalCotizacion");
  const contenedorModal = document.getElementById("contenedorModal");
  const cerrarModal = document.getElementById("cerrarModal");
  const selectCategoria = document.getElementById("selectCategoria");
  const selectServicio = document.getElementById("selectServicio");
  const precioServicioDiv = document.getElementById("precioServicio");
  const form = document.getElementById("formCotizacion");

  let serviciosCargados = [];

  // Animar y mostrar modal
  btnCotizar.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("hidden");
    setTimeout(() => {
      contenedorModal.classList.remove("opacity-0", "scale-95");
      contenedorModal.classList.add("opacity-100", "scale-100");
    }, 10);
    precioServicioDiv.textContent = "";
  });

  // Animar y cerrar modal
  function cerrarModalAnimado() {
    contenedorModal.classList.remove("opacity-100", "scale-100");
    contenedorModal.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  }

  cerrarModal.addEventListener("click", cerrarModalAnimado);

  modal.addEventListener("click", function (e) {
    if (!contenedorModal.contains(e.target)) {
      cerrarModalAnimado();
    }
  });

  // Cargar categorías
  fetch("http://25.3.26.59:8087/Categoria")
    .then(res => res.json())
    .then(categorias => {
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.Id;
        option.textContent = cat.Nombre;
        selectCategoria.appendChild(option);
      });
    });

  // Servicios según categoría
  selectCategoria.addEventListener("change", () => {
    const categoriaId = selectCategoria.value;
    selectServicio.innerHTML = '<option value="">Cargando...</option>';
    precioServicioDiv.textContent = "";

    fetch("http://25.3.26.59:8087/getServiceCategory", {
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
      });
  });

  // Mostrar precio
  selectServicio.addEventListener("change", () => {
    const servicioId = parseInt(selectServicio.value);
    const servicio = serviciosCargados.find(s => s.Id === servicioId);
    precioServicioDiv.textContent = servicio ? `Precio estimado (Aplica restricciones): $${servicio.Precio}` : "";
  });

  // Enviar formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Gracias por solicitar una cotización! Pronto te contactaremos.");
    cerrarModalAnimado();
    form.reset();
    precioServicioDiv.textContent = "";
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  const btnLogin = document.getElementById("btnLogin");
  const btnMisCitas = document.getElementById("btnMisCitas");
  const btnLogout = document.getElementById("btnLogout");

  if (token) {
    // Usuario logueado
    btnLogin.classList.add("hidden");
    btnMisCitas.classList.remove("hidden");
    btnLogout.classList.remove("hidden");

    btnMisCitas.addEventListener("click", () => {
      window.location.href = "/miscitas.html";
    });

    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData"); // si guardas info del usuario
      window.location.href = "/index2.html";
    });

  } else {
    // Usuario NO logueado
    btnLogin.classList.remove("hidden");
    btnMisCitas.classList.add("hidden");
    btnLogout.classList.add("hidden");
  }
});
