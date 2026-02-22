const table = document.getElementById("financeTable");
const form = document.getElementById("financeForm");

let financeData = [];
let editingFinanceId = null;
let currentType = "Revenue";


function openFinanceModal() { form.classList.add("open"); }
function closeFinanceModal() { form.classList.remove("open"); }

document.getElementById("addRevenueBtn").onclick = () => {
  currentType = "Revenue";
  formTitle.textContent = "Add Revenue";
  openFinanceModal();
};

document.getElementById("addExpenseBtn").onclick = () => {
  currentType = "Expense";
  formTitle.textContent = "Add Expense";
  openFinanceModal();
};

document.getElementById("closeFinanceModal").onclick = closeFinanceModal;
document.getElementById("closeFinanceModal2").onclick = closeFinanceModal;
form.addEventListener("click", e => { if (e.target === form) closeFinanceModal(); });


saveFinance.onclick = async () => {
  const date = fDate.value;
  const amount = fAmount.value;
  const description = fDesc.value;

  if (!amount) return alert("Enter amount");

  if (editingFinanceId) {
    await fetch(`http://localhost:5000/api/finance/${editingFinanceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: currentType,
        amount,
        date,
        description,
      }),
    });
    editingFinanceId = null;
  } else {
    await fetch("http://localhost:5000/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: currentType,
        amount,
        date,
        description,
      }),
    });
  }

  closeFinanceModal();
  loadFinance();
};


function editFinance(id) {
  const f = financeData.find((x) => x.id === id);

  fDate.value = f.date?.slice(0, 10);
  fAmount.value = f.amount;
  fDesc.value = f.description;

  currentType = f.type;
  editingFinanceId = id;

  formTitle.textContent = "Edit " + f.type;
  openFinanceModal();
}


async function deleteFinance(id) {
  if (!confirm("Delete entry?")) return;

  await fetch(`http://localhost:5000/api/finance/${id}`, {
    method: "DELETE",
  });

  loadFinance();
}


function updateKPIs(data) {
  let revenue = 0;
  let expense = 0;

  data.forEach((t) => {
    if (t.type === "Revenue") revenue += Number(t.amount);
    if (t.type === "Expense") expense += Number(t.amount);
  });

  document.getElementById("totalRevenue").textContent = "₹" + revenue.toLocaleString();
  const expEl = document.getElementById("totalExpense");
  if (expEl) expEl.textContent = "₹" + expense.toLocaleString();
  document.getElementById("netProfit").textContent = "₹" + (revenue - expense).toLocaleString();
  document.getElementById("monthlyBurn").textContent = "₹" + expense.toLocaleString();

  drawChart(revenue, expense);
}

let chart;

const percentLabelPlugin = {
  id: "percentLabels",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);
    if (!total) return;
    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((arc, i) => {
      const val = dataset.data[i];
      if (val === 0) return;
      const pct = ((val / total) * 100).toFixed(1) + "%";
      const { x, y } = arc.tooltipPosition();
      ctx.save();
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(pct, x + 1, y + 1);
      ctx.fillStyle = "#fff";
      ctx.fillText(pct, x, y);
      ctx.restore();
    });
  }
};

function drawChart(revenue, expense) {
  const ctx = document.getElementById("financeChart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Revenue", "Expense"],
      datasets: [{
        data: [revenue, expense],
        backgroundColor: ["#6366f1", "#ef4444"],
        borderColor: "rgba(0,0,0,0.3)",
        borderWidth: 2,
      }],
    },
    options: {
      plugins: { legend: { labels: { color: "#94a3b8" } } },
      cutout: "55%"
    },
    plugins: [percentLabelPlugin]
  });
}

let currentFinancePage=1;
let pageSize = 5;
let filteredData = [];

async function loadFinance() {
  const res = await fetch("http://localhost:5000/api/finance");
  const data = await res.json();
  financeData = data;
  filteredData = data;
  currentFinancePage = 1;
  renderTable();
  updateKPIs(data);
}

function renderTable() {
  table.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  if (currentFinancePage > totalPages) currentFinancePage = totalPages;

  const start = (currentFinancePage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  pageData.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-name">${new Date(t.date).toLocaleDateString()}</td>
      <td>${t.type}</td>
      <td class="${t.type === 'Revenue' ? 'text-green' : 'text-red'}">₹${Number(t.amount).toLocaleString()}</td>
      <td>${t.description || ""}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editFinance(${t.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteFinance(${t.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;
    table.appendChild(tr);
  });

  const end = Math.min(start + pageSize, filteredData.length);
  document.getElementById("pageInfo").textContent =
    filteredData.length === 0 ? "No entries" : `${start + 1}–${end} of ${filteredData.length}`;

  document.getElementById("prevPage").disabled = currentFinancePage <= 1;
  document.getElementById("nextPage").disabled = currentFinancePage >= totalPages;

  const pnEl = document.getElementById("pageNumbers");
  pnEl.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentFinancePage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => { currentFinancePage = i; renderTable(); };
    pnEl.appendChild(btn);
  }
}

function changePage(dir) {
  currentFinancePage += dir;
  renderTable();
}

function changePageSize(val) {
  pageSize = parseInt(val);
  currentFinancePage = 1;
  renderTable();
}

financeSearch.oninput = () => {
  const q = financeSearch.value.toLowerCase();
  filteredData = financeData.filter(t =>
    (t.type || "").toLowerCase().includes(q) ||
    (t.description || "").toLowerCase().includes(q) ||
    (t.amount + "").includes(q) ||
    new Date(t.date).toLocaleDateString().includes(q)
  );
  currentFinancePage = 1;
  renderTable();
};

loadFinance();
