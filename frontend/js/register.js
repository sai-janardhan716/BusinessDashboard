const API = "http://localhost:5000/api/auth";

// ─── Officer role definitions (must match backend) ──────────────────────────
const OFFICER_ROLES = ["CTO", "CFO", "CMO", "CCO", "Head of Sales"];

// ─── Toggle officer fields when checkbox is checked ─────────────────────────
OFFICER_ROLES.forEach((role) => {
  const cb = document.querySelector(`.officer-cb[data-role="${role}"]`);
  const fields = document.getElementById(`fields-${role}`);
  const wrap = document.getElementById(`wrap-${role}`);

  if (!cb || !fields || !wrap) return;

  cb.addEventListener("change", () => {
    if (cb.checked) {
      fields.classList.add("visible");
      wrap.classList.add("checked");
    } else {
      fields.classList.remove("visible");
      wrap.classList.remove("checked");
      // Clear fields when unchecked
      fields.querySelectorAll("input").forEach((i) => (i.value = ""));
    }
  });
});

// ─── Form submission ─────────────────────────────────────────────────────────
const form = document.getElementById("registerForm");
const msgEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const founderName = document.getElementById("founderName").value.trim();
  const founderEmail = document.getElementById("founderEmail").value.trim();
  const password = document.getElementById("password").value;
  const companyName = document.getElementById("companyName").value.trim();
  const foundedDate = document.getElementById("foundedDate").value;

  // Basic client-side validation
  if (!founderName || !founderEmail || !password || !companyName) {
    return showMessage("Please fill in all required company and founder fields.", "error");
  }

  if (password.length < 8) {
    return showMessage("Password must be at least 8 characters.", "error");
  }

  // Collect checked officers
  const officers = [];
  OFFICER_ROLES.forEach((role) => {
    const cb = document.querySelector(`.officer-cb[data-role="${role}"]`);
    if (!cb?.checked) return;

    const name = document.getElementById(`name-${role}`)?.value.trim();
    const email = document.getElementById(`email-${role}`)?.value.trim();

    if (!name || !email) {
      // Will show per-role error below
      return;
    }
    officers.push({ title: role, name, email });
  });

  // Validate: any checked officer must have name + email
  const invalidOfficer = OFFICER_ROLES.find((role) => {
    const cb = document.querySelector(`.officer-cb[data-role="${role}"]`);
    if (!cb?.checked) return false;
    const name = document.getElementById(`name-${role}`)?.value.trim();
    const email = document.getElementById(`email-${role}`)?.value.trim();
    return !name || !email;
  });

  if (invalidOfficer) {
    return showMessage(
      `Please enter name and email for the selected ${invalidOfficer} officer.`,
      "error"
    );
  }

  setLoading(true);

  try {
    const res = await fetch(`${API}/founder-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ founderName, founderEmail, password, companyName, foundedDate, officers }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showMessage(data.message || "Registration failed.", "error");
    }

    // Count email results
    const sent = (data.emailResults || []).filter((r) => r.status === "sent").length;
    const failed = (data.emailResults || []).filter((r) => r.status === "email_failed").length;

    let detail = `${officers.length} officer(s) invited.`;
    if (sent > 0) detail += ` ${sent} email(s) sent.`;
    if (failed > 0) detail += ` ⚠️ ${failed} email(s) could not be delivered — check server email config.`;

    showMessage(`✅ Company registered! ${detail} Redirecting to login…`, "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);
  } catch (err) {
    console.error(err);
    showMessage("Network error. Is the backend running?", "error");
  } finally {
    setLoading(false);
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
    submitBtn.innerHTML = `<span class="spinner"></span> Registering…`;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="bx bx-rocket"></i> Launch StartupOps`;
  }
}
