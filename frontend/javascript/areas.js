document.addEventListener("DOMContentLoaded", () => {
  cargarAreas();
});

async function cargarAreas() {
  try {
    const res = await fetch("http://127.0.0.1:8000/areas/resumen");

    if (!res.ok) throw new Error("Error al cargar áreas");

    const json = await res.json();

    const areas = json.data;  // <-- aquí está la clave
    const container = document.getElementById("areasContainer");

    container.innerHTML = "";

    if (!areas || areas.length === 0) {
      container.innerHTML = `<p>No hay áreas registradas.</p>`;
      return;
    }

    areas.forEach((area) => {
      const card = crearCardArea(area);
      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
  }
}

function crearCardArea(area) {
  const card = document.createElement("div");
  card.className = "area-card";

  card.innerHTML = `
    <div class="area-top">
      <div class="area-img" aria-hidden="true"></div>

      <div class="area-info">
        <h3 class="area-title">${area.area}</h3>
        <p class="area-subtitle">${area.completadas}/${area.total_cedulas} Cédulas</p>
      </div>
    </div>

    <div class="progress-container" aria-label="Progreso">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${area.porcentaje}%;"></div>
      </div>
    </div>

    <div class="area-actions">
      <button class="btn-info" type="button">
        Más info <span class="dots">•••</span>
      </button>

      <button class="btn-continue" type="button" data-area="${area.codigo}">
        Continuar <span class="arrow">›</span>
      </button>
    </div>

    <hr class="divider">

    <p class="area-date">
      Disponible hasta el ${area.fecha_limite}
    </p>
  `;

  card.querySelector(".btn-continue").addEventListener("click", () => {
    window.location.href = `criteriosAreas.html?area=${area.codigo}`;
  });

  return card;
}
