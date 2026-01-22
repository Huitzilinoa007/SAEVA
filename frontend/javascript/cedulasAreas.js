let cedulasOriginales = [];
let mostrandoCompletas = false;
let areaCodigoGlobal = null;

document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(sessionStorage.getItem("session"));

  if (!session) {
    window.location.replace("loginAreas.html");
    return;
  }

  if (session.tipo === "area") {
    areaCodigoGlobal = session.area.codigo;
  } else if (session.tipo === "innovacion") {
    const params = new URLSearchParams(window.location.search);
    areaCodigoGlobal = params.get("area");
  }

  if (!areaCodigoGlobal) {
    window.location.replace("areas.html");
    return;
  }

  const toggleBtn = document.getElementById("toggleEstadoBtn");

  toggleBtn.addEventListener("click", () => {
    mostrandoCompletas = !mostrandoCompletas;

    toggleBtn.innerHTML = mostrandoCompletas
      ? `Completadas <span class="toggle-icon">⇄</span>`
      : `Por completar <span class="toggle-icon">⇄</span>`;

    renderCedulas();
  });

  cargarCedulas(areaCodigoGlobal);
});

async function cargarCedulas(areaCodigo) {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/fichas/codigo/${areaCodigo}`,
    );

    if (!res.ok) throw new Error("Error al cargar cédulas");

    const json = await res.json();

    document.getElementById("title").innerText = json.area;

    cedulasOriginales = json.cedulas;
    renderCedulas();
  } catch (error) {
    console.error(error);
  }
}

function renderCedulas() {
  const container = document.getElementById("cedulasContainer");
  container.innerHTML = "";

  console.table(
    cedulasOriginales.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      estado: c.estado,
      paso_actual: c.paso_actual,
      tipo_estado: typeof c.estado,
      tipo_paso: typeof c.paso_actual,
    })),
  );

  const filtradas = cedulasOriginales.filter((c) => {
    const completa = esCedulaCompleta(c);
    return mostrandoCompletas ? completa : !completa;
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
    container.appendChild(crearCardCedula(cedula));
  });
}

function crearCardCedula(cedula) {
  const card = document.createElement("div");
  card.className = "area-card";

  const porcentaje = calcularProgreso(cedula.paso_actual);
  const completa = esCedulaCompleta(cedula);

  const estadoTexto = completa ? "Completada" : "Pendiente";
  const estadoClase = completa ? "ok" : "pending";

  card.innerHTML = `
    <div class="area-top">
      <div class="area-img"></div>

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
      <button class="btn-continue">
        Continuar <span class="arrow">›</span>
      </button>
    </div>
  `;

  card.querySelector(".btn-continue").addEventListener("click", () => {
    window.location.href = `formularioInnovacion.html?area=${areaCodigoGlobal}&ficha=${cedula.id}`;
  });

  return card;
}

function calcularProgreso(pasoActual = 0) {
  const totalPasos = 4;
  return Math.round((pasoActual / totalPasos) * 100);
}

function esCedulaCompleta(c) {
  return Number(c.estado) === 1 && Number(c.paso_actual) === 4;
}
