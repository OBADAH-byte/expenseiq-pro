if (!requireAuth()) throw new Error('Not authenticated');
const user = getUser();
document.getElementById('user-name').textContent = user?.name || 'User';
document.getElementById('user-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();
if (user?.currency) document.getElementById('exp-currency').value = user.currency;
document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];

const CATEGORY_ICONS = { Food:'🍔', Transport:'🚗', Shopping:'🛍️', Entertainment:'🎬', Health:'💊', Bills:'📋', Education:'📚', Travel:'✈️', Other:'📦' };
const CATEGORY_COLORS = { Food:'#ef4444', Transport:'#f59e0b', Shopping:'#6366f1', Entertainment:'#8b5cf6', Health:'#22c55e', Bills:'#0ea5e9', Education:'#ec4899', Travel:'#14b8a6', Other:'#64748b' };

let currentPage = 1, editingId = null, allExpenses = [];
function logout() { clearAuth(); window.location.href = '/login.html'; }

async function loadExpenses() {
  const params = { page: currentPage, limit: 15 };
  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('category-filter').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  if (search) params.search = search;
  if (category !== 'all') params.category = category;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  try {
    const data = await API.expenses.getAll(params);
    allExpenses = data.expenses;
    renderTable(data.expenses);
    renderPagination(data.total, data.pages, data.currentPage);
  } catch (e) { showToast(e.message, 'error'); }
}

function renderTable(expenses) {
  const tbody = document.getElementById('expenses-tbody');
  if (!expenses.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No expenses found. <a href="#" onclick="openModal()" style="color:var(--primary)">Add one →</a></td></tr>'; return; }
  tbody.innerHTML = expenses.map(e => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:13px;">${new Date(e.date).toLocaleDateString()}</td>
      <td>${e.description || '<span style="color:var(--text-faint)">No description</span>'}</td>
      <td><span class="badge-pill" style="background:${CATEGORY_COLORS[e.category]}22;color:${CATEGORY_COLORS[e.category]};">${CATEGORY_ICONS[e.category]} ${e.category}</span></td>
      <td style="font-family:var(--font-mono);font-weight:600;color:var(--danger);">${formatCurrency(e.amount, e.currency)}</td>
      <td><span class="badge-pill badge-primary">${e.currency}</span></td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-ghost btn-sm" onclick="editExpense('${e._id}')">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteExpense('${e._id}')" style="color:var(--danger);">🗑️</button>
      </td>
    </tr>`).join('');
}

function renderPagination(total, pages, current) {
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML = `<span>Showing ${total} expense${total !== 1 ? 's' : ''}</span>`; return; }
  el.innerHTML = `
    <span>${total} expenses · Page ${current} of ${pages}</span>
    <div style="display:flex;gap:6px;">
      <button class="btn btn-outline btn-sm" onclick="changePage(${current-1})" ${current === 1 ? 'disabled' : ''}>← Prev</button>
      <button class="btn btn-outline btn-sm" onclick="changePage(${current+1})" ${current === pages ? 'disabled' : ''}>Next →</button>
    </div>`;
}

function changePage(p) { currentPage = p; loadExpenses(); }
function filterChanged() { currentPage = 1; clearTimeout(window._filterTimeout); window._filterTimeout = setTimeout(loadExpenses, 400); }
function clearFilters() { document.getElementById('search').value=''; document.getElementById('category-filter').value='all'; document.getElementById('start-date').value=''; document.getElementById('end-date').value=''; loadExpenses(); }

function openModal(expense = null) {
  editingId = expense?._id || null;
  document.getElementById('modal-title').textContent = expense ? 'Edit Expense' : 'Add Expense';
  document.getElementById('exp-amount').value = expense?.amount || '';
  document.getElementById('exp-category').value = expense?.category || 'Food';
  document.getElementById('exp-currency').value = expense?.currency || user?.currency || 'USD';
  document.getElementById('exp-desc').value = expense?.description || '';
  document.getElementById('exp-date').value = expense ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  document.getElementById('expense-modal').classList.add('active');
}
function closeModal() { document.getElementById('expense-modal').classList.remove('active'); editingId = null; }

async function saveExpense() {
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const category = document.getElementById('exp-category').value;
  const currency = document.getElementById('exp-currency').value;
  const description = document.getElementById('exp-desc').value.trim();
  const date = document.getElementById('exp-date').value;
  if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
  const btn = document.getElementById('save-btn'); btn.disabled = true; btn.textContent = 'Saving...';
  try {
    if (editingId) { await API.expenses.update(editingId, { amount, category, description, currency, date }); showToast('Expense updated ✅'); }
    else { await API.expenses.add({ amount, category, description, currency, date }); showToast('Expense added ✅'); }
    closeModal(); loadExpenses();
  } catch (e) { showToast(e.message, 'error'); }
  btn.disabled = false; btn.textContent = 'Save Expense';
}

function editExpense(id) { const e = allExpenses.find(x => x._id === id); if (e) openModal(e); }

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  try { await API.expenses.delete(id); showToast('Expense deleted'); loadExpenses(); } catch (e) { showToast(e.message, 'error'); }
}

async function exportExcel() {
  try {
    const data = await API.expenses.getAll({ limit: 1000 });
    const rows = [['Date','Description','Category','Amount','Currency']];
    data.expenses.forEach(e => rows.push([new Date(e.date).toLocaleDateString(), e.description||'', e.category, e.amount, e.currency]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    showToast('Expenses exported! 📥');
  } catch (e) { showToast(e.message, 'error'); }
}

document.getElementById('expense-modal').addEventListener('click', e => { if (e.target === document.getElementById('expense-modal')) closeModal(); });
loadExpenses();
