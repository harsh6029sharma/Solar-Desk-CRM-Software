import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

let activeOppId = null;
let opportunityData = null;
let surveyData = null;
let users = [];

export async function initOpportunityDetails(opportunityId) {
  activeOppId = opportunityId;
  const app = document.getElementById('app');

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Back & Title -->
      <div>
        <a href="#/opportunities" style="display: inline-flex; align-items: center; gap: var(--spacing-xs); font-weight: 500; font-size: var(--fs-sm); margin-bottom: var(--spacing-sm);">
          <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Opportunities
        </a>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 id="opp-title" style="font-size: var(--fs-2xl); font-weight: 700;">Loading...</h2>
          <button id="edit-opp-details-btn" class="btn btn-secondary">
            <i data-lucide="edit-2"></i> Edit Details
          </button>
        </div>
      </div>

      <!-- Stage pipeline tracker -->
      <div class="card" style="padding: var(--spacing-md); overflow-x: auto;">
        <div id="pipeline-stages" style="display: flex; justify-content: space-between; min-width: 600px; position: relative;">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- Left / Right Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); align-items: start;">
        
        <!-- Details Card -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Opportunity Details</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Expected Revenue</span>
                <p id="opp-revenue" style="font-weight: 600; font-size: var(--fs-lg);">-</p>
              </div>
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Probability</span>
                <p id="opp-probability" style="font-weight: 600; font-size: var(--fs-lg);">-</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Target Close Date</span>
                <p id="opp-close-date" style="font-weight: 500;">-</p>
              </div>
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Assigned Owner</span>
                <p id="opp-owner" style="font-weight: 500;">-</p>
              </div>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Customer Contact</span>
              <p id="opp-customer" style="font-weight: 500;">-</p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Remarks / Notes</span>
              <p id="opp-remarks" style="font-style: italic; color: var(--text-muted);">-</p>
            </div>
          </div>
        </div>

        <!-- Site Survey Card -->
        <div class="card" id="site-survey-section">
          <div class="card-header">
            <h3 class="card-title">Technical Site Survey</h3>
            <button id="survey-action-btn" class="btn btn-secondary btn-sm" style="display: none; padding: 0.375rem 0.75rem;">
              <i data-lucide="plus"></i> Add Survey
            </button>
          </div>
          <div id="survey-content-container">
            <div class="spinner" style="margin: var(--spacing-xl) auto;"></div>
          </div>
        </div>

      </div>

      <!-- Installation & Warranty Section Card -->
      <div class="card" id="installation-section-card" style="display: none;">
        <div class="card-header" style="margin-bottom: var(--spacing-md);">
          <h3 class="card-title">Post-Sale Installation Project</h3>
          <button id="edit-install-btn" class="btn btn-secondary btn-sm" style="padding: 0.375rem 0.75rem;">
            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i> Edit Details
          </button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
          
          <!-- Installation info -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-md); border-right: 1px solid var(--border-color); padding-right: var(--spacing-lg);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Job Number</span>
                <p id="inst-number" style="font-weight: 600; font-family: monospace;">-</p>
              </div>
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Project Status</span>
                <select id="inst-status-select" class="form-control" style="padding: 0.125rem 0.5rem; height: auto; font-size: var(--fs-xs); width: auto;">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Scheduled Date</span>
                <p id="inst-sched-date" style="font-weight: 500;">-</p>
              </div>
              <div>
                <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Assigned Tech</span>
                <p id="inst-tech-name" style="font-weight: 500;">-</p>
              </div>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Started / Completed</span>
              <p style="font-size: var(--fs-sm);" id="inst-timestamps">-</p>
            </div>
            <div>
              <span class="form-label" style="color: var(--text-muted); font-size: var(--fs-xs);">Technician Notes</span>
              <p style="font-style: italic; color: var(--text-muted);" id="inst-remarks-text">-</p>
            </div>
          </div>

          <!-- Warranty info -->
          <div>
            <h4 style="font-size: var(--fs-md); font-weight: 600; margin-bottom: var(--spacing-md); display: flex; align-items: center; justify-content: space-between;">
              <span>Product Warranty Registry</span>
              <button id="register-warranty-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; display: none;">
                <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Register
              </button>
            </h4>
            <div id="warranty-content-container">
              <div class="spinner" style="margin: var(--spacing-md) auto;"></div>
            </div>
          </div>

        </div>
      </div>

      <!-- AMC & Service Requests Card -->
      <div class="card" id="service-ops-section-card" style="display: none;">
        <div class="card-header" style="margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-color); padding-bottom: var(--spacing-sm);">
          <h3 class="card-title">Post-Sale Support & Maintenance</h3>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
          <!-- AMC column -->
          <div style="border-right: 1px solid var(--border-color); padding-right: var(--spacing-lg);">
            <h4 style="font-size: var(--fs-md); font-weight: 600; margin-bottom: var(--spacing-sm); display: flex; align-items: center; justify-content: space-between;">
              <span>Annual Maintenance Contracts (AMC)</span>
              <button id="add-amc-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;">
                <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Add AMC
              </button>
            </h4>
            <div class="table-responsive">
              <table class="table" style="background-color: transparent;">
                <thead>
                  <tr>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Freq</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="amcs-tbody">
                  <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted);">No AMC Agreements</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Service requests column -->
          <div>
            <h4 style="font-size: var(--fs-md); font-weight: 600; margin-bottom: var(--spacing-sm); display: flex; align-items: center; justify-content: space-between;">
              <span>Service & Support Tickets</span>
              <button id="add-ticket-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;">
                <i data-lucide="plus" style="width: 12px; height: 12px;"></i> New Ticket
              </button>
            </h4>
            <div class="table-responsive">
              <table class="table" style="background-color: transparent;">
                <thead>
                  <tr>
                    <th>Ticket Info</th>
                    <th>Priority</th>
                    <th>Assigned Tech</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="tickets-tbody">
                  <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted);">No Service Tickets</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Quotations Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Quotations</h3>
          <button id="add-quotation-btn" class="btn btn-secondary" style="padding: 0.375rem 0.75rem;">
            <i data-lucide="plus"></i> New Quotation
          </button>
        </div>
        <div class="table-responsive">
          <table class="table" style="background-color: transparent;">
            <thead>
              <tr>
                <th>Quotation No.</th>
                <th>Total Price</th>
                <th>Validity Date</th>
                <th>Status</th>
                <th style="width: 100px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="quotations-table-body">
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted);">No Quotations mapped</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load static resources
  try {
    users = await api.get('/users');
  } catch (e) {}

  await loadOpportunityDetails();
  await loadSiteSurvey();
  await loadQuotations();
  await loadInstallationDetails();

  // Bind Buttons
  document.getElementById('edit-opp-details-btn').onclick = showEditDetailsModal;
  document.getElementById('add-quotation-btn').onclick = () => {
    window.location.hash = `#/quotations/create?opportunityId=${activeOppId}`;
  };
}

