import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

export async function initContacts() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex: 1; max-width: 400px;">
          <div class="form-group" style="margin-bottom: 0; flex: 1; position: relative;">
            <input type="text" id="contact-search" class="form-control" placeholder="Search contacts..." style="padding-left: 2.25rem; width: 100%;">
            <i data-lucide="search" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
          </div>
          <select id="contact-filter-status" class="form-control" style="width: auto;">
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
            <option value="all">All Contacts</option>
          </select>
        </div>
        
        ${hasPermission('contact:create') ? `
          <button id="add-contact-btn" class="btn btn-primary">
            <i data-lucide="user-plus"></i> Add Contact
          </button>
        ` : ''}
      </div>

      <!-- Table Card -->
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style="width: 150px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="contacts-table-body">
              <tr>
                <td colspan="5" style="text-align: center; padding: var(--spacing-xl);">
                  <div class="spinner" style="margin: auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Bind toolbar inputs
  const searchInput = document.getElementById('contact-search');
  const statusSelect = document.getElementById('contact-filter-status');
  
  let searchTimeout;
  const triggerFetch = () => {
    fetchAndRenderContacts(searchInput.value, statusSelect.value);
  };

  searchInput.onkeyup = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(triggerFetch, 300);
  };
  
  statusSelect.onchange = triggerFetch;

  // Add Button Event
  const addBtn = document.getElementById('add-contact-btn');
  if (addBtn) {
    addBtn.onclick = () => showContactFormModal();
  }

  // Initial Fetch
  triggerFetch();
}

async function fetchAndRenderContacts(search = '', status = 'true') {
  const tbody = document.getElementById('contacts-table-body');
  if (!tbody) return;

  try {
    let queryParams = [];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (status !== 'all') queryParams.push(`isActive=${status}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const contacts = await api.get(`/contacts${queryString}`);

    if (contacts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
            <div class="empty-state" style="padding: 0;">
              <i data-lucide="users"></i>
              <p class="empty-state-title">No contacts found</p>
              <p style="font-size: var(--fs-xs);">Get started by adding a customer contact.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = contacts.map(c => `
      <tr>
        <td>
          <a href="#/contacts/${c.id}" style="font-weight: 600; display: block; color: var(--text-main); hover:color: var(--primary);">
            ${c.firstName} ${c.lastName || ''}
          </a>
        </td>
        <td>${c.email || '<span style="color:var(--text-muted); font-style:italic;">None</span>'}</td>
        <td>${c.phone}</td>
        <td>
          <span class="badge ${c.isActive ? 'badge-success' : 'badge-danger'}">
            ${c.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td style="text-align: right; display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm edit-contact-row" data-id="${c.id}" title="Edit" style="padding: 0.25rem 0.5rem;">
            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
          </button>
          ${c.isActive && hasPermission('contact:delete') ? `
            <button class="btn btn-danger btn-sm delete-contact-row" data-id="${c.id}" title="Deactivate" style="padding: 0.25rem 0.5rem; background-color: var(--danger-light); color: var(--danger-text); border-color: transparent;">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind Action Buttons
    tbody.querySelectorAll('.edit-contact-row').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        showContactFormModal(btn.dataset.id);
      };
    });

    tbody.querySelectorAll('.delete-contact-row').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        handleDeactivateContact(btn.dataset.id);
      };
    });

  } catch (err) {
    showToast('Fetch Failed', err.message, 'danger');
  }
}

function showContactFormModal(contactId = null) {
  const isEdit = contactId !== null;
  const title = isEdit ? 'Edit Contact' : 'Create Contact';

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="form-firstName">First Name *</label>
        <input type="text" id="form-firstName" name="firstName" class="form-control" required placeholder="John">
      </div>
      <div class="form-group">
        <label class="form-label" for="form-lastName">Last Name</label>
        <input type="text" id="form-lastName" name="lastName" class="form-control" placeholder="Doe">
      </div>
      <div class="form-group">
        <label class="form-label" for="form-phone">Phone Number *</label>
        <input type="tel" id="form-phone" name="phone" class="form-control" required placeholder="+1 (555) 000-0000">
      </div>
      <div class="form-group">
        <label class="form-label" for="form-email">Email Address</label>
        <input type="email" id="form-email" name="email" class="form-control" placeholder="john.doe@example.com">
      </div>
    </div>
  `;

  showModal(title, formHtml, async (data) => {
    // Basic validation overrides
    if (!data.firstName || !data.phone) {
      throw new Error('Please fill in all required fields.');
    }
    
    // Clean empty optional fields so they aren't sent as empty strings
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName || undefined,
      phone: data.phone,
      email: data.email || undefined,
    };

    if (isEdit) {
      await api.patch(`/contacts/${contactId}`, payload);
      showToast('Updated', 'Contact updated successfully.', 'success');
    } else {
      await api.post('/contacts', payload);
      showToast('Created', 'Contact created successfully.', 'success');
    }
    // Refresh Contacts
    const searchInput = document.getElementById('contact-search');
    const statusSelect = document.getElementById('contact-filter-status');
    fetchAndRenderContacts(searchInput?.value, statusSelect?.value);
  }, isEdit ? 'Save Changes' : 'Create Contact');

  // Pre-fill form if Edit mode
  if (isEdit) {
    api.get(`/contacts/${contactId}`).then(contact => {
      const fName = document.getElementById('form-firstName');
      const lName = document.getElementById('form-lastName');
      const phone = document.getElementById('form-phone');
      const email = document.getElementById('form-email');

      if (fName) fName.value = contact.firstName || '';
      if (lName) lName.value = contact.lastName || '';
      if (phone) phone.value = contact.phone || '';
      if (email) email.value = contact.email || '';
    }).catch(err => {
      showToast('Error', 'Failed to retrieve contact data', 'danger');
    });
  }
}

function handleDeactivateContact(contactId) {
  showConfirm(
    'Deactivate Contact',
    'Are you sure you want to deactivate this contact? Any active associations remain intact but this contact will be marked inactive.',
    async () => {
      await api.delete(`/contacts/${contactId}`);
      showToast('Success', 'Contact deactivated.', 'success');
      
      const searchInput = document.getElementById('contact-search');
      const statusSelect = document.getElementById('contact-filter-status');
      fetchAndRenderContacts(searchInput?.value, statusSelect?.value);
    },
    'Deactivate'
  );
}
