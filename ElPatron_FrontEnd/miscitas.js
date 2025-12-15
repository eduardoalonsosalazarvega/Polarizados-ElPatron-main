document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión");
        window.location.href = "/login/login.html";
        return;
    }

    cargarCitas();

    function cargarCitas() {
        fetch("http://25.3.26.59:8087/Cita/cliente", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            const citas = data.citas || [];
            const contenedor = document.getElementById("listaCitas");
            contenedor.innerHTML = "";

            if (citas.length === 0) {
                contenedor.innerHTML = `<p class="text-gray-600">No tienes citas registradas.</p>`;
                return;
            }

            citas.forEach(c => {
                const fecha = new Date(c.Fecha_Inicio).toLocaleDateString();
                const hora = new Date(c.Fecha_Inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                contenedor.innerHTML += `
                    <div class="border rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-lg font-semibold text-gray-800">${fecha}</p>
                                <p class="text-gray-500">Hora: ${hora}</p>
                                <p class="mt-1">
                                    <span class="font-semibold">Estado:</span>
                                    <span class="px-2 py-1 rounded text-white text-sm
                                        ${c.Estado === 'Pendiente' ? 'bg-yellow-500' 
                                        : c.Estado === 'Cancelada' ? 'bg-red-600'
                                        : 'bg-green-600'}">
                                        ${c.Estado}
                                    </span>
                                </p>
                            </div>

                            ${c.Estado === "Pendiente" ? `
                                <button 
                                    class="cancel-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                    data-id="${c.Id}">
                                    Cancelar
                                </button>
                            ` : ""}
                        </div>
                    </div>
                `;
            });

            agregarEventosCancelacion();
        })
        .catch(err => console.error(err));
    }

    function agregarEventosCancelacion() {
        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;

                if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;

                fetch(`http://25.3.26.59:8087/Cita/cancelar/${id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                })
                .then(async res => {
                    const body = await res.json();

                    if (!res.ok) {
                        alert(body.mensaje || "Error al cancelar la cita");
                        return;
                    }

                    alert("Cita cancelada correctamente");
                    cargarCitas();
                })
                .catch(err => console.error(err));
            });
        });
    }
});
