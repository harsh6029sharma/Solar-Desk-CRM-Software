import { addRoute, resolveRoute } from './router.js';

// Register SPA routes with page controllers and RBAC permissions
addRoute('/login', async () => {
  const { initLogin } = await import('./pages/login.js');
  initLogin();
}, { requiresAuth: false });

addRoute('/', async () => {
  const { initDashboard } = await import('./pages/dashboard.js');
  initDashboard();
});

addRoute('/users', async () => {
  const { initUsers } = await import('./pages/users.js');
  initUsers();
}, { permissions: ['user:read'] });

addRoute('/roles', async () => {
  const { initRoles } = await import('./pages/roles.js');
  initRoles();
}, { permissions: ['role:read'] });

addRoute('/contacts', async () => {
  const { initContacts } = await import('./pages/contacts.js');
  initContacts();
}, { permissions: ['contact:read'] });

addRoute('/contacts/:id', async (params) => {
  const { initContactDetails } = await import('./pages/contact-details.js');
  initContactDetails(params.id);
}, { permissions: ['contact:read'] });

addRoute('/products', async () => {
  const { initProducts } = await import('./pages/products.js');
  initProducts();
}, { permissions: ['product:read'] });

addRoute('/leads', async () => {
  const { initLeads } = await import('./pages/leads.js');
  initLeads();
}, { permissions: ['lead:read'] });

addRoute('/opportunities', async () => {
  const { initOpportunities } = await import('./pages/opportunities.js');
  initOpportunities();
}, { permissions: ['opportunity:read'] });

addRoute('/opportunities/:id', async (params) => {
  const { initOpportunityDetails } = await import('./pages/opportunity-details.js');
  initOpportunityDetails(params.id);
}, { permissions: ['opportunity:read'] });

addRoute('/quotations/create', async (params) => {
  const { initQuotationCreate } = await import('./pages/quotations.js');
  initQuotationCreate(params.opportunityId);
}, { permissions: ['quotation:create'] });

addRoute('/quotations/:id', async (params) => {
  const { initQuotationDetails } = await import('./pages/quotations.js');
  initQuotationDetails(params.id);
}, { permissions: ['quotation:read'] });

addRoute('/settings', async () => {
  const { initSettings } = await import('./pages/settings.js');
  initSettings();
});

// Route listener registration
window.addEventListener('hashchange', resolveRoute);
window.addEventListener('DOMContentLoaded', resolveRoute);

// Handle auth expired event
window.addEventListener('auth-expired', async () => {
  const { resetShell } = await import('./router.js');
  resetShell();
  window.location.hash = '#/login';
});
