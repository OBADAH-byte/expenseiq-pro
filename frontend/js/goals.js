if (!requireAuth()) throw new Error('Not authenticated');
const user = getUser();
document.getElementById('user-name').textContent = user?.name || 'User';
document.getElementById('user-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();
function logout() { clearAuth(); window.location.href = '/login.html'; }

let editingGoalId = null, addingGoalId = null;
const CAT_ICONS = { General:'💰', 'Emergency Fund':'🛡️', Vacation:'✈️', Home:'🏠', Vehicle:'🚗', Education:'📚', Retirement:'👴', Other:'🎯' };

async function loadGoals() {
  try {
    const data = await API.goals.getAll();
    renderGoals(data.goals);
  } catch(e) { showToast(e.message, 'error'); }
}

function renderGoals(goals) {
  const grid = document.getElementById('goals-grid');
  if (!goals.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;" class="card"><div class="empty-state"><div class="empty-icon">🎯</div><p>No goals yet.<br>Create your first savings goal to get started!</p><button class="btn btn-primary" style="margin-top:16px;" onclick="openGoalModal()">+ Create Goal</button></div></div>';
    return;
  }
  grid.innerHTML = goals.map(g => {
    const pct = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
    const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    const isCompleted = g.isCompleted || pct >= 100;
    return `
    <div class="card animate-fade hover-lift">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="font-size:28px;">${CAT_ICONS[g.category] || '🎯'}</div>
          <div><div style="font-weight:600;font-size:15px;">${g.goalName}</div><div style="font-size:12px;color:var(--text-muted);">${g.category}</div></div>
        </div>
        ${isCompleted ? '<span class="badge-pill badge-success">✓ Complete</span>' : daysLeft < 0 ? '<span class="badge-pill badge-danger">Overdue</span>' : '<span class="badge-pill badge-primary">' + daysLeft + ' days left</span>'}
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
        <span style="color:var(--text-muted);">Progress</span>
        <span style="font-weight:600;color:${isCompleted ? 'var(--success)' : 'var(--primary)'};">${pct}%</span>
      </div>
      <div class="progress-bar" style="margin-bottom:12px;">
        <div class="progress-fill" style="width:${pct}%;background:${isCompleted ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), #8b5cf6)'};" data-width="${pct}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:16px;">
        <span style="color:var(--text-muted);">Saved: <strong>${formatCurrency(g.currentAmount, g.currency)}</strong></span>
        <span style="color:var(--text-muted);">Target: <strong>${formatCurrency(g.targetAmount, g.currency)}</strong></span>
      </div>
      <div style="display:flex;gap:8px;">
        ${!isCompleted ? `<button class="btn btn-success btn-sm" style="flex:1;" onclick="openAddModal('${g._id}', '${g.goalName}')">+ Add</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="deleteGoal('${g._id}')">🗑️</button>
      </div>
    </div>`; }).join('');
  // Animate progress bars
  setTimeout(() => document.querySelectorAll('.progress-fill').forEach(el => el.style.width = el.dataset.width + '%'), 100);
}

function openGoalModal() {
  editingGoalId = null;
  document.getElementById('goal-modal-title').textContent = 'Create Goal';
  document.getElementById('goal-name').value = '';
  document.getElementById('goal-target').value = '';
  document.getElementById('goal-currency').value = user?.currency || 'USD';
  document.getElementById('goal-deadline').value = '';
  document.getElementById('goal-modal').classList.add('active');
}
function closeGoalModal() { document.getElementById('goal-modal').classList.remove('active'); }

async function saveGoal() {
  const goalName = document.getElementById('goal-name').value.trim();
  const targetAmount = parseFloat(document.getElementById('goal-target').value);
  const currency = document.getElementById('goal-currency').value;
  const category = document.getElementById('goal-category').value;
  const deadline = document.getElementById('goal-deadline').value;
  if (!goalName || !targetAmount || !deadline) { showToast('Please fill required fields', 'error'); return; }
  const btn = document.getElementById('save-goal-btn'); btn.disabled = true; btn.textContent = 'Saving...';
  try {
    await API.goals.create({ goalName, targetAmount, currency, category, deadline });
    showToast('Goal created! 🎯'); closeGoalModal(); loadGoals();
  } catch(e) { showToast(e.message, 'error'); }
  btn.disabled = false; btn.textContent = 'Create Goal';
}

function openAddModal(id, name) { addingGoalId = id; document.getElementById('add-goal-name').textContent = `Adding funds to: ${name}`; document.getElementById('add-amount').value = ''; document.getElementById('add-modal').classList.add('active'); }
function closeAddModal() { document.getElementById('add-modal').classList.remove('active'); addingGoalId = null; }

async function addToGoal() {
  const amount = parseFloat(document.getElementById('add-amount').value);
  if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
  try { await API.goals.addAmount(addingGoalId, amount); showToast('Amount added! 💰'); closeAddModal(); loadGoals(); } catch(e) { showToast(e.message, 'error'); }
}

async function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  try { await API.goals.delete(id); showToast('Goal deleted'); loadGoals(); } catch(e) { showToast(e.message, 'error'); }
}

loadGoals();
