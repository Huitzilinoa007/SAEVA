let usosIARestantes = null;
let cedulaId = null;
let estadoBD = null;

const btnMejorarIA = document.getElementById("btnMejorarIA");

document.addEventListener("DOMContentLoaded", () => {
  const btnMejorarIA = document.getElementById("btnMejorarIA");
  const sessionRaw = sessionStorage.getItem("formularioSession");

  if (!sessionRaw) {
    mostrarAlerta({
      tipo: "warning",
      titulo: "Fallo con la sesión",
      mensaje: "Sesión no encontrada",
    });
    window.location.replace("cedulasAreas.html");
    return;
  }

  const session = JSON.parse(sessionRaw);
  cedulaId = Number(session.formularioId);

  if (session.formularioId == null || isNaN(session.formularioId)) {
    mostrarAlerta({
      tipo: "warning",
      titulo: "Fallo con la cédula",
      mensaje: "Cédula inválida",
    });
    window.location.replace("cedulasAreas.html");
    return;
  }

  cargarCedula(Number(session.formularioId));
  inicializarAcordeones();
  fetch(`http://127.0.0.1:8000/ia/${cedulaId}/ia-usos`)
    .then((res) => res.json())
    .then((data) => {
      usosIARestantes = data.restantes;
      actualizarBotonIA();
    });
});

/* ===============================
    ACORDEONES
    =============================== */

function inicializarAcordeones() {
  document.querySelectorAll(".accordion").forEach((acc) => {
    acc.classList.remove("open"); // todos cerrados al inicio

    const header = acc.querySelector(".accordion-header");
    header.addEventListener("click", () => {
      acc.classList.toggle("open");
    });
  });
}

/* ===============================
    CARGA DE CÉDULA
    =============================== */

