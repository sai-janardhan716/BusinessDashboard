async function loadFounder() {
  try {
    const [
      finance,
      employees,
      sales,
      marketing,
      product,
      compliance,
      operations
    ] = await Promise.all([
      fetchJSON("/api/finance"),
      fetchJSON("/api/employees"),
      fetchJSON("/api/sales"),
      fetchJSON("/api/marketing"),
      fetchJSON("/api/product"),
      fetchJSON("/api/compliance"),
      fetchJSON("/api/operations")
    ]);

    computeFinance(finance);
    computeHR(employees);
    computeSales(sales);
    computeMarketing(marketing);
    computeProduct(product);
    computeCompliance(compliance);
    computeOperations(operations);

  } catch (e) {
    console.error("Founder load error", e);
  }
}

async function fetchJSON(url) {
  const r = await fetch("http://localhost:5000" + url);
  return r.json();
}

function money(v) {
  return "₹" + Number(v || 0).toLocaleString();
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function computeFinance(finance) {
  let revenue = 0;
  let expense = 0;

  const monthlyRev = Array(12).fill(0);
  const monthlyExp = Array(12).fill(0);

  finance.forEach(t => {
    const m = new Date(t.date).getMonth();
    const amt = Number(t.amount || 0);

    if (t.type === "Revenue") {
      revenue += amt;
      monthlyRev[m] += amt;
    }
    if (t.type === "Expense") {
      expense += amt;
      monthlyExp[m] += amt;
    }
  });

  const profit = revenue - expense;
  const burn = expense / 12;
  const runway = burn ? (revenue / burn).toFixed(1) : 0;

  set("fRevenue", money(revenue));
  set("fExpense", money(expense));
  set("fProfit", money(profit));
  set("fBurn", money(Math.round(burn)));
  set("fRunway", runway);

  drawFinanceChart(monthlyRev, monthlyExp);
}
function computeHR(employees) {
  set("fEmployees", employees.length);

  const dept = {};
  employees.forEach(e => {
    const d = e.department || "Other";
    dept[d] = (dept[d] || 0) + 1;
  });

  drawEmpChart(dept);

  const re = document.getElementById("recentEmployees");
  if (re) {
    re.innerHTML = "";
    employees.slice(0,5).forEach(e=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${e.name}</td><td>${e.department}</td>`;
      re.appendChild(tr);
    });
  }
}
function computeSales(sales) {
  let pipeline = 0;
  let won = 0;
  const clients = new Set();
  const status = {};

  sales.forEach(d => {
    const val = Number(d.deal_value || 0);
    pipeline += val;
    clients.add(d.client_name);

    if ((d.status || "").toLowerCase() === "won") won += val;

    const s = d.status || "Unknown";
    status[s] = (status[s] || 0) + 1;
  });

  set("fPipeline", money(pipeline));
  set("fWon", money(won));
  set("fClients", clients.size);

  drawSalesChart(status);
}
function computeMarketing(marketing) {
  let spend = 0;
  let leads = 0;
  let conv = 0;
  const channel = {};

  marketing.forEach(c => {
    spend += Number(c.spend || 0);
    leads += Number(c.leads || 0);
    conv += Number(c.conversions || 0);

    const ch = c.channel || "Other";
    channel[ch] = (channel[ch] || 0) + Number(c.leads || 0);
  });

  const cr = leads ? ((conv / leads) * 100).toFixed(1) : 0;

  set("fMSpend", money(spend));
  set("fLeads", leads);
  set("fConversions", conv);
  set("fCR", cr + "%");

  drawMarketingChart(channel);
}
function computeProduct(product) {
  let features=0, bugs=0;
  let done=0, inprog=0, planned=0;

  product.forEach(p=>{
    if(p.type==="Feature") features++;
    if(p.type==="Bug") bugs++;

    if(p.status==="Done") done++;
    if(p.status==="In Progress") inprog++;
    if(p.status==="Planned") planned++;
  });

  const total = done+inprog+planned;
  const donePct = total ? ((done/total)*100).toFixed(1) : 0;

  set("fFeatures",features);
  set("fBugs",bugs);
  set("fInProg",inprog);
  set("fPlanned",planned);
  set("fDonePct",donePct+"%");

  drawProductChart(done,inprog,planned);
}
function computeCompliance(data){
  let pending=0, filed=0, expired=0;

  data.forEach(c=>{
    if(c.status==="Pending") pending++;
    if(c.status==="Filed") filed++;
    if(c.status==="Expired") expired++;
  });

  set("fCompTotal",data.length);
  set("fCompPending",pending);
  set("fCompFiled",filed);
  set("fCompExpired",expired);

  drawComplianceChart(pending,filed,expired);
}
function computeOperations(data){
  let active=0,pending=0,inactive=0;

  data.forEach(o=>{
    if(o.status==="Active") active++;
    if(o.status==="Pending") pending++;
    if(o.status==="Inactive") inactive++;
  });

  set("fOpsTotal",data.length);
  set("fOpsActive",active);
  set("fOpsPending",pending);
  set("fOpsInactive",inactive);

  drawOperationsChart(active,pending,inactive);
}

let financeChart, empChart, salesChart, marketingChart, productChart, complianceChart, operationsChart;

function drawFinanceChart(rev,exp){
  const ctx=document.getElementById("revExpChart");
  if(!ctx) return;
  if(financeChart) financeChart.destroy();

  financeChart=new Chart(ctx,{
    type:"line",
    data:{
      labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets:[
        {label:"Revenue",data:rev,borderColor:"#4f46e5",fill:true,tension:.4},
        {label:"Expense",data:exp,borderColor:"#ef4444",fill:true,tension:.4}
      ]
    }
  });
}

function drawEmpChart(d){
  const ctx=document.getElementById("empChart");
  if(!ctx) return;
  if(empChart) empChart.destroy();
  empChart=new Chart(ctx,{type:"doughnut",data:{labels:Object.keys(d),datasets:[{data:Object.values(d)}]}});
}

function drawSalesChart(s){
  const ctx=document.getElementById("salesChart");
  if(!ctx) return;
  if(salesChart) salesChart.destroy();
  salesChart=new Chart(ctx,{type:"doughnut",data:{labels:Object.keys(s),datasets:[{data:Object.values(s)}]}});
}

function drawMarketingChart(c){
  const ctx=document.getElementById("marketingChart");
  if(!ctx) return;
  if(marketingChart) marketingChart.destroy();
  marketingChart=new Chart(ctx,{type:"bar",data:{labels:Object.keys(c),datasets:[{data:Object.values(c)}]}});
}

function drawProductChart(d,i,p){
  const ctx=document.getElementById("productChart");
  if(!ctx) return;
  if(productChart) productChart.destroy();
  productChart=new Chart(ctx,{type:"doughnut",data:{labels:["Done","In Progress","Planned"],datasets:[{data:[d,i,p]}]}});
}

function drawComplianceChart(p,f,e){
  const ctx=document.getElementById("complianceChart");
  if(!ctx) return;
  if(complianceChart) complianceChart.destroy();
  complianceChart=new Chart(ctx,{type:"doughnut",data:{labels:["Pending","Filed","Expired"],datasets:[{data:[p,f,e]}]}});
}

function drawOperationsChart(a,p,i){
  const ctx=document.getElementById("operationsChart");
  if(!ctx) return;
  if(operationsChart) operationsChart.destroy();
  operationsChart=new Chart(ctx,{type:"doughnut",data:{labels:["Active","Pending","Inactive"],datasets:[{data:[a,p,i]}]}});
}

loadFounder();