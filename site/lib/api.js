/**
 * Frontend API client for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base fetch wrapper for API calls
 */
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    console.error(`API error: ${res.status} on ${endpoint}`);
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

// User API functions
export async function getUsers() {
  return fetchAPI('/users');
}

export async function getUser(id) {
  return fetchAPI(`/users/${id}`);
}

export async function createUser(userData) {
  return fetchAPI('/users', {
    method: 'POST',
    body: userData,
  });
}

export async function updateUser(id, userData) {
  return fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: userData,
  });
}

export async function deleteUser(id, token) {
  return fetchAPI(`/users/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Auth functions
export async function login(credentials) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export async function register(userData) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

// Add any other API functions you need