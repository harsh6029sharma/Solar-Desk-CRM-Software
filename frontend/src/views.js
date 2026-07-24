import { api } from './api';
import { router } from './router';

// Toast helper
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'danger' ? 'x-circle' : 'info'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}

// Modal helper
function openModal(title, bodyHtml, footerHtml = '', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">${footerHtml}</div>
    </div>
  `;

  document.body.appendChild(overlay);
  if (window.lucide) window.lucide.createIcons();

  const close = () => {
    overlay.remove();
    if (onClose) onClose();
  };

  overlay.querySelector('#modal-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return {
    element: overlay,
    close
  };
}

// Format currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ----------------------------------------------------
// 1. LOGIN VIEW
// ----------------------------------------------------
export async function LoginView() {
  const container = document.createElement('div');
  container.className = 'login-container';
  
  container.innerHTML = `
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">S</div>
        <h2 class="login-title">SolarDesk</h2>
        <p class="login-subtitle">Sign in to manage solar assets and leads</p>
      </div>
      <form id="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input class="form-control" type="email" id="email" placeholder="admin@solardesk.com" required value="admin@solardesk.com" />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input class="form-control" type="password" id="password" placeholder="••••••••" required value="Admin@123" />
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:16px;" type="submit">
          Sign In
        </button>
      </form>
    </div>
  `;

  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#email').value;
    const password = container.querySelector('#password').value;

    try {
      await api.login(email, password);
      showToast('Logged in successfully', 'success');
      router.navigate('/');
    } catch (err) {
      showToast(err.message || 'Login failed. Check credentials.', 'danger');
    }
  });

  return container;
}

// ----------------------------------------------------
// 2. DASHBOARD VIEW
// ----------------------------------------------------
export async function DashboardView() {
  const container = document.createElement('div');
  
  // Set page title
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Dashboard Overview';
  }, 0);

  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:200px;">
      <div class="loading-spinner">Loading dashboard data...</div>
    </div>
  `;

  // Fetch stats concurrently
  try {
    const [leads, oppsData, productsData, contacts] = await Promise.all([
      api.leads.list(),
      api.opportunities.list(),
      api.products.list(),
      api.contacts.list(),
    ]);

    const opportunities = oppsData.opportunities || [];
    const products = productsData.products || [];

    const activeInstallations = opportunities.filter(o => o.stage === 'WON').length;
    const totalRevenue = opportunities.reduce((acc, curr) => acc + Number(curr.expectedRevenue || 0), 0);

    // Calculate lead status distribution
    const leadStatusCounts = { NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL_SENT: 0, NEGOTIATION: 0, WON: 0, LOST: 0 };
    leads.forEach(l => {
      if (leadStatusCounts[l.status] !== undefined) leadStatusCounts[l.status]++;
    });

    container.innerHTML = `
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Total Leads</span>
            <span class="stat-value">${leads.length}</span>
          </div>
          <div class="stat-icon primary"><i data-lucide="contact-2"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Opportunities</span>
            <span class="stat-value">${opportunities.length}</span>
          </div>
          <div class="stat-icon info"><i data-lucide="trending-up"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Pipeline Value</span>
            <span class="stat-value" style="font-size:1.5rem;">${formatCurrency(totalRevenue)}</span>
          </div>
          <div class="stat-icon success"><i data-lucide="indian-rupee"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">WON Installations</span>
            <span class="stat-value">${activeInstallations}</span>
          </div>
          <div class="stat-icon warning"><i data-lucide="activity"></i></div>
        </div>
      </div>

      <!-- Charts & Recent Activity -->
      <div class="dashboard-grid">
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="bar-chart-3"></i> Lead Status Distribution</h3>
          </div>
          <div class="panel-body">
            <canvas id="leads-chart" style="max-height: 280px;"></canvas>
          </div>
        </div>
        
        <div class="panel">
          <div class="panel-header">
            <h3 class="panel-title"><i data-lucide="history"></i> Recent Leads</h3>
          </div>
          <div class="panel-body">
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${leads.slice(0, 5).map(l => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border);">
                  <div>
                    <div style="font-weight:600;">${l.contact ? `${l.contact.firstName} ${l.contact.lastName || ''}` : 'Unknown'}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${formatDate(l.createdAt)}</div>
                  </div>
                  <span class="badge badge-${l.status.toLowerCase().replace('_', '-')}">${l.status.replace('_', ' ')}</span>
                </div>
              `).join('') || '<div style="color:var(--text-muted); text-align:center;">No recent leads</div>'}
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Render chart using Chart.js
    setTimeout(() => {
      const ctx = document.getElementById('leads-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(leadStatusCounts).map(k => k.replace('_', ' ')),
          datasets: [{
            label: 'Leads Count',
            data: Object.values(leadStatusCounts),
            backgroundColor: [
              'rgba(99, 102, 241, 0.45)', // NEW - primary
              'rgba(245, 158, 11, 0.45)', // CONTACTED - warning
              'rgba(168, 85, 247, 0.45)', // QUALIFIED - purple
              'rgba(236, 72, 153, 0.45)', // PROPOSAL_SENT - pink
              'rgba(59, 130, 246, 0.45)', // NEGOTIATION - blue
              'rgba(16, 185, 129, 0.45)', // WON - success
              'rgba(239, 68, 68, 0.45)'  // LOST - danger
            ],
            borderColor: [
              '#6366f1', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#ef4444'
            ],
            borderWidth: 1.5,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8' }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94a3b8', stepSize: 1 }
            }
          }
        }
      });
    }, 50);

  } catch (err) {
    showToast(err.message || 'Error loading dashboard data', 'danger');
    container.innerHTML = `<div style="color:var(--danger); padding:20px;">Failed to load dashboard metrics.</div>`;
  }

  return container;
}

