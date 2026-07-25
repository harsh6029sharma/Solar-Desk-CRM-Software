import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';

let products = [];

export async function initQuotationCreate(opportunityId) {
  const app = document.getElementById('app');
  if (!opportunityId) {
    app.innerHTML = `<p style="color: var(--danger);">Error: No Opportunity ID provided.</p>`;
    return;
  }

  // Set up spinner
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      <div>
        <a href="#/opportunities/${opportunityId}" style="display: inline-flex; align-items: center; gap: var(--spacing-xs); font-weight: 500; font-size: var(--fs-sm); margin-bottom: var(--spacing-sm);">
          <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Opportunity
        </a>
        <h2 style="font-size: var(--fs-2xl); font-weight: 700;">Create Quotation Proposal</h2>
      </div>

      <div class="card" style="max-width: 800px;">
        <form id="quotation-builder-form">
          <div class="form-group" style="margin-bottom: var(--spacing-md);">
            <label class="form-label" for="quo-valid-date">Validity Until *</label>
            <input type="date" id="quo-valid-date" name="validTill" class="form-control" required>
          </div>

          <h4 style="margin-bottom: var(--spacing-sm); font-size: var(--fs-md); font-weight: 600;">Line Items</h4>
          
          <div id="quotation-items-container" style="display: flex; flex-direction: column; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);">
            <!-- Dynamic product items row -->
          </div>

          <button type="button" id="add-item-row-btn" class="btn btn-secondary btn-sm" style="margin-bottom: var(--spacing-lg);">
            <i data-lucide="plus" style="width: 14px; height: 14px;"></i> Add Product Row
          </button>

          <div style="border-top: 1px solid var(--border-color); padding-top: var(--spacing-md); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: var(--fs-md); font-weight: 600;">
              Total Estimation: <span id="quotation-grand-total" style="color: var(--primary); font-size: var(--fs-lg);">$0.00</span>
            </div>
            <button type="submit" id="quotation-submit-btn" class="btn btn-primary">
              Generate Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await api.get('/products?isActive=true&limit=100');
    products = res.products || [];
    
    // Default valid date is 30 days from now
    const validDateInput = document.getElementById('quo-valid-date');
    if (validDateInput) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      validDateInput.value = defaultDate.toISOString().split('T')[0];
    }

    // Add first row
    addProductRow();
  } catch (err) {
    showToast('Catalog Error', 'Failed to retrieve products list.', 'danger');
  }

  // Bind Buttons
  document.getElementById('add-item-row-btn').onclick = () => addProductRow();

  const form = document.getElementById('quotation-builder-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('quotation-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';

    const items = [];
    document.querySelectorAll('.quotation-item-row').forEach(row => {
      const select = row.querySelector('.item-prod-select');
      const qty = parseInt(row.querySelector('.item-qty-input').value) || 0;
      if (select.value && qty > 0) {
        items.push({
          productId: select.value,
          quantity: qty
        });
      }
    });

    if (items.length === 0) {
      showToast('Validation Error', 'Please select at least one product with quantity > 0.', 'danger');
      btn.disabled = false;
      btn.textContent = 'Generate Proposal';
      return;
    }

    const payload = {
      opportunityId,
      validTill: document.getElementById('quo-valid-date').value,
      items
    };

    try {
      await api.post('/quotations', payload);
      showToast('Success', 'Quotation proposal generated.', 'success');
      window.location.hash = `#/opportunities/${opportunityId}`;
    } catch (err) {
      showToast('Submission Failed', err.message, 'danger');
      btn.disabled = false;
      btn.textContent = 'Generate Proposal';
    }
  };
}

function addProductRow() {
  const container = document.getElementById('quotation-items-container');
  if (!container) return;

  const rowId = `item-row-${Date.now()}`;
  const row = document.createElement('div');
  row.className = 'quotation-item-row';
  row.id = rowId;
  row.style = 'display: flex; gap: var(--spacing-sm); align-items: center;';

  const productOptions = products.map(p => `<option value="${p.id}" data-price="${p.basePrice}">${p.name} ($${p.basePrice})</option>`).join('');

  row.innerHTML = `
    <select class="item-prod-select form-control" style="flex: 2;" required>
      <option value="">Select Product</option>
      ${productOptions}
    </select>
    <input type="number" class="item-qty-input form-control" placeholder="Qty" min="1" value="1" style="width: 80px;" required>
    <div class="item-total-price" style="font-weight: 500; font-size: var(--fs-sm); min-width: 80px; text-align: right;">$0.00</div>
    <button type="button" class="btn btn-secondary remove-item-row-btn" style="padding: 0.375rem 0.5rem; background-color: var(--danger-light); color: var(--danger-text); border-color: transparent;">
      <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
    </button>
  `;

  container.appendChild(row);
  if (window.lucide) window.lucide.createIcons();

  const select = row.querySelector('.item-prod-select');
  const qty = row.querySelector('.item-qty-input');
  const priceEl = row.querySelector('.item-total-price');

  const updateRowPrice = () => {
    const selectedOption = select.options[select.selectedIndex];
    const basePrice = selectedOption ? parseFloat(selectedOption.dataset.price) : 0;
    const quantity = parseInt(qty.value) || 0;
    const total = basePrice * quantity;
    priceEl.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
    priceEl.dataset.total = total;
    calculateGrandTotal();
  };

  select.onchange = updateRowPrice;
  qty.oninput = updateRowPrice;

  row.querySelector('.remove-item-row-btn').onclick = () => {
    row.remove();
    calculateGrandTotal();
  };

  updateRowPrice();
}

