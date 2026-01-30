document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const modal = document.getElementById("errorModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  const userInput = document.querySelector('input[type="text"]');
  const passInput = document.querySelector('input[type="password"]');

  loginBtn.addEventListener("click", login);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      login();
    }
  });

  async function login() {
    const user = userInput.value.trim();
    const pass = passInput.value.trim();

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
          password: pass,
        }),
      });

      if (!res.ok) {
        openModal("Usuario o contraseña incorrectos");
        return;
      }

      const data = await res.json();

      sessionStorage.clear();

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("usuario", user);
      window.location.replace("areas.html");
    } catch (error) {
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
