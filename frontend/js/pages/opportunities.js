import { api } from '../services/api.js';
import { showToast } from '../components/ui.js';

let currentStageFilter = '';
let currentPage = 1;
const limit = 10;
let users = [];

export async function initOpportunities() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Toolbar & Stages Filter -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex: 1;">
          <select id="opportunity-filter-stage" class="form-control" style="width: auto;">
            <option value="">All Pipeline Stages</option>
            <option value="QUALIFICATION">Qualification</option>
            <option value="SITE_SURVEY">Site Survey</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won (Closed)</option>
            <option value="LOST">Lost (Closed)</option>
          </select>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Opportunity Number</th>
                <th>Contact Customer</th>
                <th>Revenue Value</th>
                <th>Probability</th>
                <th>Close Date</th>
                <th>Assigned Owner</th>
                <th>Pipeline Stage</th>
              </tr>
            </thead>
            <tbody id="opportunities-table-body">
              <tr>
                <td colspan="7" style="text-align: center; padding: var(--spacing-xl);">
                  <div class="spinner" style="margin: auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-top: 1px solid var(--border-color); background-color: var(--bg-app);">
          <span style="font-size: var(--fs-xs); color: var(--text-muted);" id="pagination-info">Showing 0 of 0 opportunities</span>
          <div style="display: flex; gap: var(--spacing-xs);">
            <button id="prev-page-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;"><i data-lucide="chevron-left" style="width:16px; height:16px;"></i></button>
            <button id="next-page-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;"><i data-lucide="chevron-right" style="width:16px; height:16px;"></i></button>
          </div>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load Users options to map ids to names
  try {
    users = await api.get('/users');
  } catch (e) {
    // Ignore users list fetch failures
  }

  // Filter Event
  const stageSelect = document.getElementById('opportunity-filter-stage');
  stageSelect.onchange = () => {
    currentStageFilter = stageSelect.value;
    currentPage = 1;
    fetchAndRenderOpportunities();
  };

  // Pagination buttons
  document.getElementById('prev-page-btn').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndRenderOpportunities();
    }
  };
  document.getElementById('next-page-btn').onclick = () => {
    currentPage++;
    fetchAndRenderOpportunities();
  };

  fetchAndRenderOpportunities();
}

async function fetchAndRenderOpportunities() {
  const tbody = document.getElementById('opportunities-table-body');
  if (!tbody) return;

  try {
    let queryParams = [`page=${currentPage}`, `limit=${limit}`];
    if (currentStageFilter) queryParams.push(`stage=${currentStageFilter}`);

    const result = await api.get(`/opportunities?${queryParams.join('&')}`);

    const totalPages = Math.ceil(result.total / limit);
    document.getElementById('pagination-info').textContent = 
      `Page ${result.page} of ${totalPages || 1} (Total ${result.total} opportunities)`;
    
    document.getElementById('prev-page-btn').disabled = currentPage <= 1;
    document.getElementById('next-page-btn').disabled = currentPage >= totalPages;

    if (result.opportunities.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
            <div class="empty-state" style="padding: 0;">
              <i data-lucide="trending-up"></i>
              <p class="empty-state-title">No opportunities found</p>
              <p style="font-size: var(--fs-xs);">Convert a lead to create a sales opportunity.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = result.opportunities.map(o => {
      const contactName = o.lead?.contact ? `${o.lead.contact.firstName} ${o.lead.contact.lastName || ''}` : 'N/A';
      const repName = users.find(u => u.id === o.assignedTo)?.firstName || 'Unassigned';
      const revenueStr = o.expectedRevenue ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(o.expectedRevenue) : 'N/A';
      const dateStr = o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString() : 'N/A';
      
      let stageBadge = 'badge-info';
      if (o.stage === 'WON') stageBadge = 'badge-success';
      if (o.stage === 'LOST') stageBadge = 'badge-danger';
      if (o.stage === 'NEGOTIATION' || o.stage === 'PROPOSAL') stageBadge = 'badge-warning';

      return `
        <tr style="cursor: pointer;" onclick="window.location.hash = '#/opportunities/${o.id}'">
          <td style="font-weight: 600; font-family: monospace;">${o.opportunityNumber}</td>
          <td>${contactName}</td>
          <td>${revenueStr}</td>
          <td>${o.probability !== null ? o.probability + '%' : 'N/A'}</td>
          <td>${dateStr}</td>
          <td>${repName}</td>
          <td>
            <span class="badge ${stageBadge}">${o.stage.replace('_', ' ')}</span>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

  } catch (err) {
    showToast('Fetch Failed', err.message, 'danger');
  }
}
