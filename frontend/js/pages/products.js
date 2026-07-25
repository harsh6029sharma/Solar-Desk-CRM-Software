import { api } from '../services/api.js';
import { showToast, showModal, showConfirm } from '../components/ui.js';
import { hasPermission } from '../services/auth.js';

let categories = [];
let manufacturers = [];
let currentPage = 1;
const limit = 10;

export async function initProducts() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
      
      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-md); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex: 1; flex-wrap: wrap;">
          <div class="form-group" style="margin-bottom: 0; min-width: 200px; position: relative;">
            <input type="text" id="product-search" class="form-control" placeholder="Search products..." style="padding-left: 2.25rem; width: 100%;">
            <i data-lucide="search" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
          </div>
          <select id="product-filter-category" class="form-control">
            <option value="">All Categories</option>
          </select>
          <select id="product-filter-manufacturer" class="form-control">
            <option value="">All Manufacturers</option>
          </select>
          <select id="product-filter-status" class="form-control">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        
        ${hasPermission('product:create') ? `
          <button id="add-product-btn" class="btn btn-primary">
            <i data-lucide="plus"></i> Add Product
          </button>
        ` : ''}
      </div>

      <!-- Table Card -->
      <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Capacity</th>
                <th>Base Price</th>
                <th>Status</th>
                <th style="width: 120px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody id="products-table-body">
              <tr>
                <td colspan="8" style="text-align: center; padding: var(--spacing-xl);">
                  <div class="spinner" style="margin: auto;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); border-top: 1px solid var(--border-color); background-color: var(--bg-app);">
          <span style="font-size: var(--fs-xs); color: var(--text-muted);" id="pagination-info">Showing 0 of 0 products</span>
          <div style="display: flex; gap: var(--spacing-xs);">
            <button id="prev-page-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;"><i data-lucide="chevron-left" style="width:16px; height:16px;"></i></button>
            <button id="next-page-btn" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem;"><i data-lucide="chevron-right" style="width:16px; height:16px;"></i></button>
          </div>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Load Filters & Products
  await loadFilterOptions();
  
  const searchInput = document.getElementById('product-search');
  const catSelect = document.getElementById('product-filter-category');
  const manSelect = document.getElementById('product-filter-manufacturer');
  const statusSelect = document.getElementById('product-filter-status');
  
  let searchTimeout;
  const triggerFetch = () => {
    fetchAndRenderProducts(searchInput.value, catSelect.value, manSelect.value, statusSelect.value);
  };

  searchInput.onkeyup = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      triggerFetch();
    }, 300);
  };
  
  catSelect.onchange = () => { currentPage = 1; triggerFetch(); };
  manSelect.onchange = () => { currentPage = 1; triggerFetch(); };
  statusSelect.onchange = () => { currentPage = 1; triggerFetch(); };

  document.getElementById('prev-page-btn').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      triggerFetch();
    }
  };
  document.getElementById('next-page-btn').onclick = () => {
    currentPage++;
    triggerFetch();
  };

  // Add Product button
  const addBtn = document.getElementById('add-product-btn');
  if (addBtn) addBtn.onclick = () => showProductFormModal();

  triggerFetch();
}