async function loadOpportunityDetails() {
  try {
    opportunityData = await api.get(`/opportunities/${activeOppId}`);
    
    document.getElementById('opp-title').textContent = `Opportunity ${opportunityData.opportunityNumber}`;
    document.getElementById('opp-revenue').textContent = opportunityData.expectedRevenue 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opportunityData.expectedRevenue)
      : 'N/A';
    document.getElementById('opp-probability').textContent = opportunityData.probability !== null ? `${opportunityData.probability}%` : 'N/A';
    document.getElementById('opp-close-date').textContent = opportunityData.expectedCloseDate ? new Date(opportunityData.expectedCloseDate).toLocaleDateString() : 'N/A';
    document.getElementById('opp-remarks').textContent = opportunityData.remarks || 'No remarks recorded.';
    
    const contactObj = opportunityData.lead?.contact;
    document.getElementById('opp-customer').innerHTML = contactObj 
      ? `<a href="#/contacts/${contactObj.id}">${contactObj.firstName} ${contactObj.lastName || ''}</a> (${contactObj.phone})`
      : 'N/A';

    const ownerUser = users.find(u => u.id === opportunityData.assignedTo);
    document.getElementById('opp-owner').textContent = ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName || ''}` : 'Unassigned';

    renderPipeline(opportunityData.stage);
  } catch (err) {
    showToast('Error', 'Failed to retrieve opportunity details', 'danger');
  }
}

function renderPipeline(activeStage) {
  const stages = ['QUALIFICATION', 'SITE_SURVEY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  const container = document.getElementById('pipeline-stages');
  if (!container) return;

  container.innerHTML = stages.map(stage => {
    const isActive = activeStage === stage;
    let colorStyle = 'background-color: var(--bg-app); color: var(--text-muted); border: 1px solid var(--border-color);';
    if (isActive) {
      if (stage === 'WON') colorStyle = 'background-color: var(--success); color: #fff; border-color: var(--success); font-weight: 600;';
      else if (stage === 'LOST') colorStyle = 'background-color: var(--danger); color: #fff; border-color: var(--danger); font-weight: 600;';
      else colorStyle = 'background-color: var(--primary); color: #fff; border-color: var(--primary); font-weight: 600;';
    }

    return `
      <button class="stage-bubble btn" data-stage="${stage}" style="${colorStyle} padding: 0.5rem 1rem; border-radius: var(--radius-full); font-size: var(--fs-xs); flex: 1; margin: 0 var(--spacing-xs); cursor: pointer;">
        ${stage.replace('_', ' ')}
      </button>
    `;
  }).join('');

  container.querySelectorAll('.stage-bubble').forEach(btn => {
    btn.onclick = () => {
      const targetStage = btn.dataset.stage;
      if (targetStage === activeStage) return;

      if (targetStage === 'LOST') {
        // Lost Reason Modal
        const formHtml = `
          <div class="form-group">
            <label class="form-label" for="lost-reason-input">Reason for Lost Sale *</label>
            <input type="text" id="lost-reason-input" name="lostReason" class="form-control" placeholder="Price too high, chose competitor..." required>
          </div>
        `;
        showModal('Mark Opportunity Lost', formHtml, async (data) => {
          if (!data.lostReason) throw new Error('Reason is required.');
          await updateOpportunityStage('LOST', data.lostReason);
        }, 'Mark Lost');
      } else {
        showConfirm(
          'Transition Stage',
          `Move opportunity stage to ${targetStage.replace('_', ' ')}?`,
          async () => {
            await updateOpportunityStage(targetStage);
          }
        );
      }
    };
  });
}

async function updateOpportunityStage(stage, lostReason = undefined) {
  try {
    await api.patch(`/opportunities/${activeOppId}/stage`, { stage, lostReason });
    showToast('Success', 'Pipeline stage updated successfully.', 'success');
    await loadOpportunityDetails();
  } catch (err) {
    showToast('Update Failed', err.message, 'danger');
  }
}

async function loadSiteSurvey() {
  const container = document.getElementById('survey-content-container');
  const actionBtn = document.getElementById('survey-action-btn');
  if (!container) return;

  try {
    surveyData = await api.get(`/opportunities/${activeOppId}/survey`);
    
    actionBtn.style.display = 'inline-flex';
    actionBtn.innerHTML = `<i data-lucide="edit-2" style="width:14px; height:14px;"></i> Edit Survey`;
    actionBtn.onclick = () => showSurveyModal(true);

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); font-size: var(--fs-sm); margin-top: var(--spacing-sm);">
        <div>
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">Roof Type</span>
          <strong style="text-transform:capitalize;">${surveyData.roofType || 'N/A'}</strong>
        </div>
        <div>
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">Roof Area</span>
          <strong>${surveyData.roofAreaSqFt ? surveyData.roofAreaSqFt + ' Sq Ft' : 'N/A'}</strong>
        </div>
        <div>
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">Sanctioned Load</span>
          <strong>${surveyData.sanctionedLoadKw ? surveyData.sanctionedLoadKw + ' kW' : 'N/A'}</strong>
        </div>
        <div>
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">Average Monthly Bill</span>
          <strong>${surveyData.monthlyBillAverage ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(surveyData.monthlyBillAverage) : 'N/A'}</strong>
        </div>
        <div style="grid-column: 1 / span 2;">
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">Shadow Analysis</span>
          <p>${surveyData.shadowAnalysis || 'N/A'}</p>
        </div>
        <div style="grid-column: 1 / span 2;">
          <span style="color:var(--text-muted); display:block; font-size:var(--fs-xs);">GPS Coordinates</span>
          <p style="font-family:monospace;">Lat: ${surveyData.latitude || 'N/A'}, Lon: ${surveyData.longitude || 'N/A'}</p>
        </div>
      </div>
    `;
  } catch (err) {
    // 404 meaning survey not found
    surveyData = null;
    actionBtn.style.display = 'inline-flex';
    actionBtn.innerHTML = `<i data-lucide="plus" style="width:14px; height:14px;"></i> Log Survey`;
    actionBtn.onclick = () => showSurveyModal(false);

    container.innerHTML = `
      <div class="empty-state" style="padding: var(--spacing-md); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
        <i data-lucide="info" style="width:32px; height:32px;"></i>
        <p class="empty-state-title">No Survey details registered</p>
        <p style="font-size: var(--fs-xs);">Perform a site survey to capture physical attributes for the design.</p>
      </div>
    `;
  }
  if (window.lucide) window.lucide.createIcons();
}

