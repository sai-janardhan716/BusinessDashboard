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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name, deal_value, status, close_date }),
    });
  } else {
    await fetch("http://localhost:5000/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  });

  loadDeals();
}


async function loadDeals() {
  const res = await fetch("http://localhost:5000/api/sales");
  const data = await res.json();

  deals = data;
  table.innerHTML = "";

  data.forEach((d) => {
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
}


if (dealSearch) {
  dealSearch.oninput = () => {
    const q = dealSearch.value.toLowerCase();
    document.querySelectorAll("#salesTable tr").forEach((tr) => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  };
}


loadDeals();
