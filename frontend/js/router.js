import { isAuthenticated, hasAnyPermission, hasSessionIndicator } from './services/auth.js';

const routes = [];

export function addRoute(path, handler, options = {}) {
  const paramNames = [];
  const regexPath = path
    .replace(/:([^\/]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^\/]+)';
    })
    .replace(/\//g, '\\/');
  
  routes.push({
    path,
    regex: new RegExp(`^${regexPath}$`),
    paramNames,
    handler,
    requiresAuth: options.requiresAuth !== false,
    permissions: options.permissions || []
  });
}

export async function navigateTo(hash) {
  window.location.hash = hash;
}

export async function resolveRoute() {
  let hash = window.location.hash.slice(1) || '/';
  
  // Normalize hash (remove trailing slash if present, unless it's just '/')
  if (hash.length > 1 && hash.endsWith('/')) {
    hash = hash.slice(0, -1);
  }

  // Parse query parameters
  let path = hash;
  let params = {};
  const queryIdx = hash.indexOf('?');
  if (queryIdx !== -1) {
    path = hash.slice(0, queryIdx);
    const queryString = hash.slice(queryIdx + 1);
    queryString.split('&').forEach(part => {
      const [k, v] = part.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
  }

  let match = null;
  
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      match = r;
      r.paramNames.forEach((name, index) => {
        params[name] = m[index + 1];
      });
      break;
    }
  }
  
  if (!match) {
    renderError(404, 'Page Not Found');
    return;
  }
  
  if (match.requiresAuth) {
    if (!isAuthenticated()) {
      if (hasSessionIndicator()) {
        try {
          const { fetchCurrentUser } = await import('./services/auth.js');
          await fetchCurrentUser();
        } catch (e) {
          window.location.hash = '#/login';
          return;
        }
      } else {
        window.location.hash = '#/login';
        return;
      }
    }
    
    if (match.permissions.length > 0 && !hasAnyPermission(match.permissions)) {
      renderError(403, 'Unauthorized Access');
      return;
    }
  } else {
    if (hash === '/login' && isAuthenticated()) {
      window.location.hash = '#/';
      return;
    }
  }
  
  const appContainer = document.getElementById('app-container');
  if (hash === '/login') {
    appContainer.classList.add('unauthenticated');
    appContainer.classList.remove('authenticated');
  } else {
    appContainer.classList.remove('unauthenticated');
    appContainer.classList.add('authenticated');
    await renderShell();
  }
  
  try {
    showLoader(true);
    await match.handler(params);
  } catch (err) {
    console.error(err);
    renderError(500, err.message || 'An error occurred while loading this page');
  } finally {
    showLoader(false);
  }
}

function showLoader(visible) {
  const loader = document.getElementById('global-loader');
  if (loader) {
    if (visible) loader.classList.remove('hide');
    else loader.classList.add('hide');
  }
}

export function renderError(code, message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="empty-state" style="margin-top: 100px;">
      <i data-lucide="alert-triangle" style="color: var(--danger); width: 64px; height: 64px;"></i>
      <h2 class="empty-state-title" style="font-size: 2rem; margin-top: var(--spacing-md);">${code}</h2>
      <p style="color: var(--text-muted); margin-top: var(--spacing-sm);">${message}</p>
      <button id="error-go-home-btn" class="btn btn-primary" style="margin-top: var(--spacing-lg);">Go to Dashboard</button>
    </div>
  `;
  
  const btn = document.getElementById('error-go-home-btn');
  if (btn) {
    btn.onclick = () => window.location.hash = '#/';
  }

  if (window.lucide) window.lucide.createIcons();
}

let shellRendered = false;

async function renderShell() {
  if (shellRendered) {
    highlightActiveLink();
    return;
  }
  
  const { renderSidebar, bindSidebarEvents } = await import('./components/sidebar.js');
  const { renderNavbar, bindNavbarEvents } = await import('./components/navbar.js');
  
  const sidebarMount = document.getElementById('sidebar-mount');
  const navbarMount = document.getElementById('navbar-mount');
  
  if (sidebarMount) sidebarMount.innerHTML = renderSidebar();
  if (navbarMount) navbarMount.innerHTML = renderNavbar();
  
  bindSidebarEvents();
  bindNavbarEvents();
  highlightActiveLink();
  
  shellRendered = true;
  if (window.lucide) window.lucide.createIcons();
}

export function resetShell() {
  shellRendered = false;
}

export function highlightActiveLink() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === '#/') {
      if (hash === '#/' || hash === '' || hash === '#') {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    } else {
      if (hash.startsWith(href)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}
