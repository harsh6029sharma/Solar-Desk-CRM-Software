const API_BASE = '/api/v1';

// Custom API Error
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Request Helper
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  let payload = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    payload = await response.json();
  }

  if (!response.ok) {
    const errorMsg = payload?.error || payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMsg, payload);
  }

  // API returns standard ApiResponse structure { statusCode, data, message, success }
  return payload?.data !== undefined ? payload.data : payload;
}

export const api = {
  // Session details stored in memory
  user: null,

  async checkAuth() {
    try {
      this.user = await request('/auth/me');
      return this.user;
    } catch (err) {
      this.user = null;
      return null;
    }
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.user = data.user;
    return this.user;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      this.user = null;
    }
  },

  // Contacts
  contacts: {
    list(params = {}) {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.isActive !== undefined) q.append('isActive', params.isActive);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/contacts${queryStr}`);
    },
    get(id) {
      return request(`/contacts/${id}`);
    },
    create(data) {
      return request('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return request(`/contacts/${id}`, { method: 'DELETE' });
    },
    // Addresses nested under Contact
    createAddress(contactId, addressData) {
      return request(`/contacts/${contactId}/addresses`, {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    },
    listAddresses(contactId) {
      return request(`/contacts/${contactId}/addresses`);
    },
    updateAddress(contactId, addressId, addressData) {
      return request(`/contacts/${contactId}/addresses/${addressId}`, {
        method: 'PATCH',
        body: JSON.stringify(addressData),
      });
    },
    deleteAddress(contactId, addressId) {
      return request(`/contacts/${contactId}/addresses/${addressId}`, {
        method: 'DELETE',
      });
    }
  },

  // Leads
  leads: {
    list(params = {}) {
      const q = new URLSearchParams();
      if (params.status) q.append('status', params.status);
      if (params.assignedTo) q.append('assignedTo', params.assignedTo);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/leads${queryStr}`);
    },
    get(id) {
      return request(`/leads/${id}`);
    },
    create(data) {
      return request('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    updateStatus(id, status) {
      return request(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    delete(id) {
      return request(`/leads/${id}`, { method: 'DELETE' });
    },
  },

  // Opportunities
  opportunities: {
    list(params = {}) {
      const q = new URLSearchParams();
      if (params.stage) q.append('stage', params.stage);
      if (params.assignedTo) q.append('assignedTo', params.assignedTo);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/opportunities${queryStr}`);
    },
    get(id) {
      return request(`/opportunities/${id}`);
    },
    create(data) {
      return request('/opportunities', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    updateStage(id, stage) {
      return request(`/opportunities/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
    },
    delete(id) {
      return request(`/opportunities/${id}`, { method: 'DELETE' });
    },
    // Site Survey nested under Opportunity
    getSurvey(oppId) {
      return request(`/opportunities/${oppId}/survey`);
    },
    createSurvey(oppId, surveyData) {
      return request(`/opportunities/${oppId}/survey`, {
        method: 'POST',
        body: JSON.stringify(surveyData),
      });
    },
    updateSurvey(oppId, surveyData) {
      return request(`/opportunities/${oppId}/survey`, {
        method: 'PATCH',
        body: JSON.stringify(surveyData),
      });
    },
    deleteSurvey(oppId) {
      return request(`/opportunities/${oppId}/survey`, { method: 'DELETE' });
    },
    // Tasks nested under Opportunity
    listTasks(oppId) {
      return request(`/opportunities/${oppId}/tasks`);
    },
    createTask(oppId, taskData) {
      return request(`/opportunities/${oppId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    },
  },

  // Tasks (Global endpoints - wait, tasks are mounted at `/opportunities/:opportunityId/tasks`)
  tasks: {
    update(oppId, taskId, taskData) {
      return request(`/opportunities/${oppId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
      });
    },
    updateStatus(oppId, taskId, status) {
      return request(`/opportunities/${oppId}/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    delete(oppId, taskId) {
      return request(`/opportunities/${oppId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
    }
  },

  // Quotations
  quotations: {
    list(params = {}) {
      const q = new URLSearchParams();
      if (params.opportunityId) q.append('opportunityId', params.opportunityId);
      if (params.status) q.append('status', params.status);
      if (params.page) q.append('page', params.page);
      if (params.limit) q.append('limit', params.limit);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/quotations${queryStr}`);
    },
    get(id) {
      return request(`/quotations/${id}`);
    },
    create(data) {
      return request('/quotations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/quotations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    updateStatus(id, status) {
      return request(`/quotations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    delete(id) {
      return request(`/quotations/${id}`, { method: 'DELETE' });
    },
  },

  // Products
  products: {
    list(params = {}) {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.categoryId) q.append('categoryId', params.categoryId);
      if (params.manufacturerId) q.append('manufacturerId', params.manufacturerId);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/products${queryStr}`);
    },
    get(id) {
      return request(`/products/${id}`);
    },
    create(data) {
      return request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id, data) {
      return request(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(id) {
      return request(`/products/${id}`, { method: 'DELETE' });
    },
  },

  // Installations (mounted under `/opportunities/:opportunityId/installation`)
  installations: {
    get(oppId) {
      return request(`/opportunities/${oppId}/installation`);
    },
    create(oppId, data) {
      return request(`/opportunities/${oppId}/installation`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(oppId, data) {
      return request(`/opportunities/${oppId}/installation`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    updateStatus(oppId, status) {
      return request(`/opportunities/${oppId}/installation/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    // AMCs nested under Installation
    listAmcs(oppId) {
      return request(`/opportunities/${oppId}/installation/amcs`);
    },
    createAmc(oppId, amcData) {
      return request(`/opportunities/${oppId}/installation/amcs`, {
        method: 'POST',
        body: JSON.stringify(amcData),
      });
    },
    // Service Requests nested under Installation
    listServiceRequests(oppId) {
      return request(`/opportunities/${oppId}/installation/service-requests`);
    },
    createServiceRequest(oppId, srData) {
      return request(`/opportunities/${oppId}/installation/service-requests`, {
        method: 'POST',
        body: JSON.stringify(srData),
      });
    },
  },

  // AMCs (Global endpoints)
  amcs: {
    update(oppId, amcId, amcData) {
      return request(`/opportunities/${oppId}/installation/amcs/${amcId}`, {
        method: 'PATCH',
        body: JSON.stringify(amcData),
      });
    }
  },

  // Service Requests (Global endpoints)
  serviceRequests: {
    update(oppId, srId, srData) {
      return request(`/opportunities/${oppId}/installation/service-requests/${srId}`, {
        method: 'PATCH',
        body: JSON.stringify(srData),
      });
    },
    updateStatus(oppId, srId, status) {
      return request(`/opportunities/${oppId}/installation/service-requests/${srId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    }
  },

  // Users
  users: {
    list() {
      return request('/users');
    },
    create(data) {
      return request('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Organization
  organization: {
    get() {
      return request('/organizations/me');
    },
    update(data) {
      return request('/organizations/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },
};
