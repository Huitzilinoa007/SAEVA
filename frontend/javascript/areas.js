document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Validación de sesión
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("loginInnovacion.html");
    return;
  }

  cargarAreas();
});

async function cargarAreas() {
  try {
    // 1️⃣ Obtener todas las áreas
    const resAreas = await fetch("http://127.0.0.1:8000/areas/");
    if (!resAreas.ok) throw new Error("Error al cargar áreas");
    const areas = await resAreas.json();

    const container = document.getElementById("areasContainer");
    container.innerHTML = "";

    if (!areas || areas.length === 0) {
      container.innerHTML = "<p>No hay áreas registradas.</p>";
      return;
    }

    // 2️⃣ Para cada área, obtener sus cédulas
    for (const area of areas) {
      const resCedulas = await fetch(
        `http://127.0.0.1:8000/cedulas/area/${area.id}`,
      );
      if (!resCedulas.ok)
        throw new Error(`Error al cargar cédulas de ${area.nombre}`);

      const cedulas = await resCedulas.json();
      const total = cedulas.length;
      const completadas = cedulas.filter((c) => c.estado === 4).length; // suponiendo estado 4 = completadas
      const porcentaje =
        total > 0 ? Math.round((completadas / total) * 100) : 0;

      container.appendChild(
        crearCardArea({
          ...area,
          total_cedulas: total,
          completadas,
          porcentaje,
        }),
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function crearCardArea(area) {
  const card = document.createElement("div");
  card.className = "area-card";

  card.innerHTML = `
    <div class="area-top">
      <div class="area-img" aria-hidden="true"></div>
      <div class="area-info">
        <h3 class="area-title">${area.nombre}</h3>
        <p class="area-subtitle">
          ${area.completadas}/${area.total_cedulas} Cédulas
        </p>
      </div>
    </div>
    <div class="progress-container" aria-label="Progreso">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${area.porcentaje}%;"></div>
      </div>
    </div>
    <div class="area-actions">
      <button class="btn-continue" type="button">
        Continuar <span class="arrow">›</span>
      </button>
    </div>
  `;

  // 🔑 Guardar ID de área en sessionStorage y abrir cedulasInnovacion.html
  card.querySelector(".btn-continue").addEventListener("click", () => {
    sessionStorage.setItem(
      "cedulaInnovacion",
      JSON.stringify({ 
        areaId: area.id,
        nombreArea: area.nombre
       }),
    );
    window.location.href = `cedulasInnovacion.html`;
  });

  return card;
}
