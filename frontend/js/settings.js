if (!requireAuth()) throw new Error('Not authenticated');
let user = getUser();
let notifications = user?.notifications || { email: true, budget: true, goals: true };

document.getElementById('user-name').textContent = user?.name || 'User';
document.getElementById('user-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();
document.getElementById('profile-avatar').textContent = (user?.name?.[0] || 'U').toUpperCase();
document.getElementById('profile-name').textContent = user?.name || '';
document.getElementById('profile-email').textContent = user?.email || '';
document.getElementById('s-name').value = user?.name || '';
document.getElementById('s-currency').value = user?.currency || 'USD';
document.getElementById('s-theme').value = user?.theme || 'dark';

function logout() { clearAuth(); window.location.href = '/login.html'; }

const setToggle = (id, on) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = on ? 'var(--primary)' : 'var(--border)';
  el.querySelector('div').style.left = on ? '23px' : '3px';
};
setToggle('toggle-email', notifications.email);
setToggle('toggle-budget', notifications.budget);
setToggle('toggle-goals', notifications.goals);

function toggleNotif(key) {
  notifications[key] = !notifications[key];
  setToggle('toggle-' + key, notifications[key]);
}

async function saveProfile() {
  const name = document.getElementById('s-name').value.trim();
  const currency = document.getElementById('s-currency').value;
  const theme = document.getElementById('s-theme').value;
  if (!name) { showToast('Name is required', 'error'); return; }
  try {
    const data = await API.auth.updateProfile({ name, currency, theme });
    localStorage.setItem('expenseiq_user', JSON.stringify({ ...user, ...data.user }));
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('profile-name').textContent = name;
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-avatar').textContent = name[0].toUpperCase();
    document.getElementById('profile-avatar').textContent = name[0].toUpperCase();
    showToast('Profile updated ✅');
  } catch(e) { showToast(e.message, 'error'); }
}

async function saveNotifications() {
  try {
    await API.auth.updateProfile({ notifications });
    showToast('Notification preferences saved ✅');
  } catch(e) { showToast(e.message, 'error'); }
}

async function changePassword() {
  const current = document.getElementById('current-pwd').value;
  const newPwd = document.getElementById('new-pwd').value;
  const confirm = document.getElementById('confirm-pwd').value;
  if (!current || !newPwd) { showToast('Please fill all fields', 'error'); return; }
  if (newPwd !== confirm) { showToast('Passwords do not match', 'error'); return; }
  if (newPwd.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  try {
    await API.auth.changePassword({ currentPassword: current, newPassword: newPwd });
    showToast('Password changed successfully 🔒');
    document.getElementById('current-pwd').value = '';
    document.getElementById('new-pwd').value = '';
    document.getElementById('confirm-pwd').value = '';
  } catch(e) { showToast(e.message, 'error'); }
}