// ----------------------------------------------------
// 3. CONTACTS VIEW
// ----------------------------------------------------
export async function ContactsView() {
  const container = document.createElement('div');
  
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Contacts Database';
  }, 0);

  const renderTable = async (search = '') => {
    const tableBody = container.querySelector('#contacts-table-body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading contacts...</td></tr>`;

    try {
      const contacts = await api.contacts.list({ search });
      tableBody.innerHTML = '';
      
      if (contacts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No contacts found</td></tr>`;
        return;
      }

      contacts.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${c.firstName} ${c.lastName || ''}</td>
          <td>${c.phone}</td>
          <td>${c.email || '-'}</td>
          <td>
            <span class="badge ${c.isActive ? 'badge-won' : 'badge-lost'}">
              ${c.isActive ? 'Active' : 'Deactivated'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-icon btn-edit" title="Edit Contact"><i data-lucide="edit-3"></i></button>
              <button class="btn-icon btn-address" title="Manage Addresses"><i data-lucide="map-pin"></i></button>
              ${c.isActive 
                ? `<button class="btn-icon btn-deactivate" title="Deactivate"><i data-lucide="trash-2"></i></button>`
                : ''
              }
            </div>
          </td>
        `;

        // Bind events
        row.querySelector('.btn-edit').addEventListener('click', () => editContactModal(c));
        row.querySelector('.btn-address').addEventListener('click', () => manageAddressesModal(c));
        const deactBtn = row.querySelector('.btn-deactivate');
        if (deactBtn) {
          deactBtn.addEventListener('click', async () => {
            if (confirm(`Deactivate contact ${c.firstName}?`)) {
              try {
                await api.contacts.delete(c.id);
                showToast('Contact deactivated successfully');
                renderTable(search);
              } catch (err) {
                showToast(err.message || 'Error deactivating contact', 'danger');
              }
            }
          });
        }

        tableBody.appendChild(row);
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      showToast(err.message || 'Error listing contacts', 'danger');
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger);">Error loading data</td></tr>`;
    }
  };

  container.innerHTML = `
    <!-- Top Filter & Search -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <i data-lucide="search" class="icon"></i>
        <input class="form-control" type="text" id="contact-search" placeholder="Search contacts by name, email, phone..." />
      </div>
      <button class="btn btn-primary" id="btn-create-contact">
        <i data-lucide="user-plus"></i> Add Contact
      </button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="contacts-table-body">
        </tbody>
      </table>
    </div>
  `;

  // Bind main page buttons
  container.querySelector('#btn-create-contact').addEventListener('click', () => createContactModal());
  
  let searchTimeout;
  container.querySelector('#contact-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderTable(e.target.value);
    }, 300);
  });

  // Render initial table
  renderTable();

  // Create Contact Modal
  const createContactModal = () => {
    const formHtml = `
      <form id="create-contact-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input class="form-control" type="text" id="modal-firstName" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input class="form-control" type="text" id="modal-lastName" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number *</label>
          <input class="form-control" type="tel" id="modal-phone" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-control" type="email" id="modal-email" />
        </div>
      </form>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-submit" type="submit" form="create-contact-form">Save Contact</button>
    `;

    const { close } = openModal('Create Contact', formHtml, footerHtml);

    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('create-contact-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('modal-firstName').value;
      const lastName = document.getElementById('modal-lastName').value;
      const phone = document.getElementById('modal-phone').value;
      const email = document.getElementById('modal-email').value || undefined;

      try {
        await api.contacts.create({ firstName, lastName, phone, email });
        showToast('Contact created successfully');
        close();
        renderTable();
      } catch (err) {
        showToast(err.message || 'Error creating contact', 'danger');
      }
    });
  };

  // Edit Contact Modal
  const editContactModal = (c) => {
    const formHtml = `
      <form id="edit-contact-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input class="form-control" type="text" id="modal-firstName" value="${c.firstName}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input class="form-control" type="text" id="modal-lastName" value="${c.lastName || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number *</label>
          <input class="form-control" type="tel" id="modal-phone" value="${c.phone}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-control" type="email" id="modal-email" value="${c.email || ''}" />
        </div>
      </form>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-submit" type="submit" form="edit-contact-form">Update Details</button>
    `;

    const { close } = openModal('Edit Contact', formHtml, footerHtml);

    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('edit-contact-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('modal-firstName').value;
      const lastName = document.getElementById('modal-lastName').value;
      const phone = document.getElementById('modal-phone').value;
      const email = document.getElementById('modal-email').value || undefined;

      try {
        await api.contacts.update(c.id, { firstName, lastName, phone, email });
        showToast('Contact updated successfully');
        close();
        renderTable();
      } catch (err) {
        showToast(err.message || 'Error updating contact', 'danger');
      }
    });
  };

  // Manage Addresses Modal
  const manageAddressesModal = async (c) => {
    const bodyHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h4 style="color:var(--text-muted);">Addresses of ${c.firstName}</h4>
        <button class="btn btn-primary btn-sm" id="btn-add-address"><i data-lucide="plus"></i> Add Address</button>
      </div>
      <div id="addresses-list-container" style="display:flex; flex-direction:column; gap:12px; max-height: 400px; overflow-y:auto;">
        Loading addresses...
      </div>
    `;

    const { close } = openModal(`Addresses Management`, bodyHtml, `<button class="btn btn-secondary" id="modal-done">Done</button>`);
    document.getElementById('modal-done').addEventListener('click', close);

    const renderAddressesList = async () => {
      const containerList = document.getElementById('addresses-list-container');
      containerList.innerHTML = 'Loading addresses...';
      try {
        const addresses = await api.contacts.listAddresses(c.id);
        containerList.innerHTML = '';
        if (addresses.length === 0) {
          containerList.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:20px 0;">No addresses added yet.</div>`;
          return;
        }
        addresses.forEach(a => {
          const item = document.createElement('div');
          item.className = 'card-item';
          item.innerHTML = `
            <div>
              <div style="font-weight:600;">${a.line1 || ''} ${a.line2 || ''}</div>
              <div style="color:var(--text-muted); font-size:0.8rem;">${a.city}, ${a.state} - ${a.pincode} (${a.country || 'India'})</div>
              ${a.isPrimary ? '<span class="badge badge-won" style="font-size:0.65rem; margin-top:4px;">Primary</span>' : ''}
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn-icon btn-edit-addr" title="Edit"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon btn-del-addr" title="Delete"><i data-lucide="trash"></i></button>
            </div>
          `;
          item.querySelector('.btn-edit-addr').addEventListener('click', () => editAddressForm(a));
          item.querySelector('.btn-del-addr').addEventListener('click', async () => {
            if (confirm('Delete this address?')) {
              try {
                await api.contacts.deleteAddress(c.id, a.id);
                showToast('Address deleted');
                renderAddressesList();
              } catch (err) {
                showToast(err.message || 'Error deleting address', 'danger');
              }
            }
          });
          containerList.appendChild(item);
        });
        if (window.lucide) window.lucide.createIcons();
      } catch (err) {
        containerList.innerHTML = `<div style="color:var(--danger);">Error loading addresses</div>`;
      }
    };

    // Add Address Form inside Modal
    const addAddressForm = () => {
      const addressFormHtml = `
        <form id="address-create-form">
          <div class="form-group">
            <label class="form-label">Line 1</label>
            <input class="form-control" type="text" id="addr-line1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Line 2</label>
            <input class="form-control" type="text" id="addr-line2" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">City *</label>
              <input class="form-control" type="text" id="addr-city" required />
            </div>
            <div class="form-group">
              <label class="form-label">State *</label>
              <input class="form-control" type="text" id="addr-state" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pincode *</label>
              <input class="form-control" type="text" id="addr-pincode" required />
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input class="form-control" type="text" id="addr-country" value="India" />
            </div>
          </div>
          <div class="form-group" style="flex-direction:row; align-items:center; gap:10px;">
            <input type="checkbox" id="addr-primary" />
            <label class="form-label" style="margin:0;">Set as Primary Address</label>
          </div>
        </form>
      `;

      const subModal = openModal('Add Address', addressFormHtml, `
        <button class="btn btn-secondary" id="sub-cancel">Back</button>
        <button class="btn btn-primary" id="sub-submit" type="submit" form="address-create-form">Save Address</button>
      `);

      document.getElementById('sub-cancel').addEventListener('click', subModal.close);
      document.getElementById('address-create-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const line1 = document.getElementById('addr-line1').value || undefined;
        const line2 = document.getElementById('addr-line2').value || undefined;
        const city = document.getElementById('addr-city').value;
        const state = document.getElementById('addr-state').value;
        const pincode = document.getElementById('addr-pincode').value;
        const country = document.getElementById('addr-country').value || undefined;
        const isPrimary = document.getElementById('addr-primary').checked;

        try {
          await api.contacts.createAddress(c.id, { line1, line2, city, state, pincode, country, isPrimary });
          showToast('Address added successfully');
          subModal.close();
          renderAddressesList();
        } catch (err) {
          showToast(err.message || 'Error adding address', 'danger');
        }
      });
    };

    // Edit Address Form
    const editAddressForm = (addr) => {
      const addressFormHtml = `
        <form id="address-edit-form">
          <div class="form-group">
            <label class="form-label">Line 1</label>
            <input class="form-control" type="text" id="addr-line1" value="${addr.line1 || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Line 2</label>
            <input class="form-control" type="text" id="addr-line2" value="${addr.line2 || ''}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">City *</label>
              <input class="form-control" type="text" id="addr-city" value="${addr.city}" required />
            </div>
            <div class="form-group">
              <label class="form-label">State *</label>
              <input class="form-control" type="text" id="addr-state" value="${addr.state}" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pincode *</label>
              <input class="form-control" type="text" id="addr-pincode" value="${addr.pincode}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input class="form-control" type="text" id="addr-country" value="${addr.country || 'India'}" />
            </div>
          </div>
          <div class="form-group" style="flex-direction:row; align-items:center; gap:10px;">
            <input type="checkbox" id="addr-primary" ${addr.isPrimary ? 'checked' : ''} />
            <label class="form-label" style="margin:0;">Set as Primary Address</label>
          </div>
        </form>
      `;

      const subModal = openModal('Edit Address', addressFormHtml, `
        <button class="btn btn-secondary" id="sub-cancel">Back</button>
        <button class="btn btn-primary" id="sub-submit" type="submit" form="address-edit-form">Update Address</button>
      `);

      document.getElementById('sub-cancel').addEventListener('click', subModal.close);
      document.getElementById('address-edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const line1 = document.getElementById('addr-line1').value || undefined;
        const line2 = document.getElementById('addr-line2').value || undefined;
        const city = document.getElementById('addr-city').value;
        const state = document.getElementById('addr-state').value;
        const pincode = document.getElementById('addr-pincode').value;
        const country = document.getElementById('addr-country').value || undefined;
        const isPrimary = document.getElementById('addr-primary').checked;

        try {
          await api.contacts.updateAddress(c.id, addr.id, { line1, line2, city, state, pincode, country, isPrimary });
          showToast('Address updated successfully');
          subModal.close();
          renderAddressesList();
        } catch (err) {
          showToast(err.message || 'Error updating address', 'danger');
        }
      });
    };

    document.getElementById('btn-add-address').addEventListener('click', addAddressForm);
    renderAddressesList();
  };

  return container;
}

