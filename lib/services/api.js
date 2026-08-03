// API Service using Native JS Fetch with Error Masking

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

/**
 * Helper to execute fetch safely with error masking for unhandled server/parse errors
 */
async function safeFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (netErr) {
    throw new Error('Network error. Unable to connect to the server.');
  }

  let json = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch (parseErr) {
      json = null;
    }
  }

  if (!response.ok) {
    // Mask raw server errors, empty responses, 500 HTML pages as clean "Internal Server Error"
    const errorMessage =
      json && typeof json.message === 'string'
        ? json.message
        : 'Internal Server Error. Please try again later.';
    throw new Error(errorMessage);
  }

  return json || { success: true };
}

/**
 * Login with identifier (email, username, NISN) and password
 */
export async function loginApi({ role, identifier, password }) {
  return safeFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, identifier, password }),
  });
}

/**
 * Change user password (first login or voluntary)
 */
export async function changePasswordApi({ oldPassword, newPassword, accessToken }) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return safeFetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

/**
 * Google OAuth Login
 */
export async function googleLoginApi({ role, idToken }) {
  return safeFetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, idToken }),
  });
}

/**
 * Get authenticated user profile (/auth/me)
 */
export async function getMeApi(accessToken) {
  return safeFetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