function showSurveyModal(isEdit = false) {
  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="surv-roofType">Roof Surface Type</label>
          <select id="surv-roofType" name="roofType" class="form-control">
            <option value="CONCRETE">Concrete Flat</option>
            <option value="METAL_SHEET">Tin / Metal Sheet</option>
            <option value="TILED">Tiled Sloped</option>
            <option value="GROUND_MOUNT">Ground Mount</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="surv-roofArea">Roof Area (Sq Ft)</label>
          <input type="number" id="surv-roofArea" name="roofAreaSqFt" class="form-control" min="1" placeholder="800">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="surv-load">Sanctioned Load (kW)</label>
          <input type="number" id="surv-load" name="sanctionedLoadKw" class="form-control" min="0.1" step="0.1" placeholder="5">
        </div>
        <div class="form-group">
          <label class="form-label" for="surv-bill">Average Monthly Bill ($)</label>
          <input type="number" id="surv-bill" name="monthlyBillAverage" class="form-control" min="1" placeholder="150">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="surv-shadow">Shadow Analysis Notes</label>
        <textarea id="surv-shadow" name="shadowAnalysis" class="form-control" rows="2" placeholder="Obstructions like trees, chimneys, high-rise buildings nearby..."></textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="surv-lat">Latitude</label>
          <input type="number" id="surv-lat" name="latitude" class="form-control" step="0.000001" min="-90" max="90" placeholder="37.774929">
        </div>
        <div class="form-group">
          <label class="form-label" for="surv-lon">Longitude</label>
          <input type="number" id="surv-lon" name="longitude" class="form-control" step="0.000001" min="-180" max="180" placeholder="-122.419416">
        </div>
      </div>
    </div>
  `;

  showModal(isEdit ? 'Edit Site Survey' : 'Log Technical Site Survey', formHtml, async (data) => {
    const payload = {
      roofType: data.roofType || undefined,
      roofAreaSqFt: data.roofAreaSqFt || undefined,
      sanctionedLoadKw: data.sanctionedLoadKw || undefined,
      monthlyBillAverage: data.monthlyBillAverage || undefined,
      shadowAnalysis: data.shadowAnalysis || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
    };

    if (isEdit) {
      await api.patch(`/opportunities/${activeOppId}/survey`, payload);
      showToast('Success', 'Survey details updated.', 'success');
    } else {
      await api.post(`/opportunities/${activeOppId}/survey`, payload);
      showToast('Success', 'Survey details registered.', 'success');
    }

    await loadSiteSurvey();
  }, isEdit ? 'Save Changes' : 'Log Survey');

  if (isEdit && surveyData) {
    setTimeout(() => {
      const type = document.getElementById('surv-roofType');
      const area = document.getElementById('surv-roofArea');
      const load = document.getElementById('surv-load');
      const bill = document.getElementById('surv-bill');
      const shadow = document.getElementById('surv-shadow');
      const lat = document.getElementById('surv-lat');
      const lon = document.getElementById('surv-lon');

      if (type) type.value = surveyData.roofType || '';
      if (area) area.value = surveyData.roofAreaSqFt || '';
      if (load) load.value = surveyData.sanctionedLoadKw || '';
      if (bill) bill.value = surveyData.monthlyBillAverage || '';
      if (shadow) shadow.value = surveyData.shadowAnalysis || '';
      if (lat) lat.value = surveyData.latitude || '';
      if (lon) lon.value = surveyData.longitude || '';
    }, 100);
  }
}

async function loadQuotations() {
  const tbody = document.getElementById('quotations-table-body');
  if (!tbody) return;

  try {
    const res = await api.get(`/quotations?opportunityId=${activeOppId}`);
    // Check if paginated response or flat array
    const quotationsList = Array.isArray(res) ? res : (res.quotations || []);

    if (quotationsList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">
            No Quotations logged for this opportunity yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = quotationsList.map(q => {
      const totalStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(q.totalAmount);
      const dateStr = new Date(q.validTill || q.validUntil).toLocaleDateString();
      let badgeColor = 'badge-info';
      if (q.status === 'ACCEPTED') badgeColor = 'badge-success';
      if (q.status === 'REJECTED') badgeColor = 'badge-danger';
      if (q.status === 'EXPIRED') badgeColor = 'badge-warning';

      return `
        <tr>
          <td style="font-weight: 600; font-family: monospace;">${q.quotationNumber}</td>
          <td>${totalStr}</td>
          <td>${dateStr}</td>
          <td><span class="badge ${badgeColor}">${q.status}</span></td>
          <td style="text-align: right;">
            <a href="#/quotations/${q.id}" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;">
              <i data-lucide="eye" style="width:14px; height:14px;"></i> View
            </a>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    // Fail silently
  }
}

