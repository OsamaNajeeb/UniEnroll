document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("username", username); // Save for later use
          alert("Login successful!");
          window.location.href = "registration.html";
        } else {
          alert("Login failed: " + data.error);
        }
      } catch (err) {
        alert("Network error: " + err.message);
      }
    });
});
