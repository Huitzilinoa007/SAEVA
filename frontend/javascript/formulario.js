document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = sessionStorage.getItem("formularioSession");

  if (!sessionRaw) {
    alert("Sesión no encontrada");
    window.location.replace("cedulasAreas.html");
    return;
  }

  const session = JSON.parse(sessionRaw);

  if (!session.formularioId || isNaN(session.formularioId)) {
    alert("Cédula inválida");
    window.location.replace("cedulasAreas.html");
    return;
  }

  cargarCedula(Number(session.formularioId));
  inicializarAcordeones();
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
  console.log("📡 Cargando cédula ID:", cedulaId);

  try {
    const res = await fetch(`http://127.0.0.1:8000/cedulas/${cedulaId}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("📦 DATA BACKEND:", data);

    if (!data || !data.id) {
      throw new Error("La cédula no existe");
    }

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
    setValue("criterioDescripcion", data.criterio_descripcion);
  } catch (error) {
    console.error("❌ Error cargando cédula:", error);
    alert("No se pudo cargar la cédula");
  }
}

/* ===============================
    UTILIDAD
    =============================== */

function setValue(id, value) {
  const el = document.getElementById(id);

  if (!el) {
    console.warn("⚠️ Elemento no existe:", id);
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
}

document.getElementById("btnNext").addEventListener("click", async () => {
  if (currentStep === 1) {
    const nombre = document.getElementById("nombreResponsable").value.trim();
    const cargo = document.getElementById("cargoResponsable").value.trim();

    if (!nombre || !cargo) {
      alert("Debes completar el nombre y cargo del responsable");
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

      console.log("✅ Responsable guardado correctamente");
    } catch (err) {
      console.error("❌ Error guardando información:", err);
      alert("No se pudo guardar la información");
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

      console.log("✅ Responsable guardado correctamente");
    } catch (err) {
      console.error("❌ Error guardando responsable:", err);
      alert("No se pudo guardar la información");
      return;
    }
  }

  // 👉 Si todo salió bien, avanzar
  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    mostrarPaso(currentStep);
  }
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
