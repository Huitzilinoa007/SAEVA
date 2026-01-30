document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("errorModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  loginBtn.addEventListener("click", login);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });

  async function login() {
    const codigoInput = document.querySelector('input[type="text"]');
    const codigo = codigoInput.value.trim().toUpperCase();

    if (!codigo) {
      openModal("Ingresa el código del área");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/login-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });

      if (!res.ok) {
        openModal("No existe un área registrada con el código ingresado.");
        return;
      }

      const data = await res.json();

      // 🔥 LIMPIAR SESIÓN PREVIA
      sessionStorage.clear();

      // ✅ SESIÓN UNIFICADA (ESTÁNDAR)
      sessionStorage.setItem(
        "session",
        JSON.stringify({
          tipo: "area",
          area: {
            id: data.area.id,
            nombre: data.area.nombre,
            codigo: data.area.codigo,
          },
        })
      );

      window.location.replace("cedulasAreas.html");
    } catch (error) {
      console.error(error);
      openModal("Error de conexión con el servidor");
    }
  }

  function openModal(msg) {
    modal.querySelector(".modal-text").innerText = msg;
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});