async function loadFilterOptions() {
  try {
    const [cats, mans] = await Promise.all([
      api.get('/products/categories'),
      api.get('/products/manufacturers')
    ]);
    categories = cats;
    manufacturers = mans;

    const catSelect = document.getElementById('product-filter-category');
    const manSelect = document.getElementById('product-filter-manufacturer');

    if (catSelect) {
      catSelect.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    if (manSelect) {
      manSelect.innerHTML = '<option value="">All Manufacturers</option>' + 
        manufacturers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    }
  } catch (err) {
    showToast('Filters Error', 'Could not load category or manufacturer lists', 'danger');
  }
}

async function fetchAndRenderProducts(search = '', categoryId = '', manufacturerId = '', isActive = 'true') {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  try {
    let queryParams = [`page=${currentPage}`, `limit=${limit}`, `isActive=${isActive}`];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (categoryId) queryParams.push(`categoryId=${categoryId}`);
    if (manufacturerId) queryParams.push(`manufacturerId=${manufacturerId}`);

    const result = await api.get(`/products?${queryParams.join('&')}`);

    const totalPages = Math.ceil(result.total / limit);
    document.getElementById('pagination-info').textContent = 
      `Page ${result.page} of ${totalPages || 1} (Total ${result.total} products)`;
    
    document.getElementById('prev-page-btn').disabled = currentPage <= 1;
    document.getElementById('next-page-btn').disabled = currentPage >= totalPages;

    if (result.products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
            <div class="empty-state" style="padding: 0;">
              <i data-lucide="package"></i>
              <p class="empty-state-title">No products found</p>
              <p style="font-size: var(--fs-xs);">Register solar panels, inverters, and parts to create quotations.</p>
            </div>
          </td>
        </tr>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = result.products.map(p => {
      const catName = categories.find(c => c.id === p.categoryId)?.name || 'N/A';
      const manName = manufacturers.find(m => m.id === p.manufacturerId)?.name || 'N/A';
      const priceStr = p.basePrice ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.basePrice) : 'N/A';

      return `
        <tr>
          <td style="font-weight: 600;">${p.name}</td>
          <td style="font-family: monospace;">${p.sku}</td>
          <td>${catName}</td>
          <td>${manName}</td>
          <td>${p.capacity}</td>
          <td>${priceStr}</td>
          <td>
            <span class="badge ${p.isActive ? 'badge-success' : 'badge-danger'}">
              ${p.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="text-align: right; display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm edit-product-row" data-id="${p.id}" title="Edit" style="padding: 0.25rem 0.5rem;">
              <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
            </button>
            ${p.isActive && hasPermission('product:delete') ? `
              <button class="btn btn-danger btn-sm deactivate-product-row" data-id="${p.id}" title="Deactivate" style="padding: 0.25rem 0.5rem; background-color: var(--danger-light); color: var(--danger-text); border-color: transparent;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Bind event listeners
    tbody.querySelectorAll('.edit-product-row').forEach(btn => {
      btn.onclick = () => showProductFormModal(btn.dataset.id);
    });

    tbody.querySelectorAll('.deactivate-product-row').forEach(btn => {
      btn.onclick = () => handleDeactivateProduct(btn.dataset.id);
    });

  } catch (err) {
    showToast('Fetch Failed', err.message, 'danger');
  }
}

function showProductFormModal(productId = null) {
  const isEdit = productId !== null;
  const title = isEdit ? 'Edit Product' : 'Add Product';

  const catOptions = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const manOptions = manufacturers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

  let formHtml = `
    <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
      <div class="form-group">
        <label class="form-label" for="prod-name">Product Name *</label>
        <input type="text" id="prod-name" name="name" class="form-control" required placeholder="Mono PERC Solar Panel 450W">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="prod-category">Category *</label>
          <select id="prod-category" name="categoryId" class="form-control" required>
            <option value="">Select Category</option>
            ${catOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="prod-manufacturer">Manufacturer *</label>
          <select id="prod-manufacturer" name="manufacturerId" class="form-control" required>
            <option value="">Select Manufacturer</option>
            ${manOptions}
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
        <div class="form-group">
          <label class="form-label" for="prod-sku">SKU Code *</label>
          <input type="text" id="prod-sku" name="sku" class="form-control" required placeholder="SOL-MONO-450">
        </div>
        <div class="form-group">
          <label class="form-label" for="prod-capacity">Capacity *</label>
          <input type="text" id="prod-capacity" name="capacity" class="form-control" required placeholder="450W">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="prod-price">Base Unit Price ($)</label>
        <input type="number" id="prod-price" name="basePrice" class="form-control" min="1" step="0.01" placeholder="250.00">
      </div>
      <div class="form-group">
        <label class="form-label" for="prod-desc">Description</label>
        <textarea id="prod-desc" name="description" class="form-control" rows="3" placeholder="Additional tech specifications..."></textarea>
      </div>
    </div>
  `;

  showModal(title, formHtml, async (data) => {
    if (!data.name || !data.categoryId || !data.manufacturerId || !data.sku || !data.capacity) {
      throw new Error('Please fill in all required fields.');
    }

    const payload = {
      name: data.name,
      categoryId: data.categoryId,
      manufacturerId: data.manufacturerId,
      sku: data.sku,
      capacity: data.capacity,
      basePrice: data.basePrice || undefined,
      description: data.description || undefined,
    };

    if (isEdit) {
      await api.patch(`/products/${productId}`, payload);
      showToast('Success', 'Product updated successfully.', 'success');
    } else {
      await api.post('/products', payload);
      showToast('Success', 'Product created successfully.', 'success');
    }

    const searchInput = document.getElementById('product-search');
    const catSelect = document.getElementById('product-filter-category');
    const manSelect = document.getElementById('product-filter-manufacturer');
    const statusSelect = document.getElementById('product-filter-status');
    fetchAndRenderProducts(searchInput?.value, catSelect?.value, manSelect?.value, statusSelect?.value);
  }, isEdit ? 'Save Changes' : 'Create Product');

  if (isEdit) {
    api.get(`/products/${productId}`).then(p => {
      const name = document.getElementById('prod-name');
      const cat = document.getElementById('prod-category');
      const man = document.getElementById('prod-manufacturer');
      const sku = document.getElementById('prod-sku');
      const cap = document.getElementById('prod-capacity');
      const price = document.getElementById('prod-price');
      const desc = document.getElementById('prod-desc');

      if (name) name.value = p.name || '';
      if (cat) cat.value = p.categoryId || '';
      if (man) man.value = p.manufacturerId || '';
      if (sku) sku.value = p.sku || '';
      if (cap) cap.value = p.capacity || '';
      if (price) price.value = p.basePrice || '';
      if (desc) desc.value = p.description || '';
    }).catch(err => {
      showToast('Error', 'Failed to retrieve product details', 'danger');
    });
  }
}

function handleDeactivateProduct(productId) {
  showConfirm(
    'Deactivate Product',
    'Are you sure you want to deactivate this product? It will no longer show in search lists or invoice builders.',
    async () => {
      await api.delete(`/products/${productId}`);
      showToast('Success', 'Product deactivated.', 'success');
      
      const searchInput = document.getElementById('product-search');
      const catSelect = document.getElementById('product-filter-category');
      const manSelect = document.getElementById('product-filter-manufacturer');
      const statusSelect = document.getElementById('product-filter-status');
      fetchAndRenderProducts(searchInput?.value, catSelect?.value, manSelect?.value, statusSelect?.value);
    },
    'Deactivate'
  );
}
