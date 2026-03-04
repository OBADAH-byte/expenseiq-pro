if (!requireAuth()) throw new Error('Not authenticated');

const user = getUser();
const hours = new Date().getHours();
const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
document.getElementById('greeting').textContent = `${greeting}, ${user?.name?.split(' ')[0] || 'there'}! Here's your financial overview.`;
document.getElementById('user-name').textContent = user?.name || 'User';
document.getElementById('user-email').textContent = user?.email || '';
document.getElementById('user-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();

function logout() { clearAuth(); window.location.href = '/login.html'; }

const CATEGORY_ICONS = { Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬', Health: '💊', Bills: '📋', Education: '📚', Travel: '✈️', Other: '📦' };
const CATEGORY_COLORS = { Food: '#ef4444', Transport: '#f59e0b', Shopping: '#6366f1', Entertainment: '#8b5cf6', Health: '#22c55e', Bills: '#0ea5e9', Education: '#ec4899', Travel: '#14b8a6', Other: '#64748b' };

let spendingChart, categoryChart;
Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
Chart.defaults.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#1e293b';

async function loadDashboard() {
  try {
    const [statsData, expensesData] = await Promise.all([API.expenses.getStats(), API.expenses.getAll({ limit: 5 })]);
    renderStats(statsData.stats);
    renderCharts(statsData.stats);
    renderTransactions(expensesData.expenses);
    renderInsights(statsData.stats);
  } catch (e) { showToast(e.message, 'error'); }
}

function renderStats(stats) {
  const currency = user?.currency || 'USD';
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card animate-count stagger-1">
      <div class="stat-icon" style="background:rgba(99,102,241,0.15);">💳</div>
      <div class="stat-value">${formatCurrency(stats.monthlyTotal, currency)}</div>
      <div class="stat-label">This Month</div>
    </div>
    <div class="stat-card animate-count stagger-2">
      <div class="stat-icon" style="background:rgba(239,68,68,0.15);">📊</div>
      <div class="stat-value">${formatCurrency(stats.allTimeTotal, currency)}</div>
      <div class="stat-label">All Time</div>
    </div>
    <div class="stat-card animate-count stagger-3">
      <div class="stat-icon" style="background:rgba(34,197,94,0.15);">🏆</div>
      <div class="stat-value">${stats.categoryBreakdown.length}</div>
      <div class="stat-label">Categories Used</div>
    </div>
    <div class="stat-card animate-count stagger-4">
      <div class="stat-icon" style="background:rgba(245,158,11,0.15);">📅</div>
      <div class="stat-value">${stats.monthlyTrend.length}</div>
      <div class="stat-label">Active Months</div>
    </div>`;
}

function renderCharts(stats) {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Spending line chart
  if (spendingChart) spendingChart.destroy();
  const lineCtx = document.getElementById('spending-chart').getContext('2d');
  const labels = stats.monthlyTrend.map(m => months[m._id.month-1] + ' ' + m._id.year);
  const values = stats.monthlyTrend.map(m => m.total);
  const gradient = lineCtx.createLinearGradient(0,0,0,280);
  gradient.addColorStop(0, 'rgba(99,102,241,0.3)');
  gradient.addColorStop(1, 'rgba(99,102,241,0)');
  spendingChart = new Chart(lineCtx, {
    type: 'line',
    data: { labels: labels.length ? labels : ['No data'], datasets: [{ label: 'Spending', data: values.length ? values : [0], borderColor: '#6366f1', backgroundColor: gradient, borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: '#6366f1', pointRadius: 4, pointHoverRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { callback: v => '$'+v } }, x: { grid: { display: false } } } }
  });

  // Category pie chart
  if (categoryChart) categoryChart.destroy();
  const pieCtx = document.getElementById('category-chart').getContext('2d');
  const cats = stats.categoryBreakdown.slice(0, 6);
  categoryChart = new Chart(pieCtx, {
    type: 'doughnut',
    data: { labels: cats.map(c => c._id), datasets: [{ data: cats.map(c => c.total), backgroundColor: cats.map(c => CATEGORY_COLORS[c._id] || '#64748b'), borderWidth: 2, borderColor: isDark ? '#0f172a' : '#ffffff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } }, cutout: '65%' }
  });
}

function renderTransactions(expenses) {
  const el = document.getElementById('recent-transactions');
  if (!expenses?.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">💳</div><p>No transactions yet.<br><a href="expenses.html" style="color:var(--primary)">Add your first expense →</a></p></div>'; return; }
  el.innerHTML = expenses.map(e => `
    <div class="transaction-item">
      <div class="tx-icon" style="background:${CATEGORY_COLORS[e.category]}22;">${CATEGORY_ICONS[e.category] || '📦'}</div>
      <div class="tx-details">
        <div class="tx-name">${e.description || e.category}</div>
        <div class="tx-date">${new Date(e.date).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}</div>
      </div>
      <div class="tx-amount">-${formatCurrency(e.amount, e.currency)}</div>
    </div>`).join('');
}

function renderInsights(stats) {
  const el = document.getElementById('insights-container');
  const insights = [];
  if (stats.categoryBreakdown.length > 0) {
    const top = stats.categoryBreakdown[0];
    insights.push({ icon: '📊', text: `Your highest spending category is <strong>${top._id}</strong> at <strong>${formatCurrency(top.total, user?.currency)}</strong>.` });
  }
  if (stats.monthlyTotal > 0) {
    insights.push({ icon: '💡', text: `You've spent <strong>${formatCurrency(stats.monthlyTotal, user?.currency)}</strong> this month. Track daily to stay on budget.` });
  }
  insights.push({ icon: '🏆', text: `Complete savings goals and track consistently to earn <strong>achievement badges</strong>.` });
  if (!insights.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">Add expenses to see financial insights.</p>'; return; }
  el.innerHTML = insights.map(i => `<div class="insight-card"><div class="insight-icon">${i.icon}</div><div class="insight-text">${i.text}</div></div>`).join('');
}

loadDashboard();
