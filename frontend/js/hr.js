
const table = document.getElementById("hrTable");
const form = document.getElementById("empForm");
const empSearch = document.getElementById("empSearch");

const addEmpBtn = document.getElementById("addEmpBtn");
const saveEmp = document.getElementById("saveEmp");

const eName = document.getElementById("eName");
const eEmail = document.getElementById("eEmail");
const eRole = document.getElementById("eRole");
const eDept = document.getElementById("eDept");
const eJoined = document.getElementById("eJoined");

let empData = [];
let editingEmpId = null;


function openEmpModal() { form.classList.add("open"); }
function closeEmpModal() { form.classList.remove("open"); }

addEmpBtn.onclick = () => { openEmpModal(); };
document.getElementById("closeEmpModal").onclick = closeEmpModal;
document.getElementById("closeEmpModal2").onclick = closeEmpModal;
form.addEventListener("click", e => { if (e.target === form) closeEmpModal(); });


saveEmp.onclick = async () => {
  const name = eName.value;
  const email = eEmail.value;
  const role = eRole.value;
  const department = eDept.value;
  const joined = eJoined.value;

  if (!name) return alert("Enter name");

  if (editingEmpId) {
    await fetch(`http://localhost:5000/api/employees/${editingEmpId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, department, joined }),
    });
    editingEmpId = null;
  } else {
    await fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, department, joined }),
    });
  }

  closeEmpModal();
  loadEmployees();
};


function editEmp(id) {
  const e = empData.find((x) => x.id === id);

  eName.value = e.name;
  eEmail.value = e.email;
  eRole.value = e.role;
  eDept.value = e.department;
  eJoined.value = e.joined?.slice(0, 10);

  openEmpModal();
}


async function deleteEmp(id) {
  if (!confirm("Delete employee?")) return;

  await fetch(`http://localhost:5000/api/employees/${id}`, {
    method: "DELETE",
  });

  loadEmployees();
}


async function loadEmployees() {
  const res = await fetch("http://localhost:5000/api/employees");
  const data = await res.json();

  empData = data;
  table.innerHTML = "";

  data.forEach((e) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="td-name">${e.name}</td>
      <td>${e.email}</td>
      <td>${e.department}</td>
      <td>${e.role}</td>
      <td>${new Date(e.joined).toLocaleDateString()}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editEmp(${e.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteEmp(${e.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;

    table.appendChild(tr);
  });
}


empSearch.oninput = () => {
  const q = empSearch.value.toLowerCase();

  document.querySelectorAll("#hrTable tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
  });
};


loadEmployees();
