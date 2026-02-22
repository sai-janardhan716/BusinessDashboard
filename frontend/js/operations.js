const table = document.getElementById("opTable");
const form = document.getElementById("opForm");

const addOpBtn = document.getElementById("addOpBtn");
const saveOp = document.getElementById("saveOp");

const opSearch = document.getElementById("opSearch");
const catFilter = document.getElementById("catFilter");
const statusFilter = document.getElementById("statusFilter");

const oName = document.getElementById("oName");
const oCat = document.getElementById("oCat");
const oStatus = document.getElementById("oStatus");
const oOwner = document.getElementById("oOwner");

let opData = [];
let editingId = null;

function openOpModal() { form.classList.add("open"); }
function closeOpModal() { form.classList.remove("open"); }
document.getElementById("closeOpModal").onclick = closeOpModal;
document.getElementById("closeOpModal2").onclick = closeOpModal;
form.addEventListener("click", e => { if (e.target === form) closeOpModal(); });


addOpBtn.onclick = () => {
  editingId = null;
  openOpModal();
};


saveOp.onclick = async () => {
  const item_name = oName.value;
  const category = oCat.value;
  const status = oStatus.value;
  const owner = oOwner.value;

  if (!item_name) return alert("Enter item");

  if (editingId) {
    await fetch(`http://localhost:5000/api/operations/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name, category, status, owner }),
    });
    editingId = null;
  } else {
    await fetch("http://localhost:5000/api/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name, category, status, owner }),
    });
  }

  closeOpModal();
  loadOps();
};


function editOp(id) {
  const o = opData.find((x) => x.id === id);

  oName.value = o.item_name;
  oCat.value = o.category;
  oStatus.value = o.status;
  oOwner.value = o.owner;

  editingId = id;
  openOpModal();
}


async function deleteOp(id) {
  if (!confirm("Delete item?")) return;

  await fetch(`http://localhost:5000/api/operations/${id}`, {
    method: "DELETE",
  });

  loadOps();
}


async function loadOps() {
  const res = await fetch("http://localhost:5000/api/operations");
  const data = await res.json();

  opData = data;
  renderTable(data);
}


function renderTable(data) {
  table.innerHTML = "";

  data.forEach((o) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="td-name">${o.item_name}</td>
      <td>${o.category}</td>
      <td><span class="badge ${o.status === 'Active' ? 'badge-green' : o.status === 'Inactive' ? 'badge-gray' : 'badge-amber'}">${o.status}</span></td>
      <td>${o.owner || ""}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editOp(${o.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteOp(${o.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;

    table.appendChild(tr);
  });
}


opSearch.oninput = applyFilters;
catFilter.onchange = applyFilters;
statusFilter.onchange = applyFilters;

function applyFilters() {
  const q = opSearch.value.toLowerCase();
  const cat = catFilter.value;
  const stat = statusFilter.value;

  const filtered = opData.filter(
    (o) =>
      o.item_name.toLowerCase().includes(q) &&
      (cat === "" || o.category === cat) &&
      (stat === "" || o.status === stat),
  );

  renderTable(filtered);
}


loadOps();
