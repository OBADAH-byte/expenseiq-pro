if (!requireAuth()) throw new Error('Not authenticated');
const user = getUser();
document.getElementById('user-name').textContent = user?.name || 'User';
document.getElementById('user-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();
document.getElementById('report-month').value = new Date().getMonth() + 1;
document.getElementById('report-year').value = new Date().getFullYear();
function logout() { clearAuth(); window.location.href = '/login.html'; }

const COLORS = { Food:'#ef4444', Transport:'#f59e0b', Shopping:'#6366f1', Entertainment:'#8b5cf6', Health:'#22c55e', Bills:'#0ea5e9', Education:'#ec4899', Travel:'#14b8a6', Other:'#64748b' };
let reportData = { expenses: [], stats: null };

async function loadReport() {
  const month = parseInt(document.getElementById('report-month').value);
  const year = parseInt(document.getElementById('report-year').value);
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  try {
    const [expData, statsData] = await Promise.all([API.expenses.getAll({ startDate, endDate, limit: 500 }), API.expenses.getStats()]);
    reportData = { expenses: expData.expenses, stats: statsData.stats };
    const monthExpenses = expData.expenses;
    const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const catTotals = {};
    monthExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
    const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];
    const currency = user?.currency || 'USD';
    document.getElementById('report-content').innerHTML = `
      <div class="grid grid-3 animate-fade" style="margin-bottom:20px;">
        <div class="stat-card"><div class="stat-icon" style="background:rgba(99,102,241,0.15)">💳</div><div class="stat-value">${formatCurrency(totalSpent,currency)}</div><div class="stat-label">Total Spending</div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(239,68,68,0.15)">📊</div><div class="stat-value">${topCat ? topCat[0] : 'N/A'}</div><div class="stat-label">Largest Category</div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(34,197,94,0.15)">📝</div><div class="stat-value">${monthExpenses.length}</div><div class="stat-label">Transactions</div></div>
      </div>
      <div class="grid grid-2 animate-fade stagger-2" style="margin-bottom:20px;">
        <div class="card"><h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Spending by Category</h3><div style="position:relative;height:260px;"><canvas id="report-pie"></canvas></div></div>
        <div class="card"><h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Category Breakdown</h3>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => `
              <div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span style="font-weight:500;">${cat}</span><span style="font-family:var(--font-mono);">${formatCurrency(amt,currency)}</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(amt/totalSpent*100)}%;background:${COLORS[cat]||'#64748b'};"></div></div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card animate-fade stagger-3">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">All Transactions</h3>
        <div class="table-wrapper"><table>
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
          <tbody>${monthExpenses.map(e=>`<tr><td style="font-family:var(--font-mono);font-size:13px;">${new Date(e.date).toLocaleDateString()}</td><td>${e.description||'—'}</td><td><span class="badge-pill" style="background:${COLORS[e.category]}22;color:${COLORS[e.category]};">${e.category}</span></td><td style="font-family:var(--font-mono);font-weight:600;color:var(--danger);">${formatCurrency(e.amount,e.currency)}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No transactions this month</td></tr>'}</tbody>
        </table></div>
      </div>`;

    // Pie chart
    if (Object.keys(catTotals).length) {
      const pieCtx = document.getElementById('report-pie').getContext('2d');
      new Chart(pieCtx, { type: 'doughnut', data: { labels: Object.keys(catTotals), datasets: [{ data: Object.values(catTotals), backgroundColor: Object.keys(catTotals).map(c => COLORS[c]||'#64748b'), borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } } }, cutout: '60%' } });
    }

    // Award monthly master badge
    try { await API.badges.award('Monthly Master'); } catch(e) {}
  } catch(e) { showToast(e.message, 'error'); }
}

async function exportCSV() {
  const month = parseInt(document.getElementById('report-month').value);
  const year = parseInt(document.getElementById('report-year').value);
  const startDate = new Date(year, month-1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  try {
    const data = await API.expenses.getAll({ startDate, endDate, limit: 500 });
    const rows = [['Date','Description','Category','Amount','Currency']];
    data.expenses.forEach(e => rows.push([new Date(e.date).toLocaleDateString(), e.description||'', e.category, e.amount, e.currency]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `report_${year}_${month}.csv`; a.click();
    showToast('Report exported as CSV! 📊');
  } catch(e) { showToast(e.message, 'error'); }
}

function exportPDF() {
  window.print();
  showToast('Use browser Print dialog to save as PDF 📄');
}

loadReport();
