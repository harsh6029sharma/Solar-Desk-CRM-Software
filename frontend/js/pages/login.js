import { login } from '../services/auth.js';
import { showToast } from '../components/ui.js';

export function initLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <i data-lucide="sun"></i>
            <span>SolarDesk</span>
          </div>
          <p class="login-subtitle">Enterprise Solar SaaS Portal</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <input type="email" id="login-email" name="email" class="form-control" placeholder="name@company.com" required autocomplete="email">
          </div>
          <div class="form-group" style="margin-bottom: var(--spacing-lg);">
            <label class="form-label" for="login-password">Password</label>
            <input type="password" id="login-password" name="password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <div id="login-error" style="color: var(--danger); font-size: var(--fs-sm); margin-bottom: var(--spacing-md); text-align: center; display: none;"></div>
          <button id="login-btn" type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">
            <span>Sign In</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  form.onsubmit = async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Signing in...';

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await login(email, password);
      showToast('Welcome Back', 'Successfully signed into SolarDesk.', 'success');
      window.location.hash = '#/';
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed. Please check credentials.';
      errorEl.style.display = 'block';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Sign In';
      }
    }
  };
}
