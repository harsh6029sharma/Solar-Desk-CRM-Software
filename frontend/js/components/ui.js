export function showToast(title, description, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check-circle';
  if (type === 'danger') icon = 'alert-triangle';
  if (type === 'warning') icon = 'alert-circle';

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${description}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);
  
  if (window.lucide) window.lucide.createIcons();

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  closeBtn.onclick = removeToast;
  setTimeout(removeToast, duration);
}

export function showModal(title, bodyHtml, onSaveCallback = null, saveBtnText = 'Save') {
  const overlay = document.getElementById('modal-container');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!overlay || !titleEl || !bodyEl || !closeBtn) return;

  titleEl.textContent = title;
  
  let footerHtml = '';
  if (onSaveCallback) {
    footerHtml = `
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:var(--spacing-sm); margin-top:var(--spacing-lg); padding-top:var(--spacing-md); border-top:1px solid var(--border-color);">
        <button id="modal-cancel-btn" type="button" class="btn btn-secondary">Cancel</button>
        <button id="modal-save-btn" type="submit" class="btn btn-primary">${saveBtnText}</button>
      </div>
    `;
  }
  
  bodyEl.innerHTML = `
    <form id="modal-form">
      ${bodyHtml}
      ${footerHtml}
    </form>
  `;

  overlay.classList.remove('hide');
  if (window.lucide) window.lucide.createIcons();

  const closeModal = () => {
    overlay.classList.add('hide');
  };

  closeBtn.onclick = closeModal;

  const cancelBtn = document.getElementById('modal-cancel-btn');
  if (cancelBtn) cancelBtn.onclick = closeModal;

  const form = document.getElementById('modal-form');
  if (form && onSaveCallback) {
    form.onsubmit = async (event) => {
      event.preventDefault();
      const saveBtn = document.getElementById('modal-save-btn');
      saveBtn.disabled = true;
      const initialText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      try {
        const formData = new FormData(form);
        const data = {};
        
        // Populate inputs including checkboxes
        form.querySelectorAll('[name]').forEach((input) => {
          if (input.type === 'checkbox') {
            data[input.name] = input.checked;
          } else if (input.type === 'number') {
            data[input.name] = input.value !== '' ? Number(input.value) : undefined;
          } else {
            data[input.name] = input.value;
          }
        });

        await onSaveCallback(data);
        closeModal();
      } catch (err) {
        showToast('Error', err.message || 'Operation failed', 'danger');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = initialText;
        }
      }
    };
  }
}

export function hideModal() {
  const overlay = document.getElementById('modal-container');
  if (overlay) overlay.classList.add('hide');
}

export function showConfirm(title, message, onConfirm, confirmBtnText = 'Confirm') {
  const bodyHtml = `
    <p style="color: var(--text-muted); font-size: var(--fs-sm);">${message}</p>
  `;
  showModal(title, bodyHtml, async () => {
    await onConfirm();
  }, confirmBtnText);
}
