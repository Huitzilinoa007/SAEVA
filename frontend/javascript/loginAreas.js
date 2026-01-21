document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("errorModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  loginBtn.addEventListener("click", async () => {
    const codigo = document.querySelector('input[type="text"]').value.trim();

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

      // guardar sesión del área
      localStorage.setItem("area", JSON.stringify(data.area));

      window.location.replace("criteriosAreas.html");
    } catch (error) {
      openModal("Error de conexión con el servidor");
    }
  });

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
