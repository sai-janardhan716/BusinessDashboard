const table = document.getElementById("compTable");
const form = document.getElementById("compForm");

const addCompBtn = document.getElementById("addCompBtn");
const saveComp = document.getElementById("saveComp");

const compSearch = document.getElementById("compSearch");
const statusFilter = document.getElementById("statusFilter");

const cName = document.getElementById("cName");
const cType = document.getElementById("cType");
const cDue = document.getElementById("cDue");
const cStatus = document.getElementById("cStatus");

let compData = [];
let editingId = null;


function openCompModal() { form.classList.add("open"); }
function closeCompModal() { form.classList.remove("open"); }
document.getElementById("closeCompModal").onclick = closeCompModal;
document.getElementById("closeCompModal2").onclick = closeCompModal;
form.addEventListener("click", e => { if (e.target === form) closeCompModal(); });


addCompBtn.onclick = () => {
  editingId = null;
  openCompModal();
};



saveComp.onclick = async () => {
  const doc_name = cName.value;
  const type = cType.value;
  const due_date = cDue.value;
  const status = cStatus.value;

  if (!doc_name) return alert("Enter document name");

  if (editingId) {
    await fetch(`http://localhost:5000/api/compliance/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_name, type, due_date, status })
    });
    editingId = null;
  } else {
    await fetch("http://localhost:5000/api/compliance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_name, type, due_date, status })
    });
  }

  closeCompModal();
  loadCompliance();
};



function editComp(id) {
  const c = compData.find(x => x.id === id);

  cName.value = c.doc_name;
  cType.value = c.type;
  cDue.value = c.due_date?.slice(0,10);
  cStatus.value = c.status;

  editingId = id;
  openCompModal();
}



async function deleteComp(id) {
  if (!confirm("Delete document?")) return;

  await fetch(`http://localhost:5000/api/compliance/${id}`, {
    method: "DELETE"
  });

  loadCompliance();
}



let currentCompliancePage = 1;
let pageSize = 10;
let filteredData = [];

async function loadCompliance() {
  const res = await fetch("http://localhost:5000/api/compliance");
  const data = await res.json();
  compData = data;
  filteredData = data;
  currentCompliancePage = 1;
  renderTable();
  updateComplianceKPIs(data);
}

function updateComplianceKPIs(data) {
  let filed = 0, pending = 0, expired = 0;

  data.forEach(c => {
    if (c.status === "Filed") filed++;
    if (c.status === "Pending") pending++;
    if (c.status === "Expired") expired++;
  });

  document.getElementById("totalDocs").textContent = data.length;
  document.getElementById("filedDocs").textContent = filed;
  document.getElementById("pendingDocs").textContent = pending;
  document.getElementById("expiredDocs").textContent = expired;
}

function renderTable() {
  table.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  if (currentCompliancePage > totalPages) currentCompliancePage = totalPages;

  const start = (currentCompliancePage - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  pageData.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-name">${c.doc_name}</td>
      <td>${c.type}</td>
      <td>${new Date(c.due_date).toLocaleDateString()}</td>
      <td><span class="badge ${c.status === 'Filed' ? 'badge-green' : c.status === 'Expired' ? 'badge-red' : 'badge-amber'}">${c.status}</span></td>
      <td style="display:flex;gap:6px;">
        <button onclick="editComp(${c.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteComp(${c.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;
    table.appendChild(tr);
  });

  const end = Math.min(start + pageSize, filteredData.length);
  document.getElementById("pageInfo").textContent =
    filteredData.length === 0 ? "No entries" : `${start + 1}–${end} of ${filteredData.length}`;

  document.getElementById("prevPage").disabled = currentCompliancePage <= 1;
  document.getElementById("nextPage").disabled = currentCompliancePage >= totalPages;

  const pnEl = document.getElementById("pageNumbers");
  pnEl.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-btn" + (i === currentCompliancePage ? " active" : "");
    btn.textContent = i;
    btn.onclick = () => { currentCompliancePage = i; renderTable(); };
    pnEl.appendChild(btn);
  }
}

function changePage(dir) {
  currentCompliancePage += dir;
  renderTable();
}

function changePageSize(val) {
  pageSize = parseInt(val);
  currentCompliancePage = 1;
  renderTable();
}

compSearch.oninput = applyFilters;
statusFilter.onchange = applyFilters;

function applyFilters() {
  const q = compSearch.value.toLowerCase();
  const s = statusFilter.value;

  filteredData = compData.filter(c =>
    c.doc_name.toLowerCase().includes(q) &&
    (s === "" || c.status === s)
  );

  currentCompliancePage = 1;
  renderTable();
}

loadCompliance();
