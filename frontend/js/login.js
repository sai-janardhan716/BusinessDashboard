const API = "http://localhost:5000/api/auth";
const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");
const submitBtn = document.getElementById("loginBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.innerText = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.innerText = data.message || "Login failed.";
      return;
    }

    // ── Officer must reset password first ──────────────────────────────────
    if (data.requiresReset) {
      sessionStorage.setItem("reset_email", email);
      window.location.href = "reset-password.html";
      return;
    }

    // ── Normal login: store token and redirect ─────────────────────────────
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    errorEl.innerText = "Network error. Is the backend running?";
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  }
});