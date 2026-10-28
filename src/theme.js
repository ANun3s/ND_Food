// One theme state shared by React, static markup and Go Live.
const key = 'nuvora-theme';
const system = window.matchMedia('(prefers-color-scheme: dark)');
let preference;
try { preference = localStorage.getItem(key); } catch { /* Storage may be unavailable. */ }
if (!['light', 'dark'].includes(preference)) preference = null;

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#171719' : '#fffdfa');
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
  });
  window.dispatchEvent(new CustomEvent('nuvora:theme-change', { detail: { theme } }));
}

export function toggleTheme() {
  preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(key, preference); } catch { /* Keep the choice for this visit. */ }
  applyTheme(preference);
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-theme-toggle]')) toggleTheme();
});
system.addEventListener('change', () => {
  if (!preference) applyTheme(system.matches ? 'dark' : 'light');
});
window.addEventListener('storage', (event) => {
  if (event.key !== key && event.key !== null) return;
  preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : null;
  applyTheme(preference || (system.matches ? 'dark' : 'light'));
});
applyTheme(preference || (system.matches ? 'dark' : 'light'));