async function cargarCedula(cedulaId) {
  //console.log("📡 Cargando cédula ID:", cedulaId);

  try {
    const res = await fetch(`http://127.0.0.1:8000/cedulas/${cedulaId}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    //console.log("📦 DATA BACKEND:", data);

    if (!data || !data.id) {
      throw new Error("La cédula no existe");
    }

    estadoBD = data.estado;

    // INFO GENERAL
    setValue("infoGeneral", data.info_general);
    setValue("nombreResponsable", data.nombre_responsable);
    setValue("cargoResponsable", data.cargo_responsable);

    // EJE
    setValue("ejeNombre", data.eje_nombre);
    setValue("ejeDescripcion", data.eje_descripcion);

    // CATEGORÍA
    setValue("categoriaNombre", data.categoria_nombre);
    setValue("categoriaDescripcion", data.categoria_descripcion);

    // INDICADOR
    setValue("indicadorNombre", data.indicador_nombre);
    setValue("indicadorDescripcion", data.indicador_descripcion);

    // ESTÁNDAR
    setValue("estandarNombre", data.estandar_nombre);
    setValue("estandarDescripcion", data.estandar_descripcion);

    // CRITERIO
    setValue("criterioNombre", data.criterio_nombre);
    const elementoTit = document.getElementById("nameCriterio");
    elementoTit.textContent = data.criterio_nombre ?? "";
    setValue("valoraArgumentada", data.valoracion);


    //VALORACION ARGUMENTADA
    setValue("criterioDescripcion", data.criterio_descripcion);
  } catch (error) {
    mostrarAlerta({
      tipo: "warning",
      titulo: "Fallo con la cédula",
      mensaje: "No se pudo cargar la cédula",
    });
  }
}

/* ===============================
    UTILIDAD
    =============================== */

function setValue(id, value) {
  const el = document.getElementById(id);

  if (!el) {
    mostrarAlerta({
      tipo: "error",
      titulo: "Elemento no existe",
      mensaje: "Error",
    });
    return;
  }

  el.value = value ?? "";
  if (!(id == "nombreResponsable" || id == "cargoResponsable")) {
    el.readOnly = true;
    el.disabled = false;
  }
}

let currentStep = 1;
const TOTAL_STEPS = 4;

function mostrarPaso(step) {
  document.querySelectorAll(".step-content").forEach((div) => {
    div.classList.remove("active");
  });

  document.getElementById(`div_main_${step}`).classList.add("active");

  actualizarStepper(step);
  actualizarBotonSiguiente(step, estadoBD);
}

function actualizarBotonSiguiente(currentStep, estadoBD) {
  const btnNext = document.getElementById("btnNext");
  const btnPrev = document.getElementById("btnPrev");
  if (currentStep > 1) {
    btnPrev.style.visibility = "visible";
  } else {
    btnPrev.style.visibility = "hidden";
  }
  if (currentStep <= estadoBD + 1) {
    btnNext.style.display = "inline-flex";
  } else {
    btnNext.style.display = "none";
  }
}

async function refrescarEstadoDesdeBD() {
  try {
    const res = await fetch(`http://127.0.0.1:8000/cedulas/${cedulaId}`);

    if (!res.ok) throw new Error("No se pudo refrescar estado");

    const data = await res.json();

    estadoBD = data.estado;
    //console.log("🔄 Estado actualizado desde BD:", estadoBD);

    // Revalidar botón
    actualizarBotonSiguiente(currentStep, estadoBD);
  } catch (err) {
    mostrarAlerta({
      tipo: "error",
      titulo: "Error refrescando estado",
      mensaje: err,
    });
  }
}

document.getElementById("btnNext").addEventListener("click", async () => {
  if (currentStep === 1) {
    const nombre = document.getElementById("nombreResponsable").value.trim();
    const cargo = document.getElementById("cargoResponsable").value.trim();

    if (!nombre || !cargo) {
      mostrarAlerta({
        tipo: "error",
        titulo: "Error de credenciales",
        mensaje: "Debes completar el nombre y cargo del responsable",
      });
      return;
    }

    try {
      const session = JSON.parse(sessionStorage.getItem("formularioSession"));

      const res = await fetch(
        `http://127.0.0.1:8000/cedulas/${session.formularioId}/responsable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_responsable: nombre,
            cargo_responsable: cargo,
            step: 0,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Error al guardar responsable");
      }

      mostrarAlerta({
        tipo: "success",
        titulo: "Datos actualizados con éxito",
        mensaje:
          "Se guardó con éxito la información sobre nombre y cargo del responsable.",
      });
    } catch (err) {
      mostrarAlerta({
        tipo: "error",
        titulo: "Error",
        mensaje: "Ocurrió un error guardando la información, intente de nuevo.",
      });
      return;
    }
  } else if (currentStep === 2) {
    try {
      const session = JSON.parse(sessionStorage.getItem("formularioSession"));

      const res = await fetch(
        `http://127.0.0.1:8000/cedulas/${session.formularioId}/responsable`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step: 1,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Error al guardar responsable");
      }

      mostrarAlerta({
        tipo: "success",
        titulo: "Datos actualizados con éxito",
        mensaje: "Se guardó con éxito el progreso.",
      });
    } catch (err) {
      mostrarAlerta({
        tipo: "error",
        titulo: "Error",
        mensaje: "Error actualizando el progreso, intente de nuevo.",
      });
      return;
    }
  }

  if (currentStep === 3) {
    const texto = textarea.value.trim();
    const palabras = countWords(texto).length;

    if (palabras < 250) {
      mostrarAlerta({
        tipo: "error",
        titulo: "Valoración incompleta",
        mensaje:
          "La valoración argumentada debe contener al menos 250 palabras antes de continuar.",
      });
      return;
    }

    try {
      const session = JSON.parse(sessionStorage.getItem("formularioSession"));

      const res = await fetch(
        `http://127.0.0.1:8000/cedulas/${session.formularioId}/valoracion`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            valoracion: texto,
            step: 2,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Error al guardar la valoración");
      }

      mostrarAlerta({
        tipo: "success",
        titulo: "Datos guardados correctamente",
        mensaje: "Valoración guardada correctamente.",
      });
    } catch (err) {
      mostrarAlerta({
        tipo: "warning",
        titulo: "Error",
        mensaje: "No se pudo guardar la valoración argumentada.",
      });
      return;
    }
  }

  // 👉 Si todo salió bien, avanzar
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    mostrarPaso(currentStep);
  }

  // 👉 REFRESCAR estado real desde BD
  await refrescarEstadoDesdeBD();
});