// ----------------------------------------------------
// 4. LEADS VIEW
// ----------------------------------------------------
export async function LeadsView() {
  const container = document.createElement('div');
  
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Leads Management';
  }, 0);

  const renderLeads = async (statusFilter = '') => {
    const tableBody = container.querySelector('#leads-table-body');
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading leads pipeline...</td></tr>`;

    try {
      const leads = await api.leads.list(statusFilter ? { status: statusFilter } : {});
      tableBody.innerHTML = '';

      if (leads.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No leads matching search status.</td></tr>`;
        return;
      }

      leads.forEach(l => {
        const contactName = l.contact ? `${l.contact.firstName} ${l.contact.lastName || ''}`.trim() : 'Unknown';
        const assignedName = l.user ? `${l.user.firstName} ${l.user.lastName || ''}`.trim() : 'Unassigned';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${contactName}</td>
          <td>${l.source}</td>
          <td>${formatCurrency(l.budget)}</td>
          <td>${formatDate(l.expectedInstallation)}</td>
          <td>
            <select class="filter-select lead-status-select" style="font-weight:600; padding:4px 8px;">
              <option value="NEW" ${l.status === 'NEW' ? 'selected' : ''}>NEW</option>
              <option value="CONTACTED" ${l.status === 'CONTACTED' ? 'selected' : ''}>CONTACTED</option>
              <option value="QUALIFIED" ${l.status === 'QUALIFIED' ? 'selected' : ''}>QUALIFIED</option>
              <option value="PROPOSAL_SENT" ${l.status === 'PROPOSAL_SENT' ? 'selected' : ''}>PROPOSAL SENT</option>
              <option value="NEGOTIATION" ${l.status === 'NEGOTIATION' ? 'selected' : ''}>NEGOTIATION</option>
              <option value="WON" ${l.status === 'WON' ? 'selected' : ''}>WON</option>
              <option value="LOST" ${l.status === 'LOST' ? 'selected' : ''}>LOST</option>
            </select>
          </td>
          <td>${assignedName}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-icon btn-convert" title="Create Opportunity"><i data-lucide="arrow-right-left"></i></button>
              <button class="btn-icon btn-delete-lead" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;

        // Bind status change
        row.querySelector('.lead-status-select').addEventListener('change', async (e) => {
          const newStatus = e.target.value;
          try {
            await api.leads.updateStatus(l.id, newStatus);
            showToast(`Status updated to ${newStatus}`);
            if (newStatus === 'WON' || newStatus === 'QUALIFIED') {
              showToast('Create an Opportunity to push this lead into the sales pipeline.');
            }
          } catch (err) {
            showToast(err.message || 'Error updating status', 'danger');
            e.target.value = l.status; // Revert
          }
        });

        // Convert to Opportunity
        row.querySelector('.btn-convert').addEventListener('click', () => convertToOpportunityModal(l));

        // Delete lead
        row.querySelector('.btn-delete-lead').addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this lead?')) {
            try {
              await api.leads.delete(l.id);
              showToast('Lead deleted successfully');
              renderLeads(statusFilter);
            } catch (err) {
              showToast(err.message || 'Failed to delete lead', 'danger');
            }
          }
        });

        tableBody.appendChild(row);
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      showToast(err.message || 'Error fetching leads', 'danger');
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Error loading data</td></tr>`;
    }
  };

  container.innerHTML = `
    <!-- Top Filter Bar -->
    <div class="filter-bar">
      <div class="filters-group">
        <label class="form-label" style="margin:0;">Filter by Status:</label>
        <select class="filter-select" id="lead-filter-select">
          <option value="">All Leads</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="QUALIFIED">QUALIFIED</option>
          <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
          <option value="NEGOTIATION">NEGOTIATION</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>
      </div>
      <button class="btn btn-primary" id="btn-create-lead">
        <i data-lucide="plus"></i> Add Lead
      </button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Source</th>
            <th>Budget</th>
            <th>Est. Installation</th>
            <th>Status</th>
            <th>Assigned Consultant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="leads-table-body">
        </tbody>
      </table>
    </div>
  `;

  // Filter change binding
  container.querySelector('#lead-filter-select').addEventListener('change', (e) => {
    renderLeads(e.target.value);
  });

  // Create lead binding
  container.querySelector('#btn-create-lead').addEventListener('click', async () => {
    try {
      const [contacts, users, productsData] = await Promise.all([
        api.contacts.list(),
        api.users.list(),
        api.products.list()
      ]);

      const products = productsData.products || [];

      if (contacts.length === 0) {
        showToast('Please create at least one Contact before adding a Lead.', 'warning');
        router.navigate('/contacts');
        return;
      }

      const formHtml = `
        <form id="create-lead-form">
          <div class="form-group">
            <label class="form-label">Select Customer *</label>
            <select class="form-control" id="lead-contactId" required>
              ${contacts.map(c => `<option value="${c.id}">${c.firstName} ${c.lastName || ''} (${c.phone})</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Lead Source *</label>
              <select class="form-control" id="lead-source" required>
                <option value="WEBSITE">WEBSITE</option>
                <option value="FACEBOOK">FACEBOOK</option>
                <option value="GOOGLE_ADS">GOOGLE_ADS</option>
                <option value="REFERRAL">REFERRAL</option>
                <option value="WALK_IN">WALK_IN</option>
                <option value="PHONE_CALL">PHONE_CALL</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Budget (INR)</label>
              <input class="form-control" type="number" id="lead-budget" placeholder="e.g. 250000" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Expected Installation Date</label>
              <input class="form-control" type="date" id="lead-expectedInstallation" />
            </div>
            <div class="form-group">
              <label class="form-label">Assign To Consultant *</label>
              <select class="form-control" id="lead-assignedTo" required>
                ${users.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName || ''}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Associate Product (Optional)</label>
            <div style="display:flex; gap:12px;">
              <select class="form-control" id="lead-productId" style="flex:3;">
                <option value="">-- Select Product --</option>
                ${products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('')}
              </select>
              <input class="form-control" type="number" id="lead-productQty" value="1" min="1" style="flex:1;" />
            </div>
          </div>
        </form>
      `;

      const { close } = openModal('Create Lead Entry', formHtml, `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" type="submit" form="create-lead-form">Save Lead</button>
      `);

      document.getElementById('modal-cancel').addEventListener('click', close);
      document.getElementById('create-lead-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const contactId = document.getElementById('lead-contactId').value;
        const source = document.getElementById('lead-source').value;
        const budgetVal = document.getElementById('lead-budget').value;
        const budget = budgetVal ? Number(budgetVal) : undefined;
        const expectedInstallation = document.getElementById('lead-expectedInstallation').value || undefined;
        const assignedTo = document.getElementById('lead-assignedTo').value;

        const prodId = document.getElementById('lead-productId').value;
        const qty = Number(document.getElementById('lead-productQty').value);
        const leadProducts = prodId ? [{ productId: prodId, quantity: qty }] : undefined;

        try {
          await api.leads.create({ contactId, source, budget, expectedInstallation, assignedTo, leadProducts });
          showToast('Lead entry logged successfully');
          close();
          renderLeads();
        } catch (err) {
          showToast(err.message || 'Error saving lead', 'danger');
        }
      });

    } catch (err) {
      showToast(err.message || 'Failed to initialize form lists', 'danger');
    }
  });

  // Convert Lead to Opportunity Modal
  const convertToOpportunityModal = async (lead) => {
    try {
      const users = await api.users.list();
      const formHtml = `
        <form id="convert-lead-form">
          <div style="margin-bottom:16px; font-weight:500;">
            Converting lead of <span style="color:var(--primary);">${lead.contact ? lead.contact.firstName : 'Unknown'}</span> to an active Opportunity.
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sales Stage *</label>
              <select class="form-control" id="opp-stage" required>
                <option value="QUALIFICATION">QUALIFICATION</option>
                <option value="SITE_SURVEY">SITE SURVEY</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="NEGOTIATION">NEGOTIATION</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Assign To Sales Representative *</label>
              <select class="form-control" id="opp-assignedTo" required>
                ${users.map(u => `<option value="${u.id}" ${u.id === lead.assignedTo ? 'selected' : ''}>${u.firstName} ${u.lastName || ''}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Expected Revenue (INR)</label>
              <input class="form-control" type="number" id="opp-expectedRevenue" value="${lead.budget || ''}" placeholder="e.g. 350000" />
            </div>
            <div class="form-group">
              <label class="form-label">Winning Probability (%)</label>
              <input class="form-control" type="number" id="opp-probability" min="0" max="100" value="30" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Expected Close Date</label>
            <input class="form-control" type="date" id="opp-expectedCloseDate" />
          </div>
          <div class="form-group">
            <label class="form-label">Remarks</label>
            <textarea class="form-control" id="opp-remarks" rows="2" placeholder="Notes on roof conditions, client demands..."></textarea>
          </div>
        </form>
      `;

      const { close } = openModal('Promote to Opportunity', formHtml, `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" type="submit" form="convert-lead-form">Create Opportunity</button>
      `);

      document.getElementById('modal-cancel').addEventListener('click', close);
      document.getElementById('convert-lead-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const stage = document.getElementById('opp-stage').value;
        const assignedTo = document.getElementById('opp-assignedTo').value;
        const expectedRevenueVal = document.getElementById('opp-expectedRevenue').value;
        const expectedRevenue = expectedRevenueVal ? Number(expectedRevenueVal) : undefined;
        const probVal = document.getElementById('opp-probability').value;
        const probability = probVal ? Number(probVal) : undefined;
        const expectedCloseDate = document.getElementById('opp-expectedCloseDate').value || undefined;
        const remarks = document.getElementById('opp-remarks').value || undefined;

        try {
          await api.opportunities.create({
            leadId: lead.id,
            stage,
            assignedTo,
            expectedRevenue,
            probability,
            expectedCloseDate,
            remarks
          });
          // Also set the lead status to WON/QUALIFIED
          await api.leads.updateStatus(lead.id, stage === 'LOST' ? 'LOST' : 'QUALIFIED');
          
          showToast('Lead successfully promoted to Opportunity pipeline!');
          close();
          router.navigate('/opportunities');
        } catch (err) {
          showToast(err.message || 'Error creating opportunity', 'danger');
        }
      });

    } catch (err) {
      showToast(err.message || 'Failed to fetch sales representatives', 'danger');
    }
  };

  renderLeads();
  return container;
}

// ----------------------------------------------------
// 5. OPPORTUNITIES VIEW (KANBAN & SURVEYS & INSTALLATIONS)
// ----------------------------------------------------
export async function OpportunitiesView() {
  const container = document.createElement('div');
  
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Sales Opportunity Pipeline';
  }, 0);

  const renderKanban = async () => {
    container.innerHTML = `<div style="text-align:center; padding:50px;">Loading pipeline...</div>`;
    try {
      const oppsData = await api.opportunities.list();
      const opportunities = oppsData.opportunities || [];
      
      const columns = {
        QUALIFICATION: [],
        SITE_SURVEY: [],
        PROPOSAL: [],
        NEGOTIATION: [],
        WON: [],
        LOST: []
      };

      opportunities.forEach(o => {
        if (columns[o.stage]) columns[o.stage].push(o);
      });

      container.innerHTML = `
        <div class="pipeline-container">
          ${Object.entries(columns).map(([stageName, list]) => `
            <div class="pipeline-column" data-stage="${stageName}">
              <div class="column-header">
                <span class="column-title">${stageName.replace('_', ' ')}</span>
                <span class="column-count">${list.length}</span>
              </div>
              <div class="pipeline-cards">
                ${list.map(o => {
                  const custName = o.lead?.contact ? `${o.lead.contact.firstName} ${o.lead.contact.lastName || ''}`.trim() : 'Unknown';
                  return `
                    <div class="pipeline-card" data-id="${o.id}">
                      <div class="pipeline-card-title">${custName}</div>
                      <div class="pipeline-card-meta"><i data-lucide="user" style="width:12px; height:12px;"></i> ${o.assignedUser ? o.assignedUser.firstName : 'Unassigned'}</div>
                      <div class="pipeline-card-meta"><i data-lucide="calendar" style="width:12px; height:12px;"></i> Close: ${formatDate(o.expectedCloseDate)}</div>
                      <div class="pipeline-card-value">${formatCurrency(o.expectedRevenue)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Bind card clicks
      container.querySelectorAll('.pipeline-card').forEach(card => {
        card.addEventListener('click', () => {
          const oppId = card.getAttribute('data-id');
          const opp = opportunities.find(o => o.id === oppId);
          showOpportunityDetails(opp);
        });
      });

    } catch (err) {
      showToast(err.message || 'Error rendering Kanban Board', 'danger');
      container.innerHTML = `<div style="color:var(--danger); padding:20px;">Failed to load opportunity board.</div>`;
    }
  };

  // Detailed Modal for Opportunity
  const showOpportunityDetails = async (opp) => {
    const custName = opp.lead?.contact ? `${opp.lead.contact.firstName} ${opp.lead.contact.lastName || ''}`.trim() : 'Unknown';
    const email = opp.lead?.contact?.email || 'N/A';
    const phone = opp.lead?.contact?.phone || 'N/A';

    const modalBody = `
      <div class="tab-container">
        <button class="tab-btn active" id="tab-btn-details">Details</button>
        <button class="tab-btn" id="tab-btn-survey">Site Survey</button>
        <button class="tab-btn" id="tab-btn-install" ${opp.stage !== 'WON' ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>Installation</button>
      </div>

      <div id="opp-tab-content">
        <!-- Details Section -->
        <div class="detail-section" id="section-details">
          <div class="meta-info-grid">
            <div>
              <span class="meta-label">Customer</span>
              <div class="meta-value">${custName}</div>
            </div>
            <div>
              <span class="meta-label">Contact Details</span>
              <div class="meta-value">${phone} / ${email}</div>
            </div>
            <div>
              <span class="meta-label">Assigned Representative</span>
              <div class="meta-value">${opp.assignedUser ? `${opp.assignedUser.firstName} ${opp.assignedUser.lastName || ''}` : 'Unassigned'}</div>
            </div>
            <div>
              <span class="meta-label">Stage</span>
              <div class="meta-value">
                <select class="filter-select" id="detail-opp-stage" style="padding:4px 8px; width:100%;">
                  <option value="QUALIFICATION" ${opp.stage === 'QUALIFICATION' ? 'selected' : ''}>QUALIFICATION</option>
                  <option value="SITE_SURVEY" ${opp.stage === 'SITE_SURVEY' ? 'selected' : ''}>SITE SURVEY</option>
                  <option value="PROPOSAL" ${opp.stage === 'PROPOSAL' ? 'selected' : ''}>PROPOSAL</option>
                  <option value="NEGOTIATION" ${opp.stage === 'NEGOTIATION' ? 'selected' : ''}>NEGOTIATION</option>
                  <option value="WON" ${opp.stage === 'WON' ? 'selected' : ''}>WON</option>
                  <option value="LOST" ${opp.stage === 'LOST' ? 'selected' : ''}>LOST</option>
                </select>
              </div>
            </div>
            <div>
              <span class="meta-label">Expected Revenue</span>
              <div class="meta-value" style="color:#a5b4fc; font-weight:700;">${formatCurrency(opp.expectedRevenue)}</div>
            </div>
            <div>
              <span class="meta-label">Close probability</span>
              <div class="meta-value">${opp.probability || 0}%</div>
            </div>
          </div>
          
          <div class="form-group" style="margin-top:10px;">
            <span class="meta-label">Remarks / Sales Notes</span>
            <div class="meta-value" style="background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; font-style:italic;">
              ${opp.remarks || 'No remarks provided.'}
            </div>
          </div>
        </div>

        <!-- Survey Section -->
        <div class="detail-section" id="section-survey" style="display:none;">
          <div id="survey-data-container">
            Loading site survey specifications...
          </div>
        </div>

        <!-- Installation Section -->
        <div class="detail-section" id="section-install" style="display:none;">
          <div id="installation-data-container">
            Loading installation scheduling...
          </div>
        </div>
      </div>
    `;

    const { close } = openModal(`Opportunity: ${custName}`, modalBody, `
      <button class="btn btn-secondary" id="modal-close-details">Close</button>
      <button class="btn btn-primary" id="modal-save-details">Save Changes</button>
    `);

    document.getElementById('modal-close-details').addEventListener('click', close);
    
    // Stage Selector Change
    document.getElementById('detail-opp-stage').addEventListener('change', async (e) => {
      const newStage = e.target.value;
      try {
        await api.opportunities.updateStage(opp.id, newStage);
        opp.stage = newStage; // Update in-memory
        showToast(`Opportunity stage promoted to ${newStage}`);
        renderKanban();
        // Toggle installation tab if status is WON
        const instTab = document.getElementById('tab-btn-install');
        if (newStage === 'WON') {
          instTab.removeAttribute('disabled');
          instTab.style.opacity = '1';
          instTab.style.cursor = 'pointer';
        } else {
          instTab.setAttribute('disabled', 'true');
          instTab.style.opacity = '0.4';
          instTab.style.cursor = 'not-allowed';
        }
      } catch (err) {
        showToast(err.message || 'Failed to update stage', 'danger');
        e.target.value = opp.stage;
      }
    });

    // Save changes button (can be used to save other details if we expose edit form inputs)
    document.getElementById('modal-save-details').addEventListener('click', close);

    // Tab toggling logic
    const tabDetails = document.getElementById('tab-btn-details');
    const tabSurvey = document.getElementById('tab-btn-survey');
    const tabInstall = document.getElementById('tab-btn-install');

    const secDetails = document.getElementById('section-details');
    const secSurvey = document.getElementById('section-survey');
    const secInstall = document.getElementById('section-install');

    const resetTabs = () => {
      [tabDetails, tabSurvey, tabInstall].forEach(t => t.classList.remove('active'));
      [secDetails, secSurvey, secInstall].forEach(s => s.style.display = 'none');
    };

    tabDetails.addEventListener('click', () => {
      resetTabs();
      tabDetails.classList.add('active');
      secDetails.style.display = 'flex';
    });

    tabSurvey.addEventListener('click', () => {
      resetTabs();
      tabSurvey.classList.add('active');
      secSurvey.style.display = 'flex';
      loadSiteSurveyTab();
    });

    tabInstall.addEventListener('click', () => {
      if (tabInstall.hasAttribute('disabled')) return;
      resetTabs();
      tabInstall.classList.add('active');
      secInstall.style.display = 'flex';
      loadInstallationTab();
    });

    // --------------------------------------------------
    // SITE SURVEY TAB LOGIC
    // --------------------------------------------------
    const loadSiteSurveyTab = async () => {
      const containerSurvey = document.getElementById('survey-data-container');
      containerSurvey.innerHTML = 'Loading survey details...';
      try {
        let survey = null;
        try {
          survey = await api.opportunities.getSurvey(opp.id);
        } catch (e) {
          // If survey doesn't exist, we get a 404, which is expected
        }

        if (!survey) {
          containerSurvey.innerHTML = `
            <div style="text-align:center; padding:16px;">
              <p style="color:var(--text-muted); margin-bottom:12px;">No technical site survey exists for this opportunity.</p>
              <button class="btn btn-primary btn-sm" id="btn-create-survey"><i data-lucide="plus"></i> Log Site Survey</button>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
          document.getElementById('btn-create-survey').addEventListener('click', () => renderSurveyForm(null));
          return;
        }

        containerSurvey.innerHTML = `
          <div class="meta-info-grid" style="margin-bottom:16px;">
            <div>
              <span class="meta-label">Roof Type</span>
              <div class="meta-value">${survey.roofType || 'N/A'}</div>
            </div>
            <div>
              <span class="meta-label">Roof Area</span>
              <div class="meta-value">${survey.roofAreaSqFt ? `${survey.roofAreaSqFt} Sq.Ft` : 'N/A'}</div>
            </div>
            <div>
              <span class="meta-label">Sanctioned Load</span>
              <div class="meta-value">${survey.sanctionedLoadKw ? `${survey.sanctionedLoadKw} kW` : 'N/A'}</div>
            </div>
            <div>
              <span class="meta-label">Average Monthly Bill</span>
              <div class="meta-value">${formatCurrency(survey.monthlyBillAverage)}</div>
            </div>
            <div>
              <span class="meta-label">GPS Coordinates</span>
              <div class="meta-value">${survey.latitude ? `${survey.latitude}, ${survey.longitude}` : 'N/A'}</div>
            </div>
          </div>
          <div class="form-group">
            <span class="meta-label">Shadow Analysis Notes</span>
            <div class="meta-value" style="background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; font-style:italic;">
              ${survey.shadowAnalysis || 'No shadow limitations logged.'}
            </div>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-secondary btn-sm" id="btn-edit-survey"><i data-lucide="edit"></i> Edit Details</button>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        document.getElementById('btn-edit-survey').addEventListener('click', () => renderSurveyForm(survey));

      } catch (err) {
        containerSurvey.innerHTML = `<div style="color:var(--danger);">Failed to load survey data</div>`;
      }
    };

    const renderSurveyForm = (survey) => {
      const containerSurvey = document.getElementById('survey-data-container');
      containerSurvey.innerHTML = `
        <form id="survey-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Roof Type</label>
              <input class="form-control" type="text" id="srv-roofType" value="${survey?.roofType || ''}" placeholder="e.g. RCC Slab, Tin Shade" />
            </div>
            <div class="form-group">
              <label class="form-label">Roof Area (Sq.Ft)</label>
              <input class="form-control" type="number" step="0.1" id="srv-roofArea" value="${survey?.roofAreaSqFt || ''}" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sanctioned Load (kW)</label>
              <input class="form-control" type="number" step="0.1" id="srv-load" value="${survey?.sanctionedLoadKw || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Avg Monthly Bill (INR)</label>
              <input class="form-control" type="number" id="srv-bill" value="${survey?.monthlyBillAverage || ''}" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Latitude</label>
              <input class="form-control" type="number" step="0.000001" id="srv-lat" value="${survey?.latitude || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Longitude</label>
              <input class="form-control" type="number" step="0.000001" id="srv-lng" value="${survey?.longitude || ''}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Shadow Analysis Notes</label>
            <textarea class="form-control" id="srv-shadow" rows="2">${survey?.shadowAnalysis || ''}</textarea>
          </div>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn btn-secondary btn-sm" type="button" id="srv-cancel">Cancel</button>
            <button class="btn btn-primary btn-sm" type="submit">Save Survey</button>
          </div>
        </form>
      `;

      document.getElementById('srv-cancel').addEventListener('click', loadSiteSurveyTab);
      document.getElementById('survey-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const roofType = document.getElementById('srv-roofType').value || undefined;
        const roofAreaVal = document.getElementById('srv-roofArea').value;
        const roofAreaSqFt = roofAreaVal ? Number(roofAreaVal) : undefined;
        const loadVal = document.getElementById('srv-load').value;
        const sanctionedLoadKw = loadVal ? Number(loadVal) : undefined;
        const billVal = document.getElementById('srv-bill').value;
        const monthlyBillAverage = billVal ? Number(billVal) : undefined;
        const latVal = document.getElementById('srv-lat').value;
        const latitude = latVal ? Number(latVal) : undefined;
        const lngVal = document.getElementById('srv-lng').value;
        const longitude = lngVal ? Number(lngVal) : undefined;
        const shadowAnalysis = document.getElementById('srv-shadow').value || undefined;

        try {
          if (survey) {
            await api.opportunities.updateSurvey(opp.id, { roofType, roofAreaSqFt, sanctionedLoadKw, monthlyBillAverage, latitude, longitude, shadowAnalysis });
            showToast('Site survey updated successfully');
          } else {
            await api.opportunities.createSurvey(opp.id, { roofType, roofAreaSqFt, sanctionedLoadKw, monthlyBillAverage, latitude, longitude, shadowAnalysis });
            showToast('Site survey logged successfully');
          }
          loadSiteSurveyTab();
        } catch (err) {
          showToast(err.message || 'Error saving survey', 'danger');
        }
      });
    };

    // --------------------------------------------------
    // INSTALLATION TAB LOGIC
    // --------------------------------------------------
    const loadInstallationTab = async () => {
      const containerInstall = document.getElementById('installation-data-container');
      containerInstall.innerHTML = 'Loading installation status...';
      try {
        let install = null;
        try {
          install = await api.installations.get(opp.id);
        } catch (e) {
          // 404 is expected if not scheduled yet
        }

        if (!install) {
          // We need a Quotation accepted to schedule installation
          const quotationsData = await api.quotations.list({ opportunityId: opp.id });
          const quotations = quotationsData.quotations || [];
          const acceptedQuote = quotations.find(q => q.status === 'ACCEPTED');

          if (!acceptedQuote) {
            containerInstall.innerHTML = `
              <div style="text-align:center; padding:16px;">
                <p style="color:var(--text-muted); margin-bottom:12px;">You must have an <b>ACCEPTED</b> quotation for this opportunity before scheduling installation.</p>
                <button class="btn btn-primary btn-sm" id="btn-goto-quotations"><i data-lucide="file-text"></i> Create / Manage Quotations</button>
              </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('btn-goto-quotations').addEventListener('click', () => {
              close();
              router.navigate('/quotations');
            });
            return;
          }

          // Let's get contacts addresses to select one
          const addresses = await api.contacts.listAddresses(opp.lead.contactId);
          if (addresses.length === 0) {
            containerInstall.innerHTML = `
              <div style="text-align:center; padding:16px;">
                <p style="color:var(--text-muted); margin-bottom:12px;">Customer must have at least one Address added to schedule installation.</p>
                <button class="btn btn-secondary btn-sm" id="btn-goto-cust-addr"><i data-lucide="map-pin"></i> Manage Customer Addresses</button>
              </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            document.getElementById('btn-goto-cust-addr').addEventListener('click', () => {
              close();
              router.navigate('/contacts');
            });
            return;
          }

          containerInstall.innerHTML = `
            <div style="text-align:center; padding:16px;">
              <p style="color:var(--text-muted); margin-bottom:12px;">Quotation <b>${acceptedQuote.quotationNumber}</b> has been accepted! Ready to schedule solar mounting.</p>
              <button class="btn btn-primary btn-sm" id="btn-schedule-install"><i data-lucide="calendar"></i> Schedule Installation</button>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
          document.getElementById('btn-schedule-install').addEventListener('click', () => renderInstallForm(acceptedQuote, addresses));
          return;
        }

        // Render Scheduled Installation Detail
        containerInstall.innerHTML = `
          <div class="meta-info-grid" style="margin-bottom:16px;">
            <div>
              <span class="meta-label">Job Number</span>
              <div class="meta-value">${install.installationNumber}</div>
            </div>
            <div>
              <span class="meta-label">Status</span>
              <div class="meta-value">
                <select class="filter-select" id="install-status-select" style="padding:4px 8px; width:100%;">
                  <option value="SCHEDULED" ${install.status === 'SCHEDULED' ? 'selected' : ''}>SCHEDULED</option>
                  <option value="IN_PROGRESS" ${install.status === 'IN_PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                  <option value="COMPLETED" ${install.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
                  <option value="CANCELLED" ${install.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                </select>
              </div>
            </div>
            <div>
              <span class="meta-label">Scheduled Date</span>
              <div class="meta-value">${formatDate(install.scheduledDate)}</div>
            </div>
            <div>
              <span class="meta-label">Remarks</span>
              <div class="meta-value">${install.remarks || 'No notes logged.'}</div>
            </div>
          </div>

          <div style="border-top:1px solid var(--border); padding-top:16px; margin-top:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h5 style="margin:0; font-size:0.9rem;">Maintenance AMCs & Tickets</h5>
              <button class="btn btn-secondary btn-sm" id="btn-create-sr"><i data-lucide="plus"></i> Log Service Ticket</button>
            </div>
            <div id="service-requests-container" style="display:flex; flex-direction:column; gap:8px;">
              Loading tickets...
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();

        // Status change
        document.getElementById('install-status-select').addEventListener('change', async (e) => {
          const newStatus = e.target.value;
          try {
            await api.installations.updateStatus(opp.id, newStatus);
            showToast(`Installation updated to ${newStatus}`);
            loadInstallationTab();
          } catch (err) {
            showToast(err.message || 'Error updating status', 'danger');
            e.target.value = install.status;
          }
        });

        // Load service tickets
        renderServiceRequests(opp.id);

        document.getElementById('btn-create-sr').addEventListener('click', () => createServiceTicketForm(opp.id));

      } catch (err) {
        containerInstall.innerHTML = `<div style="color:var(--danger);">Failed to load installation layout.</div>`;
      }
    };

    const renderInstallForm = (quote, addresses) => {
      const containerInstall = document.getElementById('installation-data-container');
      containerInstall.innerHTML = `
        <form id="install-form">
          <div class="form-group">
            <label class="form-label">Installation Site Address *</label>
            <select class="form-control" id="inst-addressId" required>
              ${addresses.map(a => `<option value="${a.id}">${a.line1 || ''}, ${a.city} (${a.pincode})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Scheduled Date *</label>
            <input class="form-control" type="date" id="inst-scheduledDate" required />
          </div>
          <div class="form-group">
            <label class="form-label">Project Instructions / Remarks</label>
            <textarea class="form-control" id="inst-remarks" rows="2" placeholder="e.g. Bring safety harnesses, heavy cabling needed"></textarea>
          </div>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn btn-secondary btn-sm" type="button" id="inst-cancel">Cancel</button>
            <button class="btn btn-primary btn-sm" type="submit">Schedule Project</button>
          </div>
        </form>
      `;

      document.getElementById('inst-cancel').addEventListener('click', loadInstallationTab);
      document.getElementById('install-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const addressId = document.getElementById('inst-addressId').value;
        const scheduledDate = document.getElementById('inst-scheduledDate').value;
        const remarks = document.getElementById('inst-remarks').value || undefined;

        try {
          await api.installations.create(opp.id, {
            quotationId: quote.id,
            contactId: opp.lead.contactId,
            addressId,
            scheduledDate,
            remarks
          });
          showToast('Solar installation project scheduled successfully');
          loadInstallationTab();
        } catch (err) {
          showToast(err.message || 'Error scheduling installation', 'danger');
        }
      });
    };

    const renderServiceRequests = async (oppId) => {
      const srContainer = document.getElementById('service-requests-container');
      srContainer.innerHTML = 'Loading service logs...';
      try {
        const srList = await api.installations.listServiceRequests(oppId);
        srContainer.innerHTML = '';
        if (srList.length === 0) {
          srContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:10px 0;">No active service support tickets.</div>`;
          return;
        }

        srList.forEach(ticket => {
          const item = document.createElement('div');
          item.className = 'card-item';
          item.innerHTML = `
            <div>
              <div style="font-weight:600;">${ticket.ticketNumber} - ${ticket.title}</div>
              <div style="color:var(--text-muted); font-size:0.75rem;">${ticket.description || 'No description'}</div>
              <div style="margin-top:4px;">
                <span class="badge badge-priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                <span class="badge badge-${ticket.status.toLowerCase().replace('_', '-')}">${ticket.status}</span>
              </div>
            </div>
            <div>
              ${ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED'
                ? `<button class="btn btn-secondary btn-sm" class="btn-resolve-ticket" id="btn-resolve-${ticket.id}">Resolve</button>`
                : ''
              }
            </div>
          `;
          
          const resBtn = item.querySelector(`#btn-resolve-${ticket.id}`);
          if (resBtn) {
            resBtn.addEventListener('click', async () => {
              try {
                await api.serviceRequests.updateStatus(oppId, ticket.id, 'RESOLVED');
                showToast('Ticket marked as RESOLVED');
                renderServiceRequests(oppId);
              } catch (err) {
                showToast(err.message || 'Failed to update ticket', 'danger');
              }
            });
          }
          srContainer.appendChild(item);
        });

      } catch (err) {
        srContainer.innerHTML = `<div style="color:var(--danger); font-size:0.8rem;">Error loading tickets.</div>`;
      }
    };

    const createServiceTicketForm = (oppId) => {
      const containerInstall = document.getElementById('installation-data-container');
      containerInstall.innerHTML = `
        <form id="sr-form">
          <h5 style="margin-bottom:16px;">Log New Support Ticket</h5>
          <div class="form-group">
            <label class="form-label">Ticket Title *</label>
            <input class="form-control" type="text" id="sr-title" required placeholder="e.g. Inverter not powering up" />
          </div>
          <div class="form-group">
            <label class="form-label">Detailed Fault Description</label>
            <textarea class="form-control" id="sr-desc" rows="3" placeholder="e.g. Error code F02 is showing, system shuts off at noon"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Priority Level *</label>
            <select class="form-control" id="sr-priority" required>
              <option value="LOW">LOW</option>
              <option value="MEDIUM" selected>MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn btn-secondary btn-sm" type="button" id="sr-cancel">Cancel</button>
            <button class="btn btn-primary btn-sm" type="submit">Submit Ticket</button>
          </div>
        </form>
      `;

      document.getElementById('sr-cancel').addEventListener('click', loadInstallationTab);
      document.getElementById('sr-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('sr-title').value;
        const description = document.getElementById('sr-desc').value || undefined;
        const priority = document.getElementById('sr-priority').value;

        try {
          await api.installations.createServiceRequest(oppId, { title, description, priority });
          showToast('Service ticket registered successfully');
          loadInstallationTab();
        } catch (err) {
          showToast(err.message || 'Error submitting ticket', 'danger');
        }
      });
    };
  };

  renderKanban();
  return container;
}

// ----------------------------------------------------
// 6. QUOTATIONS VIEW
// ----------------------------------------------------
export async function QuotationsView() {
  const container = document.createElement('div');
  
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Quotations Manager';
  }, 0);

  const renderQuotes = async () => {
    const tableBody = container.querySelector('#quotes-table-body');
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading quotations...</td></tr>`;

    try {
      const quotesData = await api.quotations.list();
      const quotes = quotesData.quotations || [];
      tableBody.innerHTML = '';

      if (quotes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No quotations drafted yet.</td></tr>`;
        return;
      }

      quotes.forEach(q => {
        const oppName = q.opportunity?.lead?.contact 
          ? `${q.opportunity.lead.contact.firstName} ${q.opportunity.lead.contact.lastName || ''}`.trim()
          : 'Unknown';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${q.quotationNumber}</td>
          <td>${oppName}</td>
          <td>${formatCurrency(q.totalAmount)}</td>
          <td>${formatDate(q.validTill)}</td>
          <td>
            <select class="filter-select quote-status-select" style="font-weight:600; padding:4px 8px;">
              <option value="DRAFT" ${q.status === 'DRAFT' ? 'selected' : ''}>DRAFT</option>
              <option value="SENT" ${q.status === 'SENT' ? 'selected' : ''}>SENT</option>
              <option value="ACCEPTED" ${q.status === 'ACCEPTED' ? 'selected' : ''}>ACCEPTED</option>
              <option value="REJECTED" ${q.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
            </select>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn-icon btn-view-quote" title="View details"><i data-lucide="eye"></i></button>
              <button class="btn-icon btn-delete-quote" title="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;

        // Bind status changes
        row.querySelector('.quote-status-select').addEventListener('change', async (e) => {
          const newStatus = e.target.value;
          try {
            await api.quotations.updateStatus(q.id, newStatus);
            showToast(`Quotation status updated to ${newStatus}`);
          } catch (err) {
            showToast(err.message || 'Error updating status', 'danger');
            e.target.value = q.status;
          }
        });

        // View detail modal
        row.querySelector('.btn-view-quote').addEventListener('click', () => showQuoteDetailModal(q));

        // Delete quote
        row.querySelector('.btn-delete-quote').addEventListener('click', async () => {
          if (confirm('Delete this quotation?')) {
            try {
              await api.quotations.delete(q.id);
              showToast('Quotation deleted successfully');
              renderQuotes();
            } catch (err) {
              showToast(err.message || 'Failed to delete quotation', 'danger');
            }
          }
        });

        tableBody.appendChild(row);
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      showToast(err.message || 'Error listing quotations', 'danger');
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Error loading data</td></tr>`;
    }
  };

  container.innerHTML = `
    <!-- Top actions -->
    <div class="filter-bar" style="justify-content: flex-end;">
      <button class="btn btn-primary" id="btn-create-quote">
        <i data-lucide="plus"></i> New Quotation
      </button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Quotation Number</th>
            <th>Opportunity Customer</th>
            <th>Total Price</th>
            <th>Valid Till</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="quotes-table-body">
        </tbody>
      </table>
    </div>
  `;

  // Create Quote binding
  container.querySelector('#btn-create-quote').addEventListener('click', async () => {
    try {
      const [oppsData, productsData] = await Promise.all([
        api.opportunities.list(),
        api.products.list()
      ]);

      const opps = oppsData.opportunities || [];
      const products = productsData.products || [];

      if (opps.length === 0) {
        showToast('Please create at least one Sales Opportunity before drafting a Quotation.', 'warning');
        router.navigate('/opportunities');
        return;
      }

      if (products.length === 0) {
        showToast('No products available to quote.', 'warning');
        return;
      }

      const formHtml = `
        <form id="create-quote-form">
          <div class="form-group">
            <label class="form-label">Select Active Opportunity *</label>
            <select class="form-control" id="quote-opportunityId" required>
              ${opps.map(o => {
                const custName = o.lead?.contact ? `${o.lead.contact.firstName} ${o.lead.contact.lastName || ''}`.trim() : 'Unknown';
                return `<option value="${o.id}">${custName} (${o.stage})</option>`;
              }).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Valid Till Date</label>
            <input class="form-control" type="date" id="quote-validTill" />
          </div>
          
          <div style="border-top:1px solid var(--border); padding-top:16px; margin-top:16px;">
            <h5 style="margin-bottom:12px;">Quotation Items</h5>
            <div id="quote-items-wrapper">
              <div class="quote-item-row" id="row-0">
                <div class="form-group">
                  <label class="form-label">Select Solar Product *</label>
                  <select class="form-control prod-select" required>
                    ${products.map(p => `<option value="${p.id}" data-price="${p.basePrice}">${p.name} - ${formatCurrency(p.basePrice)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Qty *</label>
                  <input class="form-control qty-input" type="number" value="1" min="1" required />
                </div>
                <button class="btn btn-secondary btn-icon btn-remove-row" style="margin-bottom:20px;" type="button" disabled>&times;</button>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-quote-row" type="button" style="margin-top:10px;">
              <i data-lucide="plus"></i> Add Item Row
            </button>
          </div>
        </form>
      `;

      const { close } = openModal('Draft Quotation Proposal', formHtml, `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" type="submit" form="create-quote-form">Generate Proposal</button>
      `);

      document.getElementById('modal-cancel').addEventListener('click', close);
      
      const itemsWrapper = document.getElementById('quote-items-wrapper');
      let rowCounter = 0;

      // Add Row logic
      document.getElementById('btn-add-quote-row').addEventListener('click', () => {
        rowCounter++;
        const newRow = document.createElement('div');
        newRow.className = 'quote-item-row';
        newRow.id = `row-${rowCounter}`;
        newRow.innerHTML = `
          <div class="form-group">
            <select class="form-control prod-select" required>
              ${products.map(p => `<option value="${p.id}" data-price="${p.basePrice}">${p.name} - ${formatCurrency(p.basePrice)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <input class="form-control qty-input" type="number" value="1" min="1" required />
          </div>
          <button class="btn btn-secondary btn-icon btn-remove-row" type="button">&times;</button>
        `;
        
        newRow.querySelector('.btn-remove-row').addEventListener('click', () => {
          newRow.remove();
        });
        itemsWrapper.appendChild(newRow);
      });

      document.getElementById('create-quote-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const opportunityId = document.getElementById('quote-opportunityId').value;
        const validTill = document.getElementById('quote-validTill').value || undefined;

        // Map items
        const itemRows = itemsWrapper.querySelectorAll('.quote-item-row');
        const items = Array.from(itemRows).map(row => {
          const productId = row.querySelector('.prod-select').value;
          const quantity = Number(row.querySelector('.qty-input').value);
          return { productId, quantity };
        });

        try {
          await api.quotations.create({ opportunityId, validTill, items });
          showToast('Quotation proposal generated successfully');
          close();
          renderQuotes();
        } catch (err) {
          showToast(err.message || 'Error generating quotation', 'danger');
        }
      });

      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      showToast(err.message || 'Failed to initialize quotation builder list', 'danger');
    }
  });

  const showQuoteDetailModal = (quote) => {
    const oppName = quote.opportunity?.lead?.contact 
      ? `${quote.opportunity.lead.contact.firstName} ${quote.opportunity.lead.contact.lastName || ''}`.trim()
      : 'Unknown';

    const itemsHtml = quote.items ? quote.items.map(item => `
      <div class="card-item" style="margin-bottom:8px;">
        <div>
          <div style="font-weight:600;">${item.productNameSnapshot}</div>
          <div style="color:var(--text-muted); font-size:0.8rem;">Price: ${formatCurrency(item.unitPriceSnapshot)} x ${item.quantity} Qty</div>
        </div>
        <div style="font-weight:700; color:#c7d2fe;">${formatCurrency(item.totalPrice)}</div>
      </div>
    `).join('') : '<div style="color:var(--text-muted);">No items listed</div>';

    const detailHtml = `
      <div class="meta-info-grid" style="margin-bottom:20px;">
        <div>
          <span class="meta-label">Quote ID</span>
          <div class="meta-value">${quote.quotationNumber}</div>
        </div>
        <div>
          <span class="meta-label">Customer Opportunity</span>
          <div class="meta-value">${oppName}</div>
        </div>
        <div>
          <span class="meta-label">Status</span>
          <div class="meta-value">${quote.status}</div>
        </div>
        <div>
          <span class="meta-label">Valid Till</span>
          <div class="meta-value">${formatDate(quote.validTill)}</div>
        </div>
      </div>
      <h5 style="margin-bottom:12px;">Drafted Solar Component Items</h5>
      ${itemsHtml}
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:16px; margin-top:16px;">
        <span style="font-weight:600; font-size:1.05rem;">Quotation Grand Total</span>
        <span style="font-weight:800; font-size:1.3rem; color:#818cf8;">${formatCurrency(quote.totalAmount)}</span>
      </div>
    `;

    openModal('Quotation Summary Details', detailHtml, `<button class="btn btn-primary" id="modal-close-quote-details">Done</button>`);
    document.getElementById('modal-close-quote-details').addEventListener('click', () => {
      const modalOverlay = document.getElementById('modal-overlay');
      if (modalOverlay) modalOverlay.remove();
    });
  };

  renderQuotes();
  return container;
}

// ----------------------------------------------------
// 7. PRODUCTS VIEW
// ----------------------------------------------------
export async function ProductsView() {
  const container = document.createElement('div');
  
  setTimeout(() => {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.innerText = 'Solar Inventory Catalog';
  }, 0);

  const renderProducts = async () => {
    const tableBody = container.querySelector('#products-table-body');
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading products catalog...</td></tr>`;

    try {
      const productsData = await api.products.list();
      const products = productsData.products || [];
      tableBody.innerHTML = '';

      if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No products found in inventory.</td></tr>`;
        return;
      }

      products.forEach(p => {
        const catName = p.category ? p.category.name : '-';
        const manName = p.manufacturer ? p.manufacturer.name : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${p.name}</td>
          <td>${p.sku}</td>
          <td><span class="badge badge-negotiation">${catName}</span></td>
          <td>${manName}</td>
          <td>${p.capacity}</td>
          <td style="font-weight:700; color:#34d399;">${formatCurrency(p.basePrice)}</td>
        `;
        tableBody.appendChild(row);
      });

      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      showToast(err.message || 'Error listing products', 'danger');
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger);">Error loading data</td></tr>`;
    }
  };

  container.innerHTML = `
    <!-- Inventory Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Manufacturer</th>
            <th>Capacity</th>
            <th>Base Price</th>
          </tr>
        </thead>
        <tbody id="products-table-body">
        </tbody>
      </table>
    </div>
  `;

  renderProducts();
  return container;
}