function showEditDetailsModal() {
  if (!opportunityData) return;

  const userOpts = users.map(u => `<option value="${u.id}" ${u.id === opportunityData.assignedTo ? 'selected' : ''}>${u.firstName} ${u.lastName || ''}</option>`).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="edit-opp-rep">Assigned Rep *</label>
        <select id="edit-opp-rep" name="assignedTo" class="form-control" required>
          ${userOpts}
        </select>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="edit-opp-revenue">Expected Value ($)</label>
          <input type="number" id="edit-opp-revenue" name="expectedRevenue" class="form-control" value="${opportunityData.expectedRevenue || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-opp-prob">Probability (%)</label>
          <input type="number" id="edit-opp-prob" name="probability" class="form-control" min="0" max="100" value="${opportunityData.probability || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-opp-close">Target Close Date</label>
        <input type="date" id="edit-opp-close" name="expectedCloseDate" class="form-control" value="${opportunityData.expectedCloseDate ? opportunityData.expectedCloseDate.split('T')[0] : ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-opp-remarks">Remarks</label>
        <textarea id="edit-opp-remarks" name="remarks" class="form-control" rows="2">${opportunityData.remarks || ''}</textarea>
      </div>
    </div>
  `;

  showModal('Edit Opportunity Info', formHtml, async (data) => {
    if (!data.assignedTo) throw new Error('Please select an owner.');

    const payload = {
      assignedTo: data.assignedTo,
      expectedRevenue: data.expectedRevenue || undefined,
      probability: data.probability !== undefined ? data.probability : undefined,
      expectedCloseDate: data.expectedCloseDate || undefined,
      remarks: data.remarks || undefined
    };

    await api.patch(`/opportunities/${activeOppId}`, payload);
    showToast('Success', 'Opportunity updated successfully.', 'success');
    await loadOpportunityDetails();
  }, 'Save Changes');
}

// -------------------------------------------------------------
// POST-SALE INSTALLATION PROJECT & WARRANTIES MANAGEMENT
// -------------------------------------------------------------
let installationData = null;

async function loadInstallationDetails() {
  const card = document.getElementById('installation-section-card');
  if (!card) return;

  try {
    installationData = await api.get(`/opportunities/${activeOppId}/installation`);
    card.style.display = 'block';

    document.getElementById('inst-number').textContent = installationData.installationNumber;
    document.getElementById('inst-sched-date').textContent = installationData.scheduledDate 
      ? new Date(installationData.scheduledDate).toLocaleDateString() : 'Unscheduled';

    const techUser = users.find(u => u.id === installationData.assignedToId);
    document.getElementById('inst-tech-name').textContent = techUser 
      ? `${techUser.firstName} ${techUser.lastName || ''}` : 'Unassigned';

    document.getElementById('inst-remarks-text').textContent = installationData.remarks || 'No notes saved.';

    const startStr = installationData.startedAt ? new Date(installationData.startedAt).toLocaleString() : 'Not Started';
    const endStr = installationData.completedAt ? new Date(installationData.completedAt).toLocaleString() : 'Not Completed';
    document.getElementById('inst-timestamps').innerHTML = `Started: <strong>${startStr}</strong><br>Completed: <strong>${endStr}</strong>`;

    const statusSelect = document.getElementById('inst-status-select');
    statusSelect.value = installationData.status;
    statusSelect.onchange = async () => {
      try {
        await api.patch(`/opportunities/${activeOppId}/installation/status`, { status: statusSelect.value });
        showToast('Success', 'Installation status changed.', 'success');
        loadInstallationDetails();
      } catch (err) {
        showToast('Error', err.message, 'danger');
        statusSelect.value = installationData.status;
      }
    };

    document.getElementById('edit-install-btn').onclick = showEditInstallationModal;

    const opsCard = document.getElementById('service-ops-section-card');
    if (opsCard) opsCard.style.display = 'block';

    // Load Warranty, AMC and Service Requests
    await loadWarrantyDetails();
    await loadAmcDetails();
    await loadServiceTickets();

  } catch (err) {
    card.style.display = 'none';
    const opsCard = document.getElementById('service-ops-section-card');
    if (opsCard) opsCard.style.display = 'none';
  }
}

function showEditInstallationModal() {
  if (!installationData) return;

  const techOpts = users.map(u => `<option value="${u.id}" ${u.id === installationData.assignedToId ? 'selected' : ''}>${u.firstName} ${u.lastName || ''}</option>`).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="edit-inst-tech">Assigned Project Technician</label>
        <select id="edit-inst-tech" name="assignedToId" class="form-control">
          <option value="">Select Technician</option>
          ${techOpts}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-inst-date">Scheduled Installation Date</label>
        <input type="date" id="edit-inst-date" name="scheduledDate" class="form-control" value="${installationData.scheduledDate ? installationData.scheduledDate.split('T')[0] : ''}">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="edit-inst-started">Started At Date/Time</label>
          <input type="datetime-local" id="edit-inst-started" name="startedAt" class="form-control" value="${installationData.startedAt ? installationData.startedAt.slice(0, 16) : ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="edit-inst-completed">Completed At Date/Time</label>
          <input type="datetime-local" id="edit-inst-completed" name="completedAt" class="form-control" value="${installationData.completedAt ? installationData.completedAt.slice(0, 16) : ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="edit-inst-remarks">Remarks / Technical Notes</label>
        <textarea id="edit-inst-remarks" name="remarks" class="form-control" rows="2">${installationData.remarks || ''}</textarea>
      </div>
    </div>
  `;

  showModal('Edit Installation details', formHtml, async (data) => {
    const payload = {
      assignedToId: data.assignedToId || undefined,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      remarks: data.remarks || undefined
    };

    await api.patch(`/opportunities/${activeOppId}/installation`, payload);
    showToast('Success', 'Installation project updated successfully.', 'success');
    await loadInstallationDetails();
  }, 'Save Changes');
}