function calculateGrandTotal() {
  let grandTotal = 0;
  document.querySelectorAll('.item-total-price').forEach(el => {
    grandTotal += parseFloat(el.dataset.total) || 0;
  });
  document.getElementById('quotation-grand-total').textContent = 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(grandTotal);
}

// -------------------------------------------------------------
// QUOTATION DETAILS VIEW
// -------------------------------------------------------------
export async function initQuotationDetails(quotationId) {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      <div>
        <a id="back-to-opp-link" href="#/opportunities" style="display: inline-flex; align-items: center; gap: var(--spacing-xs); font-weight: 500; font-size: var(--fs-sm); margin-bottom: var(--spacing-sm);">
          <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Opportunity
        </a>
        <h2 id="quo-number" style="font-size: var(--fs-2xl); font-weight: 700;">Loading...</h2>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--spacing-lg); align-items: start;">
        <!-- Status Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quotation Status</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Current Status</span>
              <p style="margin-top: var(--spacing-xs);"><span id="quo-status" class="badge badge-info">-</span></p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Grand Total</span>
              <p id="quo-total" style="font-weight: 700; font-size: var(--fs-lg); color: var(--primary);">-</p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Valid Until</span>
              <p id="quo-valid" style="font-weight: 500;">-</p>
            </div>

            <!-- Status Buttons -->
            <div id="status-actions-container" style="display: flex; flex-direction: column; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- Items Card -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="card-header" style="padding: var(--spacing-md);">
            <h3 class="card-title">Proposal Line Items</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody id="quo-items-tbody">
                <tr>
                  <td colspan="4" style="text-align: center;"><div class="spinner" style="margin: auto;"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  await loadQuotationDetails(quotationId);
}

async function loadQuotationDetails(quotationId) {
  try {
    const q = await api.get(`/quotations/${quotationId}`);

    document.getElementById('quo-number').textContent = q.quotationNumber;
    document.getElementById('quo-total').textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q.totalAmount);
    
    const validDate = q.validTill || q.validUntil;
    document.getElementById('quo-valid').textContent = validDate ? new Date(validDate).toLocaleDateString() : 'N/A';
    
    const backLink = document.getElementById('back-to-opp-link');
    if (backLink && q.opportunityId) {
      backLink.href = `#/opportunities/${q.opportunityId}`;
    }

    const statusEl = document.getElementById('quo-status');
    statusEl.textContent = q.status;
    let badgeColor = 'badge-info';
    if (q.status === 'ACCEPTED') badgeColor = 'badge-success';
    if (q.status === 'REJECTED') badgeColor = 'badge-danger';
    if (q.status === 'EXPIRED') badgeColor = 'badge-warning';
    statusEl.className = `badge ${badgeColor}`;

    // Render Items
    const tbody = document.getElementById('quo-items-tbody');
    tbody.innerHTML = q.items.map(item => {
      const unit = parseFloat(item.unitPriceSnapshot);
      const total = parseFloat(item.totalPrice);
      return `
        <tr>
          <td style="font-weight: 500;">${item.productNameSnapshot}</td>
          <td style="text-align: right;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(unit)}</td>
          <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
          <td style="text-align: right; font-weight: 600;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}</td>
        </tr>
      `;
    }).join('');

    renderStatusActions(q);
  } catch (err) {
    showToast('Error', 'Failed to retrieve quotation details.', 'danger');
  }
}

