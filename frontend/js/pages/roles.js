import { api } from '../services/api.js';
import { showToast, showModal } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

export async function initRoles() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.75rem; font-weight: 700; color: var(--text-dark);">Roles & Permissions</h1>
          <p style="color: var(--text-muted); font-size: var(--fs-sm);">Define system roles and assign resource access controls.</p>
        </div>
        ${hasPermission('role:create') ? `
          <button id="add-role-btn" class="btn btn-primary">
            <i data-lucide="plus"></i> Create Role
          </button>
        ` : ''}
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table" style="background-color: transparent;">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions Count</th>
              </tr>
            </thead>
            <tbody id="roles-table-body">
              <tr>
                <td colspan="3" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">
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

  await loadRolesList();

  const addBtn = document.getElementById('add-role-btn');
  if (addBtn) {
    addBtn.onclick = showCreateRoleModal;
  }
}

async function loadRolesList() {
  const tbody = document.getElementById('roles-table-body');
  if (!tbody) return;

  try {
    const roles = await api.get('/roles');
    if (!roles || roles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">No roles found.</td></tr>`;
      return;
    }

    tbody.innerHTML = roles.map(r => {
      const permCount = r.permissions ? r.permissions.length : 0;
      return `
        <tr>
          <td style="font-weight: 600;"><span class="badge badge-info" style="font-size: var(--fs-sm);">${r.name}</span></td>
          <td>${r.description || '<span style="font-style: italic; color: var(--text-muted);">No description provided</span>'}</td>
          <td><strong>${permCount}</strong> permissions active</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--danger); padding: var(--spacing-md);">Failed to load roles: ${err.message}</td></tr>`;
  }
}

function showCreateRoleModal() {
  const formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="role-name">Role Name *</label>
        <input type="text" id="role-name" name="name" class="form-control" required placeholder="e.g. Sales Agent, Project Tech">
      </div>
      <div class="form-group">
        <label class="form-label" for="role-desc">Description</label>
        <textarea id="role-desc" name="description" class="form-control" rows="3" placeholder="Explain the key scope or responsibility of this role..."></textarea>
      </div>
    </div>
  `;

  showModal('Create Custom Role', formHtml, async (data) => {
    if (!data.name) {
      throw new Error('Role name is required.');
    }

    await api.post('/roles', {
      name: data.name,
      description: data.description || undefined
    });

    showToast('Success', 'New role created successfully.', 'success');
    await loadRolesList();
  }, 'Create Role');
}
