import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

let activeContactId = null;

export async function initContactDetails(contactId) {
  activeContactId = contactId;
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Back Header -->
      <div>
        <a href="#/contacts" style="display: inline-flex; align-items: center; gap: var(--spacing-xs); font-weight: 500; font-size: var(--fs-sm); margin-bottom: var(--spacing-sm);">
          <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Contacts
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 id="detail-contact-name" style="font-size: var(--fs-2xl); font-weight: 700;">Loading...</h2>
          <div style="display: flex; gap: var(--spacing-sm);">
            <button id="edit-contact-btn" class="btn btn-secondary">
              <i data-lucide="edit-2"></i> Edit Info
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Cards Grid -->
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--spacing-lg); align-items: start;">
        
        <!-- Details Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Customer Info</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Phone</span>
              <p id="detail-phone" style="font-weight: 500; margin-top: var(--spacing-xs);">-</p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Email</span>
              <p id="detail-email" style="font-weight: 500; margin-top: var(--spacing-xs);">-</p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Status</span>
              <p style="margin-top: var(--spacing-xs);">
                <span id="detail-status" class="badge badge-info">-</span>
              </p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Created At</span>
              <p id="detail-created" style="font-weight: 500; margin-top: var(--spacing-xs);">-</p>
            </div>
          </div>
        </div>

        <!-- Addresses Card -->
        <div class="card">
          <div class="card-header" style="margin-bottom: var(--spacing-md);">
            <h3 class="card-title">Addresses</h3>
            ${hasPermission('address:create') ? `
              <button id="add-address-btn" class="btn btn-secondary" style="padding: 0.375rem 0.75rem;">
                <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Add Address
              </button>
            ` : ''}
          </div>
          <div id="addresses-list-container" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div class="spinner" style="margin: var(--spacing-xl) auto;"></div>
          </div>
        </div>

      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load Contact & Addresses Data
  await loadContactDetails();
  await loadAddresses();

  // Bind Buttons
  const editBtn = document.getElementById('edit-contact-btn');
  if (editBtn) {
    editBtn.onclick = () => showEditContactModal();
  }

  const addAddressBtn = document.getElementById('add-address-btn');
  if (addAddressBtn) {
    addAddressBtn.onclick = () => showAddressFormModal();
  }
}

async function loadContactDetails() {
  try {
    const contact = await api.get(`/contacts/${activeContactId}`);
    
    const nameEl = document.getElementById('detail-contact-name');
    const phoneEl = document.getElementById('detail-phone');
    const emailEl = document.getElementById('detail-email');
    const statusEl = document.getElementById('detail-status');
    const createdEl = document.getElementById('detail-created');

    if (nameEl) nameEl.textContent = `${contact.firstName} ${contact.lastName || ''}`;
    if (phoneEl) phoneEl.textContent = contact.phone;
    if (emailEl) emailEl.textContent = contact.email || 'N/A';
    if (createdEl) createdEl.textContent = new Date(contact.createdAt).toLocaleDateString();
    
    if (statusEl) {
      statusEl.textContent = contact.isActive ? 'Active' : 'Inactive';
      statusEl.className = `badge ${contact.isActive ? 'badge-success' : 'badge-danger'}`;
    }
  } catch (err) {
    showToast('Failed to load profile', err.message, 'danger');
  }
}

