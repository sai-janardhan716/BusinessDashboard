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


  const rf = document.getElementById("recentFinance");
  if (rf) {
    rf.innerHTML = "";
    finance.slice(0, 5).forEach(t => {
      const tr = document.createElement("tr");
      const d = t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—";
      tr.innerHTML = `<td>${d}</td><td>${t.type}</td><td>${money(t.amount)}</td>`;
      rf.appendChild(tr);
    });
  }
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

  const rs = document.getElementById("recentSales");
  if (rs) {
    rs.innerHTML = "";
    sales.slice(0, 5).forEach(d => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${d.client_name}</td><td>${money(d.deal_value)}</td><td>${d.status}</td>`;
      rs.appendChild(tr);
    });
  }
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

  const rm = document.getElementById("recentMarketing");
  if (rm) {
    rm.innerHTML = "";
    marketing.slice(0, 5).forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.channel}</td><td>${c.leads}</td><td>${c.conversions}</td>`;
      rm.appendChild(tr);
    });
  }
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

  const rp = document.getElementById("recentProduct");
  if (rp) {
    rp.innerHTML = "";
    product.slice(0, 5).forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.feature_name || p.title || '—'}</td><td>${p.type}</td><td>${p.status}</td>`;
      rp.appendChild(tr);
    });
  }
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

  const rc = document.getElementById("recentCompliance");
  if (rc) {
    rc.innerHTML = "";
    data.slice(0, 5).forEach(c => {
      const tr = document.createElement("tr");
      const due = c.due_date ? new Date(c.due_date).toLocaleDateString("en-IN") : "—";
      tr.innerHTML = `<td>${c.doc_name}</td><td>${due}</td><td>${c.status}</td>`;
      rc.appendChild(tr);
    });
  }
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

  const ro = document.getElementById("recentOps");
  if (ro) {
    ro.innerHTML = "";
    data.slice(0, 5).forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${o.item_name}</td><td>${o.category}</td><td>${o.status}</td>`;
      ro.appendChild(tr);
    });
  }
}

let financeChart, empChart, salesChart, marketingChart, productChart, complianceChart, operationsChart;


const CHART_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#ec4899","#14b8a6"];


const percentLabelPlugin = {
  id: "percentLabels",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);
    if (!total) return;

    const meta = chart.getDatasetMeta(0);
    meta.data.forEach((arc, i) => {
      const val = dataset.data[i];
      const pct = ((val / total) * 100).toFixed(1) + "%";
      if (val === 0) return;


      const { x, y } = arc.tooltipPosition();

      ctx.save();
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(pct, x + 1, y + 1);

      ctx.fillStyle = "#fff";
      ctx.fillText(pct, x, y);
      ctx.restore();
    });
  }
};


const darkThemeOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { family: "Inter", size: 12 } }
    }
  }
};

function drawFinanceChart(rev,exp){
  const ctx=document.getElementById("revExpChart");
  if(!ctx) return;
  if(financeChart) financeChart.destroy();

  financeChart=new Chart(ctx,{
    type:"line",
    data:{
      labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets:[
        {label:"Revenue",data:rev,borderColor:"#6366f1",backgroundColor:"rgba(99,102,241,0.1)",fill:true,tension:.4},
        {label:"Expense",data:exp,borderColor:"#ef4444",backgroundColor:"rgba(239,68,68,0.1)",fill:true,tension:.4}
      ]
    },
    options:{
      ...darkThemeOptions,
      scales:{
        x:{ ticks:{ color:"#94a3b8" }, grid:{ color:"rgba(255,255,255,0.05)" } },
        y:{ ticks:{ color:"#94a3b8" }, grid:{ color:"rgba(255,255,255,0.05)" } }
      }
    }
  });
}

function makeDoughnut(ctx, labels, data) {
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderColor: "rgba(0,0,0,0.3)",
        borderWidth: 2
      }]
    },
    options: {
      ...darkThemeOptions,
      cutout: "55%"
    },
    plugins: [percentLabelPlugin]
  });
}

function drawEmpChart(d){
  const ctx=document.getElementById("empChart");
  if(!ctx) return;
  if(empChart) empChart.destroy();
  empChart = makeDoughnut(ctx, Object.keys(d), Object.values(d));
}

function drawSalesChart(s){
  const ctx=document.getElementById("salesChart");
  if(!ctx) return;
  if(salesChart) salesChart.destroy();
  salesChart = makeDoughnut(ctx, Object.keys(s), Object.values(s));
}

function drawMarketingChart(c){
  const ctx=document.getElementById("marketingChart");
  if(!ctx) return;
  if(marketingChart) marketingChart.destroy();
  marketingChart=new Chart(ctx,{
    type:"bar",
    data:{
      labels:Object.keys(c),
      datasets:[{
        data:Object.values(c),
        backgroundColor: CHART_COLORS.slice(0, Object.keys(c).length),
        borderRadius: 6
      }]
    },
    options:{
      ...darkThemeOptions,
      scales:{
        x:{ ticks:{ color:"#94a3b8" }, grid:{ display:false } },
        y:{ ticks:{ color:"#94a3b8" }, grid:{ color:"rgba(255,255,255,0.05)" } }
      }
    }
  });
}

function drawProductChart(d,i,p){
  const ctx=document.getElementById("productChart");
  if(!ctx) return;
  if(productChart) productChart.destroy();
  productChart = makeDoughnut(ctx, ["Done","In Progress","Planned"], [d,i,p]);
}

function drawComplianceChart(p,f,e){
  const ctx=document.getElementById("complianceChart");
  if(!ctx) return;
  if(complianceChart) complianceChart.destroy();
  complianceChart = makeDoughnut(ctx, ["Pending","Filed","Expired"], [p,f,e]);
}

function drawOperationsChart(a,p,i){
  const ctx=document.getElementById("operationsChart");
  if(!ctx) return;
  if(operationsChart) operationsChart.destroy();
  operationsChart = makeDoughnut(ctx, ["Active","Pending","Inactive"], [a,p,i]);
}

loadFounder();