document.getElementById("btnPrev").addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    mostrarPaso(currentStep);
  }
});

document.querySelectorAll(".step").forEach((stepEl) => {
  stepEl.addEventListener("click", () => {
    const step = Number(stepEl.dataset.step);
    currentStep = step;
    mostrarPaso(step);
  });
});

function actualizarStepper(step) {
  document.querySelectorAll(".step").forEach((el, index) => {
    el.classList.remove("active", "completed");

    if (index + 1 < step) el.classList.add("completed");
    if (index + 1 === step) el.classList.add("active");
  });
}

mostrarPaso(currentStep);

const textarea = document.getElementById("valoraArgumentada");
const counter = document.getElementById("charCount");
const maxWords = 300;

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

textarea.addEventListener("input", () => {
  let words = countWords(textarea.value);

  if (words.length > maxWords) {
    textarea.value = words.slice(0, maxWords).join(" ");
    words = countWords(textarea.value);
  }

  counter.textContent = `Palabras: ${words.length}`;
});

//
btnMejorarIA.addEventListener("click", async () => {
  if (!(currentStep === estadoBD + 1)) {
    mostrarAlerta({
      tipo: "warning",
      titulo: "Uso de botón de IA limitado",
      mensaje:
        "Favor de completar las secciones anteriores para hacer uso de esta función.",
    });
    return;
  }
  const texto = textarea.value.trim();
  const palabras = countWords(texto).length;

  if (palabras < 250) {
    mostrarAlerta({
      tipo: "error",
      titulo: "Falta de palabras",
      mensaje: "La valoración debe contener al menos 250 palabras.",
    });
    return;
  }

  if (usosIARestantes <= 0) {
    mostrarModalIAExterna();
    return;
  }

  btnMejorarIA.disabled = true;
  btnMejorarIA.textContent = "⏳ Analizando...";

  try {
    const res = await fetch("http://127.0.0.1:8000/ia/mejorar-redaccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texto: texto,
        cedula_id: cedulaId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Error desconocido en IA");
    }

    const data = await res.json();

    if (data.cumple === false) {
      mostrarModalFaltantes(data.faltantes);
      actualizarBotonIA();
      return;
    }

    usosIARestantes--;
    actualizarBotonIA();
    mostrarOpcionesIA(data.opciones);
  } catch (err) {
    mostrarAlerta({
      tipo: "error",
      titulo: "Error de IA",
      mensaje: err,
    });
  } finally {
    actualizarBotonIA();
  }
});

