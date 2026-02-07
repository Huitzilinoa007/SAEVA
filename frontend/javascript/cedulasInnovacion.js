let cedulasOriginales = [];
let mostrandoCompletas = false;
let idAreaGlobal = null;

document.addEventListener("DOMContentLoaded", () => {
  const raw = sessionStorage.getItem("cedulaInnovacion");

  if (!raw) {
    window.location.replace("areas.html");
    return;
  }

  const session = JSON.parse(raw);
  const idAreaGlobal = Number(session.areaId);
  const nombreArea = session.nombreArea;

  if (!idAreaGlobal) {
    window.location.replace("areas.html");
    return;
  }

  const toggleBtn = document.getElementById("toggleEstadoBtn");

  toggleBtn.addEventListener("click", () => {
    mostrandoCompletas = !mostrandoCompletas;

    toggleBtn.innerHTML = mostrandoCompletas
      ? `Completadas <span class="toggle-icon">⇄</span>`
      : `Por completar <span class="toggle-icon">⇄</span>`;
    cargarCedulas(idAreaGlobal, nombreArea);
  });

  cargarCedulas(idAreaGlobal, nombreArea);
});

async function cargarCedulas(idArea, nombreArea) {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/cedulas/cedulasArea/${idArea}`,
    );

    if (!res.ok) throw new Error("Error al cargar cédulas");

    const json = await res.json();
    document.getElementById("title").innerText = nombreArea;

    cedulasOriginales = json.cedulas;
    renderCedulas(nombreArea);
  } catch (error) {
    console.error(error);
  }
}

function renderCedulas(nombreArea) {
  const container = document.getElementById("cedulasContainer");
  container.innerHTML = "";

  console.table(
    cedulasOriginales.map((c) => ({
      id: c.id,
      nombre: c.estandar_nombre,
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
    container.appendChild(crearCardCedula(cedula, nombreArea));
  });
}

function crearCardCedula(cedula, nombreArea) {
  const card = document.createElement("div");
  card.className = "area-card";

  const porcentaje = calcularProgresoPorEstado(cedula.estado);
  const textoProgreso = textoProgresoPorEstado(cedula.estado);
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

        <h3 class="area-title">${cedula.estandar_nombre}</h3>
        <p class="area-subtitle">
          ${cedula.criterio_nombre || "Sin criterio disponible"}
        </p>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-text">
        ${porcentaje}% · ${textoProgreso}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${porcentaje}%;"></div>
      </div>
    </div>

    <div class="area-actions">
      <button class="btn-continue">
        ${completa ? "Ver" : "Continuar"} <span class="arrow">›</span>
      </button>
    </div>
  `;

  card.querySelector(".btn-continue").addEventListener("click", () => {
    sessionStorage.setItem(
      "cedulaSession",
      JSON.stringify({
        tipo: "cedulaInnovacionInfo",
        cedulaId: cedula.id,
        nombreArea: nombreArea,
      }),
    );

    if (completa) {
      window.location.href = "informacionCedula.html";
    } else {
      abrirModalCedulaIncompleta();
    }
  });

  return card;
}

function calcularProgresoPorEstado(estado = 0) {
  const mapa = {
    0: 0,
    1: 25,
    2: 50,
    3: 75,
    4: 100,
  };

  return mapa[Number(estado)] ?? 0;
}

function textoProgresoPorEstado(estado = 0) {
  const textos = {
    0: "Sin iniciar",
    1: "Datos capturados",
    2: "Información revisada",
    3: "Valoración agregada",
    4: "Cédula completada",
  };

  return textos[Number(estado)] ?? "Sin estado";
}
function esCedulaCompleta(c) {
  return Number(c.estado) === 4;
}

const modal = document.getElementById("modalCedulaIncompleta");
const cerrarModalBtn = document.getElementById("cerrarModal");

function abrirModalCedulaIncompleta() {
  modal.classList.remove("hidden");
}

cerrarModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});
