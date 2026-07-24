import { api } from './api';

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.appContainer = null;
    
    // Bind event handlers
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('click', (e) => this.handleLinkClick(e));
  }

  init(containerId) {
    this.appContainer = document.getElementById(containerId);
    this.handleRoute();
  }

  register(path, viewRenderer, requireAuth = true) {
    this.routes[path] = { renderer: viewRenderer, requireAuth };
  }

  // Navigate programmatically
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  // Intercept anchor clicks
  handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    // Check if it is a local relative route
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      this.navigate(href);
    }
  }

  // Route match logic (supports basic dynamic routes like /leads/:id)
  matchRoute(path) {
    const routeKeys = Object.keys(this.routes);
    for (const key of routeKeys) {
      const regex = new RegExp('^' + key.replace(/:[^\s/]+/g, '([^/]+)') + '$');
      const match = path.match(regex);
      if (match) {
        const params = {};
        const paramNames = (key.match(/:[^\s/]+/g) || []).map(name => name.slice(1));
        paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });
        return {
          route: this.routes[key],
          params
        };
      }
    }
    return null;
  }

  // Handle active routing
  async handleRoute() {
    const path = window.location.pathname;
    const match = this.matchRoute(path);

    if (!match) {
      this.renderNotFound();
      return;
    }

    const { route, params } = match;

    // Check user authentication
    await api.checkAuth();

    if (route.requireAuth && !api.user) {
      this.navigate('/login');
      return;
    }

    if (path === '/login' && api.user) {
      this.navigate('/');
      return;
    }

    // Render the view
    try {
      this.appContainer.innerHTML = '';
      
      // If we are logged in (and not on login page), we render the main wrapper layout
      if (api.user && path !== '/login') {
        this.renderAppWrapper(route, params);
      } else {
        // Just render the bare page (for login)
        const element = await route.renderer(params);
        this.appContainer.appendChild(element);
      }

      // Initialize any lucide icons on the page
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (error) {
      console.error('Error rendering route:', error);
      this.renderError(error);
    }
  }

  // App Wrapper Layout: Sidebar and Main Area
  async renderAppWrapper(route, params) {
    // Generate layout container
    const layout = document.createElement('div');
    layout.className = 'app-layout';

    // Sidebar
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    
    // User Name Initials
    const initials = api.user 
      ? `${api.user.firstName[0]}${api.user.lastName ? api.user.lastName[0] : ''}`.toUpperCase()
      : 'U';
    const fullName = api.user ? `${api.user.firstName} ${api.user.lastName || ''}`.trim() : 'User';
    const roleText = api.user?.roles?.[0]?.role?.name || 'Staff';

    sidebar.innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-logo">S</div>
        <span class="sidebar-title">SolarDesk</span>
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-item ${window.location.pathname === '/' ? 'active' : ''}">
          <a href="/"><i data-lucide="layout-dashboard"></i>Dashboard</a>
        </li>
        <li class="sidebar-item ${window.location.pathname.startsWith('/contacts') ? 'active' : ''}">
          <a href="/contacts"><i data-lucide="users"></i>Contacts</a>
        </li>
        <li class="sidebar-item ${window.location.pathname.startsWith('/leads') ? 'active' : ''}">
          <a href="/leads"><i data-lucide="contact-2"></i>Leads</a>
        </li>
        <li class="sidebar-item ${window.location.pathname.startsWith('/opportunities') ? 'active' : ''}">
          <a href="/opportunities"><i data-lucide="trending-up"></i>Opportunities</a>
        </li>
        <li class="sidebar-item ${window.location.pathname.startsWith('/quotations') ? 'active' : ''}">
          <a href="/quotations"><i data-lucide="file-text"></i>Quotations</a>
        </li>
        <li class="sidebar-item ${window.location.pathname.startsWith('/products') ? 'active' : ''}">
          <a href="/products"><i data-lucide="package"></i>Products</a>
        </li>
      </ul>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">${initials}</div>
          <div class="user-info">
            <span class="user-name">${fullName}</span>
            <span class="user-role">${roleText}</span>
          </div>
        </div>
        <button class="btn-logout" id="sidebar-logout-btn" title="Logout">
          <i data-lucide="log-out"></i>
        </button>
      </div>
    `;

    // Main area wrapper
    const mainWrapper = document.createElement('main');
    mainWrapper.className = 'main-wrapper';

    // Header / Top bar
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';
    topBar.innerHTML = `
      <h1 class="page-title" id="page-header-title">SolarDesk CRM</h1>
      <div class="top-bar-actions">
        <div class="user-avatar" style="background:#4f46e5; width:36px; height:36px;">${initials}</div>
      </div>
    `;

    // Main content box
    const contentBody = document.createElement('div');
    contentBody.className = 'content-body';
    contentBody.id = 'content-body-mount';

    mainWrapper.appendChild(topBar);
    mainWrapper.appendChild(contentBody);

    layout.appendChild(sidebar);
    layout.appendChild(mainWrapper);

    this.appContainer.appendChild(layout);

    // Bind logout button
    document.getElementById('sidebar-logout-btn').addEventListener('click', async () => {
      await api.logout();
      this.navigate('/login');
    });

    // Render inner content
    const element = await route.renderer(params);
    contentBody.appendChild(element);
  }

  renderNotFound() {
    this.appContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px;">
        <h1 style="font-family:'Outfit'; font-size:3rem; color:#818cf8;">404</h1>
        <p style="color:var(--text-muted);">The requested resource was not found.</p>
        <a href="/" class="btn btn-primary">Go to Dashboard</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  renderError(error) {
    this.appContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px; padding:20px;">
        <h1 style="font-family:'Outfit'; font-size:2rem; color:var(--danger);">Something went wrong</h1>
        <p style="color:var(--text-muted); text-align:center; max-width:500px;">${error.message || error}</p>
        <button onclick="window.location.reload()" class="btn btn-secondary">Retry</button>
      </div>
    `;
  }
}

export const router = new Router();
export default router;
