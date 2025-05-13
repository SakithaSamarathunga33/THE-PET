/**
 * API client for communicating with the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Makes a request to the backend API
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

// Auth APIs
export async function deleteUser(id, token) {
  return fetchAPI(`/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function loginUser(credentials) {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export async function registerUser(userData) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

// Add other API methods as needed