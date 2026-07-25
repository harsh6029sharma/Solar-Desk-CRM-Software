import { getCurrentUser } from '../services/auth.js';

export function renderNavbar() {
  const user = getCurrentUser();
  if (!user) return '';

  return `
    <div class="navbar-brand" id="navbar-title">Dashboard</div>
    <div class="navbar-actions">
      <span style="font-size: var(--fs-sm); color: var(--text-muted); font-weight: 500;">
        ${user.organizationName}
      </span>
      <div style="width: 1px; height: 20px; background-color: var(--border-color);"></div>
      <div style="font-size: var(--fs-sm); font-weight: 500; display: flex; align-items: center; gap: var(--spacing-sm);">
        <i data-lucide="calendar" style="width: 16px; height: 16px; color: var(--text-muted);"></i>
        <span id="navbar-date"></span>
      </div>
    </div>
  `;
}

export function bindNavbarEvents() {
  updateNavbarDate();
  updateNavbarTitle();
  window.addEventListener('hashchange', updateNavbarTitle);
}

function updateNavbarDate() {
  const dateSpan = document.getElementById('navbar-date');
  if (dateSpan) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateSpan.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

function updateNavbarTitle() {
  const titleDiv = document.getElementById('navbar-title');
  if (!titleDiv) return;

  const hash = window.location.hash || '#/';
  
  if (hash === '#/' || hash === '') {
    titleDiv.textContent = 'Dashboard';
  } else if (hash.startsWith('#/contacts')) {
    titleDiv.textContent = 'Contacts';
  } else if (hash.startsWith('#/products')) {
    titleDiv.textContent = 'Products Catalog';
  } else if (hash.startsWith('#/leads')) {
    titleDiv.textContent = 'Leads Pipeline';
  } else if (hash.startsWith('#/opportunities')) {
    titleDiv.textContent = 'Opportunities';
  } else if (hash.startsWith('#/users')) {
    titleDiv.textContent = 'Employees';
  } else if (hash.startsWith('#/roles')) {
    titleDiv.textContent = 'Roles & Permissions';
  } else if (hash.startsWith('#/settings')) {
    titleDiv.textContent = 'Settings';
  } else {
    titleDiv.textContent = 'SolarDesk CRM';
  }
}
export { updateNavbarTitle };
