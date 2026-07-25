import { api } from '../services/api.js';
import { showToast } from '../components/ui.js';
import { getCurrentUser, fetchCurrentUser } from '../services/auth.js';

export async function initSettings() {
  const app = document.getElementById('app');
  const user = getCurrentUser();

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Employee Profile Card (Read-only) -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Employee Profile</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md);">
          <div>
            <span class="form-label" style="color: var(--text-muted);">Name</span>
            <p style="font-weight: 500; margin-top: var(--spacing-xs);">${user.firstName} ${user.lastName || ''}</p>
          </div>
          <div>
            <span class="form-label" style="color: var(--text-muted);">Email Address</span>
            <p style="font-weight: 500; margin-top: var(--spacing-xs);">${user.email}</p>
          </div>
          <div>
            <span class="form-label" style="color: var(--text-muted);">Assigned System Role</span>
            <p style="font-weight: 500; margin-top: var(--spacing-xs);">${user.roles.join(', ')}</p>
          </div>
          <div>
            <span class="form-label" style="color: var(--text-muted);">Last Login At</span>
            <p style="font-weight: 500; margin-top: var(--spacing-xs);">
              ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <!-- Organization Settings Form -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Organization Settings</h3>
        </div>
        <form id="org-settings-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
            <div class="form-group">
              <label class="form-label" for="org-name">Display Name</label>
              <input type="text" id="org-name" name="name" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="org-legalName">Legal / Corporate Name</label>
              <input type="text" id="org-legalName" name="legalName" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-email">Org Contact Email</label>
              <input type="email" id="org-email" name="email" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-phone">Org Contact Phone</label>
              <input type="text" id="org-phone" name="phone" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-website">Website URL</label>
              <input type="url" id="org-website" name="website" class="form-control" placeholder="https://example.com">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-logo">Logo Image URL</label>
              <input type="url" id="org-logo" name="logoUrl" class="form-control" placeholder="https://example.com/logo.png">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-gst">GST Number</label>
              <input type="text" id="org-gst" name="gstNumber" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label" for="org-pan">PAN Number</label>
              <input type="text" id="org-pan" name="panNumber" class="form-control">
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: var(--spacing-lg);">
            <button id="org-save-btn" type="submit" class="btn btn-primary">
              <i data-lucide="save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Populate Org form
  try {
    const org = await api.get('/organizations/me');
    
    document.getElementById('org-name').value = org.name || '';
    document.getElementById('org-legalName').value = org.legalName || '';
    document.getElementById('org-email').value = org.email || '';
    document.getElementById('org-phone').value = org.phone || '';
    document.getElementById('org-website').value = org.website || '';
    document.getElementById('org-logo').value = org.logoUrl || '';
    document.getElementById('org-gst').value = org.gstNumber || '';
    document.getElementById('org-pan').value = org.panNumber || '';

  } catch (err) {
    showToast('Error', 'Failed to retrieve organization settings', 'danger');
  }

  // Handle Form Submit
  const form = document.getElementById('org-settings-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('org-save-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const payload = {
      name: document.getElementById('org-name').value || undefined,
      legalName: document.getElementById('org-legalName').value || undefined,
      email: document.getElementById('org-email').value || undefined,
      phone: document.getElementById('org-phone').value || undefined,
      website: document.getElementById('org-website').value || undefined,
      logoUrl: document.getElementById('org-logo').value || undefined,
      gstNumber: document.getElementById('org-gst').value || undefined,
      panNumber: document.getElementById('org-pan').value || undefined,
    };

    try {
      await api.patch('/organizations/me', payload);
      
      // Update cached user session so sidebar displays correctly
      await fetchCurrentUser();
      showToast('Settings Updated', 'Organization settings saved successfully.', 'success');
      
      // Re-trigger layout mount to refresh details
      const { resetShell } = await import('../router.js');
      resetShell();
      initSettings();
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update organization', 'danger');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="save"></i> Save Changes`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  };
}
