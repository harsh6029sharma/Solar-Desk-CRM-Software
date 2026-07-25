import { getCurrentUser, hasPermission } from '../services/auth.js';

export function renderSidebar() {
  const user = getCurrentUser();
  if (!user) return '';

  const menuItems = [
    { label: 'Dashboard', path: '#/', icon: 'layout-dashboard' },
    { label: 'Contacts', path: '#/contacts', icon: 'users', perm: 'contact:read' },
    { label: 'Products', path: '#/products', icon: 'package', perm: 'product:read' },
    { label: 'Leads', path: '#/leads', icon: 'zap', perm: 'lead:read' },
    { label: 'Opportunities', path: '#/opportunities', icon: 'trending-up', perm: 'opportunity:read' },
    { label: 'Employees', path: '#/users', icon: 'shield', perm: 'user:read' },
    { label: 'Roles', path: '#/roles', icon: 'key', perm: 'role:read' },
    { label: 'Settings', path: '#/settings', icon: 'settings' },
  ];

  const filteredItems = menuItems.filter(item => !item.perm || hasPermission(item.perm));

  const navLinksHtml = filteredItems.map(item => `
    <a href="${item.path}" class="sidebar-link">
      <i data-lucide="${item.icon}"></i>
      <span>${item.label}</span>
    </a>
  `).join('');

  const initials = `${user.firstName[0] || ''}${user.lastName ? user.lastName[0] : ''}`.toUpperCase();

  return `
    <div class="sidebar-logo">
      <i data-lucide="sun"></i>
      <span>SolarDesk</span>
    </div>
    <nav class="sidebar-nav">
      ${navLinksHtml}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${user.firstName} ${user.lastName || ''}</span>
          <span class="sidebar-user-role">${user.organizationName || 'Solar CRM'}</span>
        </div>
      </div>
      <button id="sidebar-logout-btn" class="logout-btn" title="Logout">
        <i data-lucide="log-out"></i>
      </button>
    </div>
  `;
}

export function bindSidebarEvents() {
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      const { logout } = await import('../services/auth.js');
      await logout();
    };
  }
}
