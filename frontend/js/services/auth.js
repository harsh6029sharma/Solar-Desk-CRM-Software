import { api } from './api.js';

let currentUser = null;
let userPermissions = [];
let userRoles = [];

export async function login(email, password) {
  try {
    const data = await api.post('/auth/login', { email, password });
    await fetchCurrentUser();
    return currentUser;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Ignore fail to logout on backend
  } finally {
    currentUser = null;
    userPermissions = [];
    userRoles = [];
    localStorage.removeItem('hasSession');
    window.location.hash = '#/login';
  }
}

export async function fetchCurrentUser() {
  try {
    const data = await api.get('/auth/me');
    
    // Flatten roles and permissions
    userRoles = data.roles.map((r) => r.role.name);
    userPermissions = [
      ...new Set(
        data.roles.flatMap((r) => 
          r.role.rolePermissions.map((rp) => rp.permission.name)
        )
      ),
    ];
    
    currentUser = {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      organizationId: data.organizationId,
      organizationName: data.organization?.name || '',
      lastLoginAt: data.lastLoginAt,
      createdAt: data.createdAt,
      roles: userRoles,
      permissions: userPermissions,
    };
    
    localStorage.setItem('hasSession', 'true');
    return currentUser;
  } catch (error) {
    currentUser = null;
    userPermissions = [];
    userRoles = [];
    localStorage.removeItem('hasSession');
    throw error;
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function isAuthenticated() {
  return currentUser !== null;
}

export function hasSessionIndicator() {
  return localStorage.getItem('hasSession') === 'true';
}

export function hasPermission(permission) {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(permissions = []) {
  if (permissions.length === 0) return true;
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasRole(role) {
  return userRoles.includes(role);
}
