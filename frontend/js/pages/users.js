import { api } from '../services/api.js';
import { showToast, showModal } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

let roles = [];

export async function initUsers() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.75rem; font-weight: 700; color: var(--text-dark);">Employees</h1>
          <p style="color: var(--text-muted); font-size: var(--fs-sm);">Manage team members, roles, and access credentials.</p>
        </div>
        ${hasPermission('user:create') ? `
          <button id="add-user-btn" class="btn btn-primary">
            <i data-lucide="plus"></i> Add Employee
          </button>
        ` : ''}
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table" style="background-color: transparent;">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="users-table-body">
              <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">
                  <div class="spinner" style="margin: 0 auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load roles first (needed for display & creation)
  try {
    roles = await api.get('/roles');
  } catch (err) {
    console.error('Failed to load roles', err);
  }

  await loadUsersList();

  const addBtn = document.getElementById('add-user-btn');
  if (addBtn) {
    addBtn.onclick = showCreateUserModal;
  }
}

async function loadUsersList() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  try {
    const users = await api.get('/users');
    if (!users || users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">No employees found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      // Find role name from the loaded roles list or nested userRole relationship
      let roleName = 'No Role';
      if (u.userRoles && u.userRoles.length > 0) {
        roleName = u.userRoles[0].role?.name || 'User';
      } else if (u.roleId) {
        const found = roles.find(r => r.id === u.roleId);
        roleName = found ? found.name : 'User';
      }

      const statusBadge = u.isActive 
        ? '<span class="badge badge-success">Active</span>' 
        : '<span class="badge badge-secondary">Inactive</span>';

      return `
        <tr>
          <td style="font-weight: 600;">${u.firstName} ${u.lastName || ''}</td>
          <td>${u.email}</td>
          <td><span class="badge badge-info">${roleName}</span></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger); padding: var(--spacing-md);">Failed to load employees list: ${err.message}</td></tr>`;
  }
}

function showCreateUserModal() {
  if (roles.length === 0) {
    showToast('Error', 'Roles list is not loaded yet. Please try again.', 'danger');
    return;
  }

  const roleOpts = roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

  const formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="user-first-name">First Name *</label>
          <input type="text" id="user-first-name" name="firstName" class="form-control" required placeholder="John">
        </div>
        <div class="form-group">
          <label class="form-label" for="user-last-name">Last Name *</label>
          <input type="text" id="user-last-name" name="lastName" class="form-control" required placeholder="Doe">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="user-email">Email Address *</label>
        <input type="email" id="user-email" name="email" class="form-control" required placeholder="john.doe@solardesk.com">
      </div>
      <div class="form-group">
        <label class="form-label" for="user-password">Password *</label>
        <input type="password" id="user-password" name="password" class="form-control" required minlength="8" placeholder="••••••••">
      </div>
      <div class="form-group">
        <label class="form-label" for="user-role">Assigned Role *</label>
        <select id="user-role" name="roleId" class="form-control" required>
          <option value="">Select Role</option>
          ${roleOpts}
        </select>
      </div>
    </div>
  `;

  showModal('Add New Employee', formHtml, async (data) => {
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.roleId) {
      throw new Error('Please fill in all required fields.');
    }

    await api.post('/users', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      roleId: data.roleId
    });

    showToast('Success', 'New employee registered successfully.', 'success');
    await loadUsersList();
  }, 'Create Employee');
}
