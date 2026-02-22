const table = document.getElementById("productTable");
const form = document.getElementById("prodForm");

const addProdBtn = document.getElementById("addProdBtn");
const saveProd = document.getElementById("saveProd");

const prodSearch = document.getElementById("prodSearch");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");

const pName = document.getElementById("pName");
const pType = document.getElementById("pType");
const pStatus = document.getElementById("pStatus");
const pPriority = document.getElementById("pPriority");
const pOwner = document.getElementById("pOwner");

let prodData = [];
let editingId = null;

function openProdModal() { form.classList.add("open"); }
function closeProdModal() { form.classList.remove("open"); }
document.getElementById("closeProdModal").onclick = closeProdModal;
document.getElementById("closeProdModal2").onclick = closeProdModal;
form.addEventListener("click", e => { if (e.target === form) closeProdModal(); });


addProdBtn.onclick = () => {
  editingId = null;
  openProdModal();
};


saveProd.onclick = async () => {
  const feature_name = pName.value;
  const type = pType.value;
  const status = pStatus.value;
  const priority = pPriority.value;
  const owner = pOwner.value;

  if (!feature_name) return alert("Enter feature");

  if (editingId) {
    await fetch(`http://localhost:5000/api/product/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature_name, type, status, priority, owner }),
    });
    editingId = null;
  } else {
    await fetch("http://localhost:5000/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature_name, type, status, priority, owner }),
    });
  }

  closeProdModal();
  loadProduct();
};


function editProd(id) {
  const p = prodData.find((x) => x.id === id);

  pName.value = p.feature_name;
  pType.value = p.type;
  pStatus.value = p.status;
  pPriority.value = p.priority;
  pOwner.value = p.owner;

  editingId = id;
  openProdModal();
}


async function deleteProd(id) {
  if (!confirm("Delete item?")) return;

  await fetch(`http://localhost:5000/api/product/${id}`, {
    method: "DELETE",
  });

  loadProduct();
}


let currentProductPage = 1;
let pageSize = 5;
let filteredData = [];

async function loadProduct() {
  const res = await fetch("http://localhost:5000/api/product");
  const data = await res.json();
  prodData = data;
  filteredData = data;
  currentProductPage = 1;
  renderTable();
  updateProductKPIs(data);
}

function updateProductKPIs(data) {
  let features = 0, done = 0, inProgress = 0, bugs = 0;

  data.forEach(p => {
    features++;
    if (p.type === "Bug") bugs++;
    if (p.status === "Done") done++;
    if (p.status === "In Progress") inProgress++;
  });

  document.getElementById("totalFeatures").textContent = features;
  document.getElementById("doneProd").textContent = done;
  document.getElementById("inProgressProd").textContent = inProgress;
  document.getElementById("bugsProd").textContent = bugs;
}

function renderTable() {
  table.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  if (currentProductPage > totalPages) currentProductPage = totalPages;

  const start = (currentProductPage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  pageData.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-name">${p.feature_name}</td>
      <td><span class="badge ${p.type === 'Bug' ? 'badge-red' : 'badge-indigo'}">${p.type}</span></td>
      <td><span class="badge ${p.status === 'Done' ? 'badge-green' : p.status === 'In Progress' ? 'badge-amber' : 'badge-gray'}">${p.status}</span></td>
      <td><span class="badge ${p.priority === 'High' ? 'badge-red' : p.priority === 'Medium' ? 'badge-amber' : 'badge-gray'}">${p.priority}</span></td>
      <td>${p.owner || ""}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editProd(${p.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteProd(${p.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;
    table.appendChild(tr);
  });

  const end = Math.min(start + pageSize, filteredData.length);
  document.getElementById("pageInfo").textContent =
    filteredData.length === 0 ? "No entries" : `${start + 1}–${end} of ${filteredData.length}`;

  document.getElementById("prevPage").disabled = currentProductPage <= 1;
  document.getElementById("nextPage").disabled = currentProductPage >= totalPages;

  const pnEl = document.getElementById("pageNumbers");
  pnEl.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentProductPage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => { currentProductPage = i; renderTable(); };
    pnEl.appendChild(btn);
  }
}

function changePage(dir) {
  currentProductPage += dir;
  renderTable();
}

function changePageSize(val) {
  pageSize = parseInt(val);
  currentProductPage = 1;
  renderTable();
}

prodSearch.oninput = applyFilters;
typeFilter.onchange = applyFilters;
statusFilter.onchange = applyFilters;
priorityFilter.onchange = applyFilters;

function applyFilters() {
  const q = prodSearch.value.toLowerCase();
  const type = typeFilter.value;
  const stat = statusFilter.value;
  const prio = priorityFilter.value;

  filteredData = prodData.filter(
    (p) =>
      p.feature_name.toLowerCase().includes(q) &&
      (type === "" || p.type === type) &&
      (stat === "" || p.status === stat) &&
      (prio === "" || p.priority === prio),
  );

  currentProductPage = 1;
  renderTable();
}

loadProduct();