async function loadWarrantyDetails() {
  const container = document.getElementById('warranty-content-container');
  const regBtn = document.getElementById('register-warranty-btn');
  if (!container) return;

  try {
    const w = await api.get(`/opportunities/${activeOppId}/installation/warranty`);
    regBtn.style.display = 'none';

    let badgeClass = 'badge-info';
    if (w.status === 'ACTIVE') badgeClass = 'badge-success';
    if (w.status === 'EXPIRED') badgeClass = 'badge-warning';
    if (w.status === 'VOID') badgeClass = 'badge-danger';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); font-size: var(--fs-sm); margin-top: var(--spacing-xs);">
        <div>
          <span style="color:var(--text-muted); font-size:var(--fs-xs);">Coverage Term</span>
          <p><strong>${new Date(w.startDate).toLocaleDateString()}</strong> to <strong>${new Date(w.endDate).toLocaleDateString()}</strong></p>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:var(--fs-xs);">Certificate Status</span>
          <p style="margin-top:var(--spacing-xs);"><span class="badge ${badgeClass}">${w.status}</span></p>
        </div>
        <div>
          <span style="color:var(--text-muted); font-size:var(--fs-xs);">Warranty T&C</span>
          <p style="font-style:italic; font-size:var(--fs-xs); color:var(--text-muted);">${w.terms || 'Standard 10-year physical warranty coverage.'}</p>
        </div>
      </div>
    `;
  } catch (err) {
    // 404: Show Register Warranty Button
    regBtn.style.display = 'block';
    regBtn.onclick = () => showWarrantyRegistrationModal();

    container.innerHTML = `
      <div style="background-color: var(--bg-app); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: var(--spacing-sm); text-align: center;">
        <p style="color: var(--text-muted); font-size: var(--fs-xs); font-style: italic;">
          Warranty certificate has not been logged for this installation yet.
        </p>
      </div>
    `;
  }
}

function showWarrantyRegistrationModal() {
  // Start date defaults to today, end date to 10 years from today
  const defaultStart = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 10);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="warr-start">Coverage Start Date *</label>
          <input type="date" id="warr-start" name="startDate" class="form-control" value="${defaultStart}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="warr-end">Coverage End Date *</label>
          <input type="date" id="warr-end" name="endDate" class="form-control" value="${defaultEndStr}" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="warr-terms">Warranty Terms & Conditions</label>
        <textarea id="warr-terms" name="terms" class="form-control" rows="3" placeholder="Includes 10-year performance warranty on solar panels and 5-year workmanship warranty..."></textarea>
      </div>
    </div>
  `;

  showModal('Register Warranty Certificate', formHtml, async (data) => {
    if (!data.startDate || !data.endDate) throw new Error('Please enter coverage dates.');

    const payload = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      terms: data.terms || undefined
    };

    await api.post(`/opportunities/${activeOppId}/installation/warranty`, payload);
    showToast('Success', 'Warranty registered successfully.', 'success');
    await loadWarrantyDetails();
  }, 'Issue Certificate');
}

