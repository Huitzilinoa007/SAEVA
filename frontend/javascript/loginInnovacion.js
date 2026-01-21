document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("errorModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  loginBtn.addEventListener("click", async () => {
    const user = document.querySelector('input[type="text"]').value.trim();
    const pass = document.querySelector('input[type="password"]').value.trim();

    if (!user || !pass) {
      openModal("Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreUsr: user,
          password: pass
        })
      });

      if (!res.ok) {
        openModal("Usuario o contraseña incorrectos");
        return;
      }

      // login correcto
      window.location.replace("areas.html");

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
