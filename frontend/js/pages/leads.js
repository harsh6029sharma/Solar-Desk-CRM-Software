import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

let users = [];
let contacts = [];
let products = [];
let activeTab = 'ALL';

export async function initLeads() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Toolbar & Status Tabs -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
        
        <!-- Status Tabs -->
        <div style="display: flex; gap: var(--spacing-xs); background-color: var(--border-color); padding: 2px; border-radius: var(--radius-md);">
          ${['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'].map(tab => `
            <button class="lead-tab btn ${tab === activeTab ? 'btn-primary' : 'btn-secondary'}" data-tab="${tab}" style="padding: 0.375rem 0.75rem; border: none; font-size: var(--fs-xs); box-shadow: none;">
              ${tab.replace('_', ' ')}
            </button>
          `).join('')}
        </div>
        
        ${hasPermission('lead:create') ? `
          <button id="add-lead-btn" class="btn btn-primary">
            <i data-lucide="plus"></i> Add Lead
          </button>
        ` : ''}
      </div>

      <!-- Table Card -->
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Customer Contact</th>
                <th>Source</th>
                <th>Budget</th>
                <th>Expected Install</th>
                <th>Assigned Rep</th>
                <th>Status</th>
                <th style="width: 180px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="leads-table-body">
              <tr>
                <td colspan="7" style="text-align: center; padding: var(--spacing-xl);">
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

  // Load select options first
  await Promise.all([
    loadContacts(),
    loadUsers(),
    loadProducts()
  ]);

  // Bind Tabs
  document.querySelectorAll('.lead-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.lead-tab').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
      activeTab = btn.dataset.tab;
      fetchAndRenderLeads();
    };
  });

  // Bind Add Button
  const addBtn = document.getElementById('add-lead-btn');
  if (addBtn) addBtn.onclick = () => showLeadFormModal();

  fetchAndRenderLeads();
}

async function loadContacts() {
  try {
    contacts = await api.get('/contacts?isActive=true');
  } catch (e) {
    showToast('Error', 'Failed to retrieve active contacts list', 'danger');
  }
}

async function loadUsers() {
  try {
    users = await api.get('/users');
  } catch (e) {
    showToast('Error', 'Failed to retrieve employees list', 'danger');
  }
}

async function loadProducts() {
  try {
    const res = await api.get('/products?isActive=true&limit=100');
    products = res.products || [];
  } catch (e) {
    showToast('Error', 'Failed to retrieve products list', 'danger');
  }
}

