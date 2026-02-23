const table = document.getElementById("salesTable");
const form = document.getElementById("dealForm");
const dealSearch = document.getElementById("dealSearch");

let deals = [];
let editingId = null;

function openDealModal() { form.classList.add("open"); }
function closeDealModal() { form.classList.remove("open"); }

document.getElementById("closeDealModal").onclick = closeDealModal;
document.getElementById("closeDealModal2").onclick = closeDealModal;
form.addEventListener("click", e => { if (e.target === form) closeDealModal(); });


const addDealBtn = document.getElementById("addDealBtn");
addDealBtn.onclick = () => {
  formTitle.textContent = "Add Deal";
  openDealModal();
  cName.value = ""; cValue.value = ""; cStatus.value = "Active"; cDate.value = "";
  editingId = null;
};


saveDeal.onclick = async () => {
  const client_name = cName.value;
  const deal_value = cValue.value;
  const status = cStatus.value;
  const close_date = cDate.value;

  if (!client_name) return alert("Enter client");

  if (editingId) {
    await fetch(`http://localhost:5000/api/sales/${editingId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ client_name, deal_value, status, close_date }),
    });
  } else {
    await fetch("http://localhost:5000/api/sales", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ client_name, deal_value, status, close_date }),
    });
  }

  closeDealModal();
  loadDeals();
};


function editDeal(id) {
  const d = deals.find((x) => x.id === id);

  cName.value = d.client_name;
  cValue.value = d.deal_value;
  cStatus.value = d.status;
  cDate.value = d.close_date?.slice(0, 10);

  editingId = id;
  formTitle.textContent = "Edit Deal";
  openDealModal();
}


async function deleteDeal(id) {
  if (!confirm("Delete deal?")) return;

  await fetch(`http://localhost:5000/api/sales/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  loadDeals();
}


let currentSalesPage = 1;
let pageSize = 10;
let filteredData = [];

async function loadDeals() {
  const res = await fetch("http://localhost:5000/api/sales", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  deals = data;
  filteredData = data;
  currentSalesPage = 1;
  renderTable();
  updateSalesKPIs(data);
}

function updateSalesKPIs(data) {
  let pipeline = 0;
  let won = 0, active = 0, lost = 0;

  data.forEach(d => {
    pipeline += Number(d.deal_value || 0);
    const s = (d.status || "").toLowerCase();
    if (s === "won") won++;
    else if (s === "lost") lost++;
    else active++;
  });

  document.getElementById("totalPipeline").textContent = "₹" + pipeline.toLocaleString();
  document.getElementById("wonDeals").textContent = won;
  document.getElementById("activeDeals").textContent = active;
  document.getElementById("lostDeals").textContent = lost;
}

function renderTable() {
  table.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  if (currentSalesPage > totalPages) currentSalesPage = totalPages;

  const start = (currentSalesPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  pageData.forEach((d) => {
    const tr = document.createElement("tr");
    const bClass = d.status === 'Won' ? 'badge badge-green' : d.status === 'Lost' ? 'badge badge-red' : 'badge badge-indigo';
    tr.innerHTML = `
      <td class="td-name">${d.client_name}</td>
      <td class="text-green">₹${Number(d.deal_value).toLocaleString()}</td>
      <td><span class="${bClass}">${d.status}</span></td>
      <td>${new Date(d.close_date).toLocaleDateString()}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editDeal(${d.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteDeal(${d.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>`;
    table.appendChild(tr);
  });

  const end = Math.min(start + pageSize, filteredData.length);
  document.getElementById("pageInfo").textContent =
    filteredData.length === 0 ? "No entries" : `${start + 1}–${end} of ${filteredData.length}`;

  document.getElementById("prevPage").disabled = currentSalesPage <= 1;
  document.getElementById("nextPage").disabled = currentSalesPage >= totalPages;

  const pnEl = document.getElementById("pageNumbers");
  pnEl.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentSalesPage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => { currentSalesPage = i; renderTable(); };
    pnEl.appendChild(btn);
  }
}

function changePage(dir) {
  currentSalesPage += dir;
  renderTable();
}

function changePageSize(val) {
  pageSize = parseInt(val);
  currentSalesPage = 1;
  renderTable();
}

if (dealSearch) {
  dealSearch.oninput = () => {
    const q = dealSearch.value.toLowerCase();
    filteredData = deals.filter(d =>
      (d.client_name || "").toLowerCase().includes(q) ||
      (d.status || "").toLowerCase().includes(q) ||
      (d.deal_value + "").includes(q)
    );
    currentSalesPage = 1;
    renderTable();
  };
}

loadDeals();
