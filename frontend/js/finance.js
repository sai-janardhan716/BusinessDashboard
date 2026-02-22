const table = document.getElementById("financeTable");
const form = document.getElementById("financeForm");

let financeData = [];
let editingFinanceId = null;
let currentType = "Revenue";

// OPEN FORM
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

// SAVE
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

// EDIT
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

// DELETE
async function deleteFinance(id) {
  if (!confirm("Delete entry?")) return;

  await fetch(`http://localhost:5000/api/finance/${id}`, {
    method: "DELETE",
  });

  loadFinance();
}

// LOAD
async function loadFinance() {
  const res = await fetch("http://localhost:5000/api/finance");
  const data = await res.json();

  financeData = data;

  table.innerHTML = "";

  data.forEach((t) => {
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

  updateKPIs(data);
}

// KPIs
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

// CHART
let chart;
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
        borderWidth: 0,
      }],
    },
    options: {
      plugins: { legend: { labels: { color: "#94a3b8" } } },
      cutout: "65%"
    }
  });
}

// SEARCH
financeSearch.oninput = () => {
  const q = financeSearch.value.toLowerCase();

  document.querySelectorAll("#financeTable tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
  });
};

loadFinance();