// -------------------------------------------------------------
// ANNUAL MAINTENANCE CONTRACTS (AMC)
// -------------------------------------------------------------
async function loadAmcDetails() {
  const tbody = document.getElementById('amcs-tbody');
  if (!tbody) return;

  try {
    const amcs = await api.get(`/opportunities/${activeOppId}/installation/amcs`);
    if (amcs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">No AMC Agreements logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = amcs.map(a => {
      const start = new Date(a.startDate).toLocaleDateString();
      const end = new Date(a.endDate).toLocaleDateString();
      const amountStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a.amount);

      return `
        <tr>
          <td style="font-size: var(--fs-xs);">${start} - ${end}</td>
          <td style="font-weight: 500;">${amountStr}</td>
          <td style="font-size: var(--fs-xs);">${a.frequency}</td>
          <td>
            <select class="amc-status-select form-control" data-id="${a.id}" style="padding: 0.125rem 0.25rem; font-size: var(--fs-xs); height: auto; width: auto; display: inline-block;">
              <option value="ACTIVE" ${a.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
              <option value="EXPIRED" ${a.status === 'EXPIRED' ? 'selected' : ''}>Expired</option>
              <option value="CANCELLED" ${a.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.amc-status-select').forEach(select => {
      select.onchange = async () => {
        try {
          await api.patch(`/opportunities/${activeOppId}/installation/amcs/${select.dataset.id}/status`, { status: select.value });
          showToast('Success', 'AMC status updated.', 'success');
          loadAmcDetails();
        } catch (err) {
          showToast('Error', err.message, 'danger');
        }
      };
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Failed to load AMC details.</td></tr>`;
  }
}