function renderStatusActions(q) {
  const container = document.getElementById('status-actions-container');
  if (!container) return;

  if (q.status === 'DRAFT') {
    container.innerHTML = `
      <button class="btn btn-primary update-status-btn" data-status="SENT">
        <i data-lucide="send"></i> Mark as Sent to Client
      </button>
    `;
  } else if (q.status === 'SENT') {
    container.innerHTML = `
      <button class="btn btn-primary update-status-btn" data-status="ACCEPTED" style="background-color: var(--success); border-color: var(--success);">
        <i data-lucide="check"></i> Accept Proposal
      </button>
      <button class="btn btn-secondary update-status-btn" data-status="REJECTED" style="color: var(--danger); border-color: var(--danger);">
        <i data-lucide="x"></i> Reject Proposal
      </button>
    `;
  } else if (q.status === 'ACCEPTED') {
    container.innerHTML = `
      <p style="font-size: var(--fs-xs); color: var(--success); font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center; gap: var(--spacing-xs);">
        <i data-lucide="check-circle" style="width: 16px; height:16px;"></i> Proposal Accepted
      </p>
      <button id="initialize-install-btn" class="btn btn-secondary" style="margin-top: var(--spacing-sm);">
        <i data-lucide="wrench"></i> Initialize Installation
      </button>
    `;
    
    // Check if installation exists
    api.get(`/opportunities/${q.opportunityId}/installation`).then(inst => {
      // Exists: show link
      const btn = document.getElementById('initialize-install-btn');
      if (btn) {
        btn.innerHTML = `<i data-lucide="arrow-right"></i> View Installation Project`;
        btn.onclick = () => {
          window.location.hash = `#/opportunities/${q.opportunityId}`;
          setTimeout(() => {
            // Smooth scroll or trigger open tab
          }, 100);
        };
      }
    }).catch(err => {
      // 404: bind wizard
      const btn = document.getElementById('initialize-install-btn');
      if (btn) {
        btn.onclick = () => showCreateInstallationModal(q);
      }
    });

  } else {
    container.innerHTML = `<p style="font-size: var(--fs-xs); color: var(--text-muted); text-align: center; font-style: italic;">No actions available for closed proposals.</p>`;
  }

  if (window.lucide) window.lucide.createIcons();

  container.querySelectorAll('.update-status-btn').forEach(btn => {
    btn.onclick = async () => {
      const targetStatus = btn.dataset.status;
      showConfirm(
        'Update Quotation Status',
        `Update this proposal status to ${targetStatus}?`,
        async () => {
          await api.patch(`/quotations/${q.id}/status`, { status: targetStatus });
          showToast('Success', 'Quotation status updated.', 'success');
          loadQuotationDetails(q.id);
        }
      );
    };
  });
}

async function showCreateInstallationModal(q) {
  // We need to fetch opportunity to get lead, and lead to get contact, and contact's addresses
  try {
    const opp = await api.get(`/opportunities/${q.opportunityId}`);
    const contactId = opp.lead?.contactId;
    if (!contactId) throw new Error('Could not resolve customer details.');

    const [addresses, usersList] = await Promise.all([
      api.get(`/contacts/${contactId}/addresses`),
      api.get('/users')
    ]);

    if (addresses.length === 0) {
      showToast('Missing Address', 'Please add an address to the contact profile first.', 'warning');
      window.location.hash = `#/contacts/${contactId}`;
      return;
    }

    const addrOpts = addresses.map(a => `<option value="${a.id}">${a.isPrimary ? '[Primary] ' : ''}${a.line1 || ''} ${a.city}, ${a.state}</option>`).join('');
    const techOpts = usersList.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName || ''}</option>`).join('');

    let formHtml = `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
        <p style="font-size: var(--fs-sm); color: var(--text-muted);">
          Configure the physical installation project mapping for this contract.
        </p>
        <div class="form-group">
          <label class="form-label" for="inst-addr">Installation Site Address *</label>
          <select id="inst-addr" name="addressId" class="form-control" required>
            ${addrOpts}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="inst-tech">Assigned Project Technician</label>
          <select id="inst-tech" name="assignedToId" class="form-control">
            <option value="">Select Technician</option>
            ${techOpts}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="inst-date">Scheduled Installation Date</label>
          <input type="date" id="inst-date" name="scheduledDate" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label" for="inst-remarks">Remarks</label>
          <textarea id="inst-remarks" name="remarks" class="form-control" rows="2" placeholder="Roof is sloped metal sheet. Bring harness..."></textarea>
        </div>
      </div>
    `;

    showModal('Initialize Installation Project', formHtml, async (data) => {
      if (!data.addressId) throw new Error('Please select an installation site.');

      const payload = {
        quotationId: q.id,
        contactId,
        addressId: data.addressId,
        assignedToId: data.assignedToId || undefined,
        scheduledDate: data.scheduledDate || undefined,
        remarks: data.remarks || undefined
      };

      await api.post(`/opportunities/${q.opportunityId}/installation`, payload);
      showToast('Success', 'Installation project initialized.', 'success');
      loadQuotationDetails(q.id);
    }, 'Initialize Project');

  } catch (err) {
    showToast('Error', err.message, 'danger');
  }
}
