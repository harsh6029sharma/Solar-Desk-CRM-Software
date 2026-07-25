import { api } from '../services/api.js';
import { showToast } from '../components/ui.js';

export async function initDashboard() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Total Revenue</span>
            <span class="stat-val" id="stat-revenue">$0</span>
          </div>
          <div class="stat-icon"><i data-lucide="dollar-sign"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Pending Installations</span>
            <span class="stat-val" id="stat-installations">0</span>
          </div>
          <div class="stat-icon"><i data-lucide="wrench"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Accepted Quotations</span>
            <span class="stat-val" id="stat-quotations">0</span>
          </div>
          <div class="stat-icon"><i data-lucide="file-check"></i></div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Pending Tasks</span>
            <span class="stat-val" id="stat-tasks">0</span>
          </div>
          <div class="stat-icon"><i data-lucide="check-square"></i></div>
        </div>
      </div>

      <div class="dashboard-layout">
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3 class="card-title">Leads Pipeline Overview</h3>
          </div>
          <div id="leads-chart-container" style="min-height: 250px; display: flex; align-items: flex-end; justify-content: space-around; padding-top: var(--spacing-lg);">
            <div class="spinner" style="margin: auto;"></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
            <a href="#/contacts" class="btn btn-secondary" style="justify-content: flex-start; text-align: left;">
              <i data-lucide="user-plus"></i> Add New Contact
            </a>
            <a href="#/leads" class="btn btn-secondary" style="justify-content: flex-start; text-align: left;">
              <i data-lucide="zap"></i> Create Lead Profile
            </a>
            <a href="#/products" class="btn btn-secondary" style="justify-content: flex-start; text-align: left;">
              <i data-lucide="package"></i> View Product Catalog
            </a>
            <a href="#/opportunities" class="btn btn-secondary" style="justify-content: flex-start; text-align: left;">
              <i data-lucide="trending-up"></i> Manage Opportunities
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  try {
    const stats = await api.get('/dashboard/stats');
    
    const revEl = document.getElementById('stat-revenue');
    const instEl = document.getElementById('stat-installations');
    const quotEl = document.getElementById('stat-quotations');
    const taskEl = document.getElementById('stat-tasks');

    if (revEl) {
      revEl.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(stats.totalRevenue || 0);
    }
    
    if (instEl) instEl.textContent = stats.pendingInstallations || 0;
    if (quotEl) quotEl.textContent = stats.acceptedQuotations || 0;
    if (taskEl) taskEl.textContent = stats.pendingTasks || 0;
    
    const chartContainer = document.getElementById('leads-chart-container');
    if (!chartContainer) return;

    if (stats.leadsCount && stats.leadsCount.length > 0) {
      const maxCount = Math.max(...stats.leadsCount.map(l => l.count), 1);
      chartContainer.innerHTML = stats.leadsCount.map(lead => {
        const percentage = (lead.count / maxCount) * 80 + 10;
        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm); flex: 1;">
            <span style="font-size: var(--fs-xs); font-weight: 600; color: var(--text-main);">${lead.count}</span>
            <div style="width: 28px; height: ${percentage}px; background-color: var(--primary); border-radius: var(--radius-sm); transition: height 0.5s ease;"></div>
            <span style="font-size: var(--fs-xs); color: var(--text-muted); text-transform: capitalize; max-width: 60px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${lead.status}">
              ${lead.status.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        `;
      }).join('');
    } else {
      chartContainer.innerHTML = `
        <div class="empty-state" style="padding: 0; margin: auto;">
          <i data-lucide="bar-chart-2"></i>
          <p class="empty-state-title">No Lead Data Available</p>
          <p style="font-size: var(--fs-xs);">Create leads to view status distribution.</p>
        </div>
      `;
    }
    
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    showToast('Failed to load stats', err.message, 'danger');
  }
}