function showCreateAmcModal() {
  const defaultStart = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="amc-start">Start Date *</label>
          <input type="date" id="amc-start" name="startDate" class="form-control" value="${defaultStart}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="amc-end">End Date *</label>
          <input type="date" id="amc-end" name="endDate" class="form-control" value="${defaultEndStr}" required>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="amc-amount">Annual Cost ($) *</label>
          <input type="number" id="amc-amount" name="amount" class="form-control" min="1" placeholder="500" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="amc-freq">Service Frequency *</label>
          <select id="amc-freq" name="frequency" class="form-control" required>
            <option value="YEARLY">Yearly</option>
            <option value="HALF_YEARLY">Half Yearly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="amc-remarks">Remarks</label>
        <textarea id="amc-remarks" name="remarks" class="form-control" rows="2" placeholder="Covers 2 cleanings per year and inverter health inspection..."></textarea>
      </div>
    </div>
  `;

  showModal('Add AMC Agreement', formHtml, async (data) => {
    if (!data.startDate || !data.endDate || !data.amount || !data.frequency) {
      throw new Error('Please fill in all required fields.');
    }

    const payload = {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      amount: parseFloat(data.amount),
      frequency: data.frequency,
      remarks: data.remarks || undefined
    };

    await api.post(`/opportunities/${activeOppId}/installation/amcs`, payload);
    showToast('Success', 'AMC contract created.', 'success');
    await loadAmcDetails();
  }, 'Create AMC');
}

// -------------------------------------------------------------
// SERVICE & SUPPORT TICKETS
// -------------------------------------------------------------
async function loadServiceTickets() {
  const tbody = document.getElementById('tickets-tbody');
  if (!tbody) return;

  try {
    const tickets = await api.get(`/opportunities/${activeOppId}/installation/service-requests`);
    if (tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: var(--spacing-md);">No tickets logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = tickets.map(t => {
      const techUser = users.find(u => u.id === t.assignedToId);
      const techName = techUser ? `${techUser.firstName} ${techUser.lastName || ''}` : 'Unassigned';
      let priorityBadge = 'badge-info';
      if (t.priority === 'HIGH' || t.priority === 'URGENT') priorityBadge = 'badge-danger';
      if (t.priority === 'LOW') priorityBadge = 'badge-secondary';

      return `
        <tr>
          <td>
            <div style="font-weight: 600;">${t.title}</div>
            <div style="font-size: var(--fs-xs); color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.description || ''}</div>
          </td>
          <td><span class="badge ${priorityBadge}">${t.priority}</span></td>
          <td style="font-size: var(--fs-xs);">${techName}</td>
          <td>
            <select class="ticket-status-select form-control" data-id="${t.id}" style="padding: 0.125rem 0.25rem; font-size: var(--fs-xs); height: auto; width: auto; display: inline-block;">
              <option value="OPEN" ${t.status === 'OPEN' ? 'selected' : ''}>Open</option>
              <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
              <option value="RESOLVED" ${t.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
              <option value="CLOSED" ${t.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.ticket-status-select').forEach(select => {
      select.onchange = async () => {
        try {
          await api.patch(`/opportunities/${activeOppId}/installation/service-requests/${select.dataset.id}/status`, { status: select.value });
          showToast('Success', 'Ticket status updated.', 'success');
          loadServiceTickets();
        } catch (err) {
          showToast('Error', err.message, 'danger');
        }
      };
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Failed to load service tickets.</td></tr>`;
  }
}

function showCreateTicketModal() {
  const techOpts = users.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName || ''}</option>`).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="tkt-title">Issue Title *</label>
        <input type="text" id="tkt-title" name="title" class="form-control" placeholder="Inverter not communicating/Grid failure..." required>
      </div>
      <div class="form-group">
        <label class="form-label" for="tkt-desc">Description</label>
        <textarea id="tkt-desc" name="description" class="form-control" rows="3" placeholder="Customer reports red status LED on the inverter..."></textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="tkt-priority">Priority *</label>
          <select id="tkt-priority" name="priority" class="form-control" required>
            <option value="LOW">Low</option>
            <option value="MEDIUM" selected>Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="tkt-tech">Assigned Technician</label>
          <select id="tkt-tech" name="assignedToId" class="form-control">
            <option value="">Select Technician</option>
            ${techOpts}
          </select>
        </div>
      </div>
    </div>
  `;

  showModal('Create Service Request Ticket', formHtml, async (data) => {
    if (!data.title) throw new Error('Title is required.');

    const payload = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      assignedToId: data.assignedToId || undefined
    };

    await api.post(`/opportunities/${activeOppId}/installation/service-requests`, payload);
    showToast('Success', 'Service request ticket logged.', 'success');
    await loadServiceTickets();
  }, 'Log Ticket');
}