async function fetchAndRenderLeads() {
  const tbody = document.getElementById('leads-table-body');
  if (!tbody) return;

  try {
    const url = activeTab === 'ALL' ? '/leads' : `/leads?status=${activeTab}`;
    const leads = await api.get(url);

    if (leads.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
            <div class="empty-state" style="padding: 0;">
              <i data-lucide="zap"></i>
              <p class="empty-state-title">No leads in this stage</p>
              <p style="font-size: var(--fs-xs);">Create a lead to start tracking conversions.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = leads.map(l => {
      const contactName = l.contact ? `${l.contact.firstName} ${l.contact.lastName || ''}` : 'N/A';
      const repName = l.user ? `${l.user.firstName} ${l.user.lastName || ''}` : 'Unassigned';
      const budgetStr = l.budget ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(l.budget) : 'N/A';
      const dateStr = l.expectedInstallation ? new Date(l.expectedInstallation).toLocaleDateString() : 'N/A';
      
      let statusBadge = 'badge-info';
      if (l.status === 'WON') statusBadge = 'badge-success';
      if (l.status === 'LOST') statusBadge = 'badge-danger';
      if (l.status === 'NEGOTIATION' || l.status === 'PROPOSAL_SENT') statusBadge = 'badge-warning';

      return `
        <tr>
          <td style="font-weight: 600;">${contactName}</td>
          <td style="font-size: var(--fs-xs); font-weight: 500;">${l.source}</td>
          <td>${budgetStr}</td>
          <td>${dateStr}</td>
          <td>${repName}</td>
          <td>
            <select class="lead-status-select form-control" data-id="${l.id}" style="padding: 0.125rem 0.5rem; font-size: var(--fs-xs); font-weight: 600; width: auto; height: auto;">
              ${['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'].map(st => `
                <option value="${st}" ${l.status === st ? 'selected' : ''}>${st.replace('_', ' ')}</option>
              `).join('')}
            </select>
          </td>
          <td style="text-align: right; display: flex; gap: var(--spacing-sm); justify-content: flex-end; align-items: center;">
            ${l.status === 'WON' ? `
              <button class="btn btn-primary btn-sm convert-lead-btn" data-id="${l.id}" data-rep="${l.assignedTo || ''}" title="Convert to Opportunity" style="padding: 0.25rem 0.5rem; font-size: var(--fs-xs);">
                <i data-lucide="trending-up" style="width: 12px; height: 12px;"></i> Convert
              </button>
            ` : ''}
            <button class="btn btn-secondary btn-sm delete-lead-row" data-id="${l.id}" title="Archive" style="padding: 0.25rem 0.5rem; background-color: var(--danger-light); color: var(--danger-text); border-color: transparent;">
              <i data-lucide="archive" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind Status Selection Change
    tbody.querySelectorAll('.lead-status-select').forEach(select => {
      select.onchange = async () => {
        try {
          await api.patch(`/leads/${select.dataset.id}/status`, { status: select.value });
          showToast('Status Updated', 'Lead status successfully transitioned.', 'success');
          fetchAndRenderLeads();
        } catch (err) {
          showToast('Error', err.message || 'Status transition failed', 'danger');
          fetchAndRenderLeads();
        }
      };
    });

    // Bind Convert button
    tbody.querySelectorAll('.convert-lead-btn').forEach(btn => {
      btn.onclick = () => showConvertOpportunityModal(btn.dataset.id, btn.dataset.rep);
    });

    // Bind Delete
    tbody.querySelectorAll('.delete-lead-row').forEach(btn => {
      btn.onclick = () => handleDeleteLead(btn.dataset.id);
    });

  } catch (err) {
    showToast('Fetch Failed', err.message, 'danger');
  }
}

function showLeadFormModal() {
  const contactOpts = contacts.map(c => `<option value="${c.id}">${c.firstName} ${c.lastName || ''} (${c.phone})</option>`).join('');
  const userOpts = users.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName || ''}</option>`).join('');
  const productItems = products.map(p => `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-sm); padding: var(--spacing-xs) 0; border-bottom: 1px solid var(--border-color);">
      <span style="font-size: var(--fs-sm); font-weight: 500;">${p.name}</span>
      <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
        <input type="number" class="lead-prod-qty form-control" data-id="${p.id}" value="0" min="0" style="width: 60px; padding: 0.125rem 0.25rem; font-size: var(--fs-xs); text-align: center;">
      </div>
    </div>
  `).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="lead-contact">Customer Contact *</label>
        <select id="lead-contact" name="contactId" class="form-control" required>
          <option value="">Select Customer</option>
          ${contactOpts}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="lead-source">Lead Source *</label>
          <select id="lead-source" name="source" class="form-control" required>
            <option value="PHONE_CALL">Phone Call</option>
            <option value="WEBSITE">Website</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="REFERRAL">Referral</option>
            <option value="WALK_IN">Walk In</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="lead-rep">Assigned Owner *</label>
          <select id="lead-rep" name="assignedTo" class="form-control" required>
            <option value="">Select Employee</option>
            ${userOpts}
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="lead-budget">Estimated Budget ($)</label>
          <input type="number" id="lead-budget" name="budget" class="form-control" min="1" placeholder="10000">
        </div>
        <div class="form-group">
          <label class="form-label" for="lead-date">Expected Installation Date</label>
          <input type="date" id="lead-date" name="expectedInstallation" class="form-control">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Product Interests</label>
        <div style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--spacing-sm);">
          ${productItems || '<p style="color:var(--text-muted); font-size:var(--fs-xs); text-align:center;">No products in catalog</p>'}
        </div>
      </div>
    </div>
  `;

  showModal('Create Lead Profile', formHtml, async (data) => {
    if (!data.contactId || !data.source || !data.assignedTo) {
      throw new Error('Please fill in all required fields.');
    }

    // Assemble products array from input quantities
    const leadProducts = [];
    document.querySelectorAll('.lead-prod-qty').forEach(input => {
      const qty = parseInt(input.value) || 0;
      if (qty > 0) {
        leadProducts.push({
          productId: input.dataset.id,
          quantity: qty
        });
      }
    });

    const payload = {
      contactId: data.contactId,
      source: data.source,
      assignedTo: data.assignedTo,
      budget: data.budget || undefined,
      expectedInstallation: data.expectedInstallation || undefined,
      leadProducts: leadProducts.length > 0 ? leadProducts : undefined
    };

    await api.post('/leads', payload);
    showToast('Success', 'Lead profile registered.', 'success');
    fetchAndRenderLeads();
  }, 'Create Lead');
}

function showConvertOpportunityModal(leadId, repId) {
  const userOpts = users.map(u => `<option value="${u.id}" ${u.id === repId ? 'selected' : ''}>${u.firstName} ${u.lastName || ''}</option>`).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: var(--spacing-sm);">
        Converting this lead will initialize a sales opportunity pipe, enabling site survey scheduling and quotations creation.
      </p>
      <div class="form-group">
        <label class="form-label" for="opp-rep">Assigned Opportunity Owner *</label>
        <select id="opp-rep" name="assignedTo" class="form-control" required>
          ${userOpts}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="opp-revenue">Expected Value ($)</label>
          <input type="number" id="opp-revenue" name="expectedRevenue" class="form-control" placeholder="15000">
        </div>
        <div class="form-group">
          <label class="form-label" for="opp-close">Target Close Date</label>
          <input type="date" id="opp-close" name="expectedCloseDate" class="form-control">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="opp-remarks">Remarks / Initial Notes</label>
        <textarea id="opp-remarks" name="remarks" class="form-control" rows="2" placeholder="Customer is ready for quick site inspection..."></textarea>
      </div>
    </div>
  `;

  showModal('Convert to Opportunity', formHtml, async (data) => {
    if (!data.assignedTo) {
      throw new Error('Please select an assigned representative.');
    }

    const payload = {
      leadId,
      assignedTo: data.assignedTo,
      expectedRevenue: data.expectedRevenue || undefined,
      expectedCloseDate: data.expectedCloseDate || undefined,
      remarks: data.remarks || undefined
    };

    await api.post('/opportunities', payload);
    showToast('Success', 'Converted to Sales Opportunity.', 'success');
    window.location.hash = '#/opportunities';
  }, 'Convert & Open');
}

function handleDeleteLead(leadId) {
  showConfirm(
    'Archive Lead',
    'Are you sure you want to archive this lead? All product interests remain logged but the lead is deactivated from current search results.',
    async () => {
      await api.delete(`/leads/${leadId}`);
      showToast('Success', 'Lead archived.', 'success');
      fetchAndRenderLeads();
    },
    'Archive'
  );
}
