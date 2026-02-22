const API = "http://localhost:5000/api/auth";


const savedEmail = sessionStorage.getItem("reset_email") || "";
const form = document.getElementById("resetForm");
const msgEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");


function setupEyeToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(toggleId);
  if (!input || !icon) return;
  icon.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    icon.classList.toggle("bx-hide", !isHidden);
    icon.classList.toggle("bx-show", isHidden);
  });
}
setupEyeToggle("currentPassword", "toggleCurrent");
setupEyeToggle("newPassword", "toggleNew");
setupEyeToggle("confirmPassword", "toggleConfirm");


const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");

document.getElementById("newPassword").addEventListener("input", (e) => {
  const val = e.target.value;
  const score = getStrengthScore(val);
  const configs = [
    { width: "0%", color: "#334155", label: "" },
    { width: "25%", color: "#ef4444", label: "Weak" },
    { width: "50%", color: "#f97316", label: "Fair" },
    { width: "75%", color: "#eab308", label: "Good" },
    { width: "100%", color: "#22c55e", label: "Strong" },
  ];
  const cfg = configs[score];
  strengthBar.style.width = cfg.width;
  strengthBar.style.background = cfg.color;
  strengthLabel.textContent = cfg.label;
  strengthLabel.style.color = cfg.color;
});

function getStrengthScore(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;


  const email = savedEmail || prompt("Enter your account email:");
  if (!email) return showMessage("Email is required to reset your password.", "error");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return showMessage("All fields are required.", "error");
  }
  if (newPassword.length < 8) {
    return showMessage("New password must be at least 8 characters.", "error");
  }
  if (newPassword !== confirmPassword) {
    return showMessage("New passwords do not match.", "error");
  }
  if (currentPassword === newPassword) {
    return showMessage("New password must be different from your temporary password.", "error");
  }

  setLoading(true);

  try {
    const res = await fetch(`${API}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showMessage(data.message || "Reset failed.", "error");
    }


    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    sessionStorage.removeItem("reset_email");

    showMessage("✅ Password set! Redirecting to your dashboard…", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } catch (err) {
    console.error(err);
    showMessage("Network error. Is the backend running?", "error");
  } finally {
    setLoading(false);
  }
});


function showMessage(text, type) {
  msgEl.textContent = text;
  msgEl.className = `message ${type}`;
}

function clearMessage() {
  msgEl.textContent = "";
  msgEl.className = "message";
}

function setLoading(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Setting password…`;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="bx bx-shield-check"></i> Set Password & Continue`;
  }
}
