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

// OPEN
addProdBtn.onclick = () => {
  editingId = null;
  openProdModal();
};

// SAVE
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

// EDIT
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

// DELETE
async function deleteProd(id) {
  if (!confirm("Delete item?")) return;

  await fetch(`http://localhost:5000/api/product/${id}`, {
    method: "DELETE",
  });

  loadProduct();
}

// LOAD
async function loadProduct() {
  const res = await fetch("http://localhost:5000/api/product");
  const data = await res.json();

  prodData = data;
  renderTable(data);
}

// RENDER
function renderTable(data) {
  table.innerHTML = "";

  data.forEach((p) => {
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
}

// FILTER + SEARCH
prodSearch.oninput = applyFilters;
typeFilter.onchange = applyFilters;
statusFilter.onchange = applyFilters;
priorityFilter.onchange = applyFilters;

function applyFilters() {
  const q = prodSearch.value.toLowerCase();
  const type = typeFilter.value;
  const stat = statusFilter.value;
  const prio = priorityFilter.value;

  const filtered = prodData.filter(
    (p) =>
      p.feature_name.toLowerCase().includes(q) &&
      (type === "" || p.type === type) &&
      (stat === "" || p.status === stat) &&
      (prio === "" || p.priority === prio),
  );

  renderTable(filtered);
}

// INIT
loadProduct();
