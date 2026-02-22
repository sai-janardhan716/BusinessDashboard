// Auth guard
const userData = localStorage.getItem("user");
if (!userData) {
  // Allow re-routing relative to where we are
  const isInPages = window.location.pathname.includes("/pages/");
  window.location.href = isInPages ? "login.html" : "pages/login.html";
}

const user = JSON.parse(userData);

// Set company name in sidebar brand (falls back to "StartupOps")
const companyName = user.company_name || "StartupOps";
document.querySelectorAll(".brand-name, .brand").forEach(el => {
  el.textContent = companyName;
});

// Populate user info
document.querySelector(".user-name-display").textContent = user.name || "User";
document.querySelector(".user-role-display").textContent = user.role || "";
document.querySelector(".user-avatar").textContent = (user.name || "?").charAt(0).toUpperCase();

// Icon map
const iconMap = {
  "Dashboard":  "bx-home-alt-2",
  "Overview":   "bx-layout",
  "Finance":    "bx-line-chart",
  "HR":         "bx-group",
  "Marketing":  "bx-broadcast",
  "Sales":      "bx-trending-up",
  "Product":    "bx-chip",
  "Compliance": "bx-shield-check",
  "Operations": "bx-cog",
  "Investors":  "bx-dollar-circle",
  "Logout":     "bx-log-out-circle"
};

// Role-based nav
const navMap = {
  "Founder": [
    { name: "Dashboard",  link: "dashboard.html" },
    { name: "Finance",    link: "finance.html" },
    { name: "HR",         link: "hr.html" },
    { name: "Sales",      link: "sales.html" },
    { name: "Marketing",  link: "marketing.html" },
    { name: "Product",    link: "product.html" },
    { name: "Compliance", link: "compliance.html" },
    { name: "Operations", link: "operations.html" },
    { name: "Investors",  link: "investors.html" }
  ],
  "Finance":    [{ name: "Finance", link: "finance.html" }, { name: "Investors", link: "investors.html" }],
  "HR":         [{ name: "HR", link: "hr.html" }],
  "Marketing":  [{ name: "Marketing", link: "marketing.html" }],
  "Sales":      [{ name: "Sales", link: "sales.html" }],
  "Tech":       [{ name: "Product", link: "product.html" }],
  "Compliance": [{ name: "Compliance", link: "compliance.html" }]
};

const items = navMap[user.role] || [];
const menu  = document.getElementById("sidebarMenu");

// Highlight active page
const currentPage = window.location.pathname.split("/").pop();

items.forEach(item => {
  const a = document.createElement("a");
  a.href = item.link;
  a.className = "nav-item" + (item.link === currentPage ? " active" : "");
  a.innerHTML = `<i class='bx ${iconMap[item.name] || "bx-circle"}'></i>${item.name}`;
  menu.appendChild(a);
});

// Logout
const sep = document.createElement("div");
sep.style.cssText = "margin-top:auto;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);";
menu.appendChild(sep);

const logout = document.createElement("a");
logout.href = "#";
logout.className = "nav-item";
logout.innerHTML = `<i class='bx bx-log-out-circle'></i>Sign Out`;
logout.style.color = "var(--accent-red)";
logout.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "login.html";
});
menu.appendChild(logout);