function mostrarOpcionesIA(opciones) {
  let contenedor = document.getElementById("ai-opciones");

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "ai-opciones";
    contenedor.style.marginTop = "16px";
    textarea.parentNode.appendChild(contenedor);
  }

  contenedor.innerHTML = "";

  opciones.forEach((opcion, index) => {
    const div = document.createElement("div");
    div.className = "ai-option";

    div.innerHTML = `
      <div class="ai-option-header">
        Opción ${index + 1}
      </div>
      <p>${opcion}</p>
      <button type="button">Usar esta versión</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      // Quitar selección previa
      document
        .querySelectorAll(".ai-option")
        .forEach((opt) => opt.classList.remove("selected"));

      // Marcar esta opción
      div.classList.add("selected");

      // Poner texto en textarea
      textarea.value = opcion;
      textarea.dispatchEvent(new Event("input"));
    });

    contenedor.appendChild(div);
  });
}

function mostrarModalFaltantes(faltantes) {
  const modal = document.getElementById("modalIA");
  const lista = document.getElementById("listaFaltantes");

  lista.innerHTML = "";

  faltantes.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    lista.appendChild(li);
  });

  modal.classList.remove("hidden");
  const btnCerrar = document.getElementById("cerrarModalIA");

  btnCerrar.onclick = () => {
    modal.classList.add("hidden");
  };

  document.body.classList.add("modal-open");

  btnCerrar.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}

function actualizarBotonIA() {
  if (usosIARestantes <= 0) {
    btnMejorarIA.disabled = false;
    btnMejorarIA.textContent = "🔓 Límite alcanzado. IA externa disponible";
  } else {
    btnMejorarIA.disabled = false;
    btnMejorarIA.textContent = `✨ Mejorar redacción (${usosIARestantes}/3)`;
  }
}

function mostrarModalIAExterna() {
  const modal = document.getElementById("modalIAExterna");
  const btnCerrar = document.getElementById("cerrarModalIAExterna");
  const promptContainer = document.getElementById("promptIAExterna");

  const textoUsuario = textarea.value.trim();

  const prompt = `
Actúas como evaluador académico experto del Marco General de Evaluación CIEES 2024,
participando en un ejercicio formal de AUTOEVALUACIÓN institucional.

Tu tarea es DETERMINAR si el texto proporcionado constituye una
VALORACIÓN ARGUMENTADA válida conforme al Marco General de Evaluación 2024.

Evalúa estrictamente si el texto cumple con TODOS los elementos siguientes:

1. Análisis crítico del programa educativo (no descriptivo).
2. Relación explícita o implícita con un criterio de evaluación.
3. Identificación clara de fortalezas.
4. Identificación clara de áreas de mejora.
5. Argumentación y justificación de los juicios emitidos.
6. Contextualización académica, institucional, social o disciplinar.
7. Emisión explícita de un juicio argumentado sobre el grado de cumplimiento del criterio.

INSTRUCCIONES OBLIGATORIAS:
Devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional.

Texto a evaluar:
"""
${textoUsuario}
"""
`;

  promptContainer.textContent = prompt;
  modal.classList.remove("hidden");

  btnCerrar.onclick = () => {
    modal.classList.add("hidden");
  };

  document.body.classList.add("modal-open");

  btnCerrar.onclick = () => {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  };
}

document
  .getElementById("copiarPromptIA")
  .addEventListener("click", async () => {
    const prompt = document.getElementById("promptIAExterna").textContent;
    await navigator.clipboard.writeText(prompt);
    alert("Prompt copiado al portapapeles");
  });

document.getElementById("abrirChatGPT").addEventListener("click", () => {
  const prompt = document.getElementById("promptIAExterna").textContent;
  const encoded = encodeURIComponent(prompt);
  window.open(`https://chat.openai.com/?prompt=${encoded}`, "_blank");
});

function mostrarAlerta({ tipo = "info", titulo = "", mensaje = "" }) {
  const modal = document.getElementById("appAlert");
  const icon = document.getElementById("appAlertIcon");
  const titleEl = document.getElementById("appAlertTitle");
  const msgEl = document.getElementById("appAlertMessage");
  const btnClose = document.getElementById("appAlertClose");

  const tipos = {
    error: { icon: "❌", color: "#dc2626" },
    warning: { icon: "⚠️", color: "#f59e0b" },
    info: { icon: "ℹ️", color: "#2563eb" },
    success: { icon: "✅", color: "#16a34a" },
  };

  const cfg = tipos[tipo] || tipos.info;

  icon.textContent = cfg.icon;
  icon.style.color = cfg.color;
  titleEl.textContent = titulo;
  msgEl.textContent = mensaje;

  modal.classList.remove("hidden");

  btnClose.onclick = () => {
    modal.classList.add("hidden");
  };
}