async function loadAddresses() {
  const container = document.getElementById('addresses-list-container');
  if (!container) return;

  try {
    const addresses = await api.get(`/contacts/${activeContactId}/addresses`);

    if (addresses.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: var(--spacing-lg); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
          <i data-lucide="map-pin" style="width: 32px; height: 32px;"></i>
          <p class="empty-state-title">No addresses recorded</p>
          <p style="font-size: var(--fs-xs);">Provide a location to log installations and surveys.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div class="address-item" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--spacing-md); display: flex; justify-content: space-between; align-items: start; background-color: var(--bg-app);">
        <div style="display: flex; gap: var(--spacing-sm); align-items: start;">
          <i data-lucide="map-pin" style="width: 20px; height: 20px; color: var(--primary); margin-top: 0.125rem;"></i>
          <div>
            <div style="font-weight: 600; display: flex; align-items: center; gap: var(--spacing-xs);">
              ${addr.isPrimary ? '<span class="badge badge-success" style="padding: 0.125rem 0.375rem; font-size: 0.65rem;">Primary</span>' : ''}
            </div>
            <p style="margin-top: 0.25rem; font-size: var(--fs-sm); color: var(--text-main);">
              ${addr.line1 ? addr.line1 + '<br>' : ''}
              ${addr.line2 ? addr.line2 + '<br>' : ''}
              ${addr.city}, ${addr.state} - ${addr.pincode}
              ${addr.country ? '<br>' + addr.country : ''}
            </p>
          </div>
        </div>
        <div style="display: flex; gap: var(--spacing-xs);">
          <button class="btn btn-secondary btn-sm edit-address-btn" data-id="${addr.id}" style="padding: 0.25rem 0.5rem; background-color: #fff;">
            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
          </button>
          ${hasPermission('address:delete') ? `
            <button class="btn btn-danger btn-sm delete-address-btn" data-id="${addr.id}" style="padding: 0.25rem 0.5rem; background-color: var(--danger-light); color: var(--danger-text); border-color: transparent;">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind Address Action Buttons
    container.querySelectorAll('.edit-address-btn').forEach(btn => {
      btn.onclick = () => showAddressFormModal(btn.dataset.id);
    });

    container.querySelectorAll('.delete-address-btn').forEach(btn => {
      btn.onclick = () => handleDeleteAddress(btn.dataset.id);
    });

  } catch (err) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center;">Failed to load addresses.</p>`;
  }
}

function showEditContactModal() {
  // Directly trigger the edit modal from contacts list handler helper
  import('./contacts.js').then(contactsModule => {
    // Modify contacts modal logic to refresh this view after saving
    const oldShowModal = showModal;
    // Intercept showModal save callback
    window.showModal = (title, bodyHtml, onSave, saveText) => {
      oldShowModal(title, bodyHtml, async (data) => {
        await onSave(data);
        await loadContactDetails();
        window.showModal = oldShowModal; // Restore
      }, saveText);
    };
    contactsModule.showContactFormModal(activeContactId);
  });
}

function showAddressFormModal(addressId = null) {
  const isEdit = addressId !== null;
  const title = isEdit ? 'Edit Address' : 'Add Address';

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="addr-line1">Address Line 1</label>
        <input type="text" id="addr-line1" name="line1" class="form-control" placeholder="123 Main St">
      </div>
      <div class="form-group">
        <label class="form-label" for="addr-line2">Address Line 2</label>
        <input type="text" id="addr-line2" name="line2" class="form-control" placeholder="Suite 100">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="addr-city">City *</label>
          <input type="text" id="addr-city" name="city" class="form-control" required placeholder="San Francisco">
        </div>
        <div class="form-group">
          <label class="form-label" for="addr-state">State *</label>
          <input type="text" id="addr-state" name="state" class="form-control" required placeholder="CA">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="addr-pincode">Pincode / ZIP *</label>
          <input type="text" id="addr-pincode" name="pincode" class="form-control" required placeholder="94107">
        </div>
        <div class="form-group">
          <label class="form-label" for="addr-country">Country</label>
          <input type="text" id="addr-country" name="country" class="form-control" placeholder="United States">
        </div>
      </div>
      <div class="form-group" style="flex-direction: row; align-items: center; gap: var(--spacing-sm); margin-top: var(--spacing-xs);">
        <input type="checkbox" id="addr-isPrimary" name="isPrimary" style="width: 16px; height: 16px;">
        <label class="form-label" for="addr-isPrimary" style="margin-bottom: 0;">Set as Primary Address</label>
      </div>
    </div>
  `;

  showModal(title, formHtml, async (data) => {
    if (!data.city || !data.state || !data.pincode) {
      throw new Error('Please fill in all required fields.');
    }

    const payload = {
      line1: data.line1 || undefined,
      line2: data.line2 || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country || undefined,
      isPrimary: data.isPrimary,
    };

    if (isEdit) {
      await api.patch(`/contacts/${activeContactId}/addresses/${addressId}`, payload);
      showToast('Success', 'Address updated successfully.', 'success');
    } else {
      await api.post(`/contacts/${activeContactId}/addresses`, payload);
      showToast('Success', 'Address added successfully.', 'success');
    }

    await loadAddresses();
  }, isEdit ? 'Save Changes' : 'Add Address');

  if (isEdit) {
    api.get(`/contacts/${activeContactId}/addresses/${addressId}`).then(addr => {
      const l1 = document.getElementById('addr-line1');
      const l2 = document.getElementById('addr-line2');
      const city = document.getElementById('addr-city');
      const state = document.getElementById('addr-state');
      const pin = document.getElementById('addr-pincode');
      const country = document.getElementById('addr-country');
      const prim = document.getElementById('addr-isPrimary');

      if (l1) l1.value = addr.line1 || '';
      if (l2) l2.value = addr.line2 || '';
      if (city) city.value = addr.city || '';
      if (state) state.value = addr.state || '';
      if (pin) pin.value = addr.pincode || '';
      if (country) country.value = addr.country || '';
      if (prim) prim.checked = addr.isPrimary || false;
    }).catch(err => {
      showToast('Error', 'Failed to retrieve address details', 'danger');
    });
  }
}

function handleDeleteAddress(addressId) {
  showConfirm(
    'Delete Address',
    'Are you sure you want to delete this address? This action cannot be undone.',
    async () => {
      await api.delete(`/contacts/${activeContactId}/addresses/${addressId}`);
      showToast('Success', 'Address deleted.', 'success');
      await loadAddresses();
    },
    'Delete'
  );
}
