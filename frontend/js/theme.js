const initTheme = () => {
  const user = window.getUser ? getUser() : null;
  const savedTheme = user?.theme || localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const user = getUser();
  if (user) { user.theme = next; localStorage.setItem('expenseiq_user', JSON.stringify(user)); }
  return next;
};

initTheme();
window.toggleTheme = toggleTheme;
