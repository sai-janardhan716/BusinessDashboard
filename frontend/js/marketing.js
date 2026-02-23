const table = document.getElementById("marketingTable");
const form = document.getElementById("campForm");

const addCampBtn = document.getElementById("addCampBtn");
const saveCamp = document.getElementById("saveCamp");
const campSearch = document.getElementById("campSearch");

const mName = document.getElementById("mName");
const mChannel = document.getElementById("mChannel");
const mSpend = document.getElementById("mSpend");
const mLeads = document.getElementById("mLeads");
const mConv = document.getElementById("mConv");
const mDate = document.getElementById("mDate");

let campData = [];
let editingId = null;


function openCampModal() { form.classList.add("open"); }
function closeCampModal() { form.classList.remove("open"); }
document.getElementById("closeCampModal").onclick = closeCampModal;
document.getElementById("closeCampModal2").onclick = closeCampModal;
form.addEventListener("click", e => { if (e.target === form) closeCampModal(); });


addCampBtn.onclick = () => {
  editingId = null;
  openCampModal();
};



saveCamp.onclick = async () => {
  const campaign_name = mName.value;
  const channel = mChannel.value;
  const spend = mSpend.value;
  const leads = mLeads.value;
  const conversions = mConv.value;
  const start_date = mDate.value;

  if (!campaign_name) return alert("Enter campaign name");

  if (editingId) {
    await fetch(`http://localhost:5000/api/marketing/${editingId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        campaign_name, channel, spend, leads, conversions, start_date
      })
    });
    editingId = null;
  } else {
    await fetch("http://localhost:5000/api/marketing", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        campaign_name, channel, spend, leads, conversions, start_date
      })
    });
  }

  closeCampModal();
  loadCampaigns();
};



function editCamp(id) {
  const c = campData.find(x => x.id === id);

  mName.value = c.campaign_name;
  mChannel.value = c.channel;
  mSpend.value = c.spend;
  mLeads.value = c.leads;
  mConv.value = c.conversions;
  mDate.value = c.start_date?.slice(0, 10);

  editingId = id;
  openCampModal();
}



async function deleteCamp(id) {
  if (!confirm("Delete campaign?")) return;

  await fetch(`http://localhost:5000/api/marketing/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  loadCampaigns();
}



async function loadCampaigns() {
  const res = await fetch("http://localhost:5000/api/marketing", {
    headers: getAuthHeaders(),
  });
  const data = await res.json();

  campData = data;
  renderTable(data);
  updateMarketingKPIs(data);
}

function updateMarketingKPIs(data) {
  let totalSpend = 0;
  let totalLeads = 0;
  let totalConv = 0;

  data.forEach(c => {
    totalSpend += Number(c.spend || 0);
    totalLeads += Number(c.leads || 0);
    totalConv += Number(c.conversions || 0);
  });

  document.getElementById("totalCamps").textContent = data.length;
  document.getElementById("totalLeads").textContent = totalLeads.toLocaleString();
  document.getElementById("totalConversions").textContent = totalConv.toLocaleString();
  document.getElementById("totalSpend").textContent = "₹" + totalSpend.toLocaleString();
}



function renderTable(data) {
  table.innerHTML = "";

  data.forEach(c => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="td-name">${c.campaign_name}</td>
      <td>${c.channel}</td>
      <td class="text-red">₹${Number(c.spend).toLocaleString()}</td>
      <td>${c.leads}</td>
      <td>${c.conversions}</td>
      <td>${new Date(c.start_date).toLocaleDateString()}</td>
      <td style="display:flex;gap:6px;">
        <button onclick="editCamp(${c.id})" class="btn btn-sm btn-ghost">Edit</button>
        <button onclick="deleteCamp(${c.id})" class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;

    table.appendChild(tr);
  });
}



campSearch.oninput = () => {
  const q = campSearch.value.toLowerCase();

  const filtered = campData.filter(c =>
    c.campaign_name.toLowerCase().includes(q) ||
    c.channel.toLowerCase().includes(q)
  );

  renderTable(filtered);
};



loadCampaigns();