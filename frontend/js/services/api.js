// const BASE_URL = 'http://localhost:7000';
const BASE_URL = 'https://solar-desk-crm-software.onrender.com';

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  refreshQueue = [];
};

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  
  options.headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  }
  
  options.credentials = 'include';
  
  try {
    const response = await fetch(url, options);
    
    // Check if unauthorized and token refresh is possible
    if (response.status === 401) {
      if (endpoint === '/auth/refresh' || endpoint === '/auth/login') {
        throw new Error('Authentication failed');
      }
      
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });
          if (!refreshRes.ok) {
            throw new Error('Refresh token invalid');
          }
          isRefreshing = false;
          processQueue(null);
          return request(endpoint, options); // Retry original request
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError);
          // Trigger redirect event
          window.dispatchEvent(new CustomEvent('auth-expired'));
          throw refreshError;
        }
      } else {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ 
            resolve: () => resolve(request(endpoint, options)), 
            reject 
          });
        });
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.message || 'Request failed';
      const validationErrors = data.errors || [];
      const err = new Error(errorMsg);
      err.status = response.status;
      err.errors = validationErrors;
      throw err;
    }
    
    return data.data; // Unwrap standard API response structure
  } catch (error) {
    throw error;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', ...(body && { body: JSON.stringify(body) }) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', ...(body && { body: JSON.stringify(body) }) }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', ...(body && { body: JSON.stringify(body) }) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};
