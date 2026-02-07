document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = sessionStorage.getItem("cedulaSession");
  if (!sessionRaw) {
    location.href = "cedulasInnovacion.html";
    return;
  }

  const session = JSON.parse(sessionRaw);

  if (
    session.tipo !== "cedulaInnovacionInfo" ||
    !session.cedulaId ||
    !session.nombreArea
  ) {
    location.href = "cedulasInnovacion.html";
    return;
  }

  cargarCedula(session.cedulaId, session.nombreArea);
});

async function cargarCedula(idCedula, nombreArea) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/cedulas/${idCedula}`);
    if (!res.ok) throw new Error("Error al cargar cédula");

    const cedula = await res.json();

    document.getElementById("estadoTexto").innerText =
      cedula.estado === 4 ? "Completado" : "Pendiente";

    document.getElementById("areaNombre").innerText = nombreArea;
    document.getElementById("criterioNombre").innerText =
      cedula.criterio_nombre;

    document.getElementById("tituloCedula").innerText = cedula.estandar_nombre;

    document.getElementById("valoracionTexto").innerText =
      cedula.valoracion || "Sin valoración registrada.";

    cargarEvidencias(idCedula);
  } catch (e) {
    console.error(e);
  }
}

async function cargarEvidencias(idCedula) {
  const res = await fetch(
    `http://127.0.0.1:8000/cedulas/${idCedula}/evidencias`
  );
  const evidencias = await res.json();

  const cont = document.getElementById("evidenciasContainer");
  cont.innerHTML = "";

  evidencias.forEach((e) => {
    const nombreURL = encodeURIComponent(
      e.nombre_archivo.replace(/\s+/g, "-")
    );

    const div = document.createElement("div");
    div.className = "evidencia";
    div.innerHTML = `
      <span>${e.nombre_archivo}</span>
      <a
        href="http://127.0.0.1:8000/evidencias/${e.id}/${nombreURL}"
        class="link-guardar"
        target="_blank"
        rel="noopener"
      >
        Ver
      </a>
    `;
    cont.appendChild(div);
  });
}

document.getElementById("descargarFicha").addEventListener("click", () => {
  const sessionRaw = sessionStorage.getItem("cedulaSession");
  if (!sessionRaw) {
    location.href = "cedulasInnovacion.html";
    return;
  }

  const session = JSON.parse(sessionRaw);

  const url = `http://127.0.0.1:8000/cedulas/${session.cedulaId}/word`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `cedula_${session.cedulaId}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

