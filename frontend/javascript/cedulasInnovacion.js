document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Validar sesión
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("loginInnovacion.html");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const areaCodigo = params.get("area");

  if (!areaCodigo) {
    window.location.replace("areas.html");
    return;
  }

  const toggleBtn = document.getElementById("toggleEstadoBtn");

  toggleBtn?.addEventListener("click", () => {
    mostrandoCompletas = !mostrandoCompletas;

    toggleBtn.innerHTML = mostrandoCompletas
      ? `Completadas <span class="toggle-icon">⇄</span>`
      : `Por completar <span class="toggle-icon">⇄</span>`;

    renderCedulas(areaCodigo);
  });

  cargarCedulas(areaCodigo);
});

async function cargarCedulas(areaCodigo) {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/fichas/codigo/${areaCodigo}`,
    );

    if (!res.ok) throw new Error("Error al cargar cédulas");

    const json = await res.json();

    // Título del área
    document.getElementById("title").innerText = json.area;

    const container = document.getElementById("cedulasContainer");
    container.innerHTML = "";

    if (!json.cedulas || json.cedulas.length === 0) {
      container.innerHTML = "<p>No hay cédulas registradas.</p>";
      return;
    }

    cedulasOriginales = json.cedulas;
    renderCedulas(areaCodigo);
  } catch (error) {
    console.error(error);
  }
}

function crearCardCedula(cedula, areaCodigo) {
  const card = document.createElement("div");
  card.className = "area-card";

  const porcentaje = calcularProgreso(cedula.paso_actual);

  let estadoTexto = "Pendiente";
  let estadoClase = "pending";

  if (porcentaje === 100) {
    estadoTexto = "Completada";
    estadoClase = "ok";
  }

  card.innerHTML = `
    <div class="area-top">
      <div class="area-img" aria-hidden="true"></div>

      <div class="area-info">
        <span class="area-tag ${estadoClase}">
          ${estadoTexto}
        </span>

        <h3 class="area-title">${cedula.nombre}</h3>

        <p class="area-subtitle">
          ${cedula.descripcion || "Sin descripción disponible"}
        </p>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-text">${porcentaje}%</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${porcentaje}%;"></div>
      </div>
    </div>

    <div class="area-actions">
      <button class="btn-continue" type="button">
        Continuar <span class="arrow">›</span>
      </button>
    </div>
  `;

  // ✅ BOTÓN CONTINUAR
  card.querySelector(".btn-continue").addEventListener("click", () => {
    window.location.href = `formularioInnovacion.html?area=${areaCodigo}&ficha=${cedula.id}`;
  });

  return card;
}

function calcularProgreso(pasoActual = 0) {
  const totalPasos = 4;
  return Math.round((pasoActual / totalPasos) * 100);
}

let cedulasOriginales = [];
let mostrandoCompletas = false;

function renderCedulas(areaCodigo) {
  const container = document.getElementById("cedulasContainer");
  container.innerHTML = "";

  const filtradas = cedulasOriginales.filter((c) => {
    const esCompleta = c.estado === 1 && c.paso_actual === 4;
    return mostrandoCompletas ? esCompleta : !esCompleta;
  });

  if (filtradas.length === 0) {
    const titulo = mostrandoCompletas
      ? "No hay cédulas completadas"
      : "No hay cédulas pendientes";

    const mensaje = mostrandoCompletas
      ? "Aún no se ha finalizado ninguna cédula en esta área."
      : "Excelente trabajo 🎉 Todas las cédulas ya fueron completadas.";

    const icono = mostrandoCompletas ? "📄" : "✅";

    container.innerHTML = `
      <div class="empty-state-wrapper">
        <div class="empty-card">
          <div class="empty-icon">${icono}</div>
          <h3>${titulo}</h3>
          <p>${mensaje}</p>
        </div>
      </div>
    `;
    return;
  }

  filtradas.forEach((cedula) => {
    container.appendChild(crearCardCedula(cedula, areaCodigo));
  });
}
