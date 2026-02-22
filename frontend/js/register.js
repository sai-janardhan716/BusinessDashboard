const API = "http://localhost:5000/api/auth";


const ROLE_MAP = {
  "CTO": "Tech",
  "CFO": "Finance",
  "CMO": "Marketing",
  "CCO": "Compliance",
  "Head of Sales": "Sales",
};

const OFFICER_KEYS = Object.keys(ROLE_MAP);


OFFICER_KEYS.forEach((role) => {
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
      fields.querySelectorAll("input").forEach((i) => (i.value = ""));
    }
  });
});


const form = document.getElementById("registerForm");
const msgEl = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const founder_name = document.getElementById("founderName").value.trim();
  const founder_email = document.getElementById("founderEmail").value.trim();
  const password = document.getElementById("password").value;
  const company_name = document.getElementById("companyName").value.trim();
  const founded_date = document.getElementById("foundedDate").value;


  if (!founder_name || !founder_email || !password || !company_name) {
    return showMessage("Please fill in all required company and founder fields.", "error");
  }

  if (password.length < 6) {
    return showMessage("Password must be at least 6 characters.", "error");
  }


  const invalidOfficer = OFFICER_KEYS.find((role) => {
    const cb = document.querySelector(`.officer-cb[data-role="${role}"]`);
    if (!cb?.checked) return false;
    const email = document.getElementById(`email-${role}`)?.value.trim();
    return !email;
  });

  if (invalidOfficer) {
    return showMessage(
      `Please enter an email for the selected ${invalidOfficer} officer.`,
      "error"
    );
  }


  const officers = {};
  OFFICER_KEYS.forEach((role) => {
    const cb = document.querySelector(`.officer-cb[data-role="${role}"]`);
    if (!cb?.checked) return;

    const email = document.getElementById(`email-${role}`)?.value.trim();
    if (!email) return;

    const backendRole = ROLE_MAP[role];
    officers[backendRole] = email;
  });

  setLoading(true);

  try {
    const res = await fetch(`${API}/founder-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name,
        founded_date,
        founder_name,
        founder_email,
        password,
        officers,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showMessage(data.message || "Registration failed.", "error");
    }

    const officerCount = Object.keys(officers).length;
    showMessage(
      `✅ Company registered! ${officerCount} officer(s) created. Redirecting to login…`,
      "success"
    );

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
    submitBtn.innerHTML = `<i class="bx bx-rocket"></i> Launch your Dashboard`;
  }
}
