import type { AuthTokens, User } from '@/lib/stores/auth.store';

// Same-origin. next.config.ts rewrites /api/v1/* to the backend, so the
// browser never talks to another origin and CORS never applies.
const API_BASE_URL = '/api/v1';

/** Field-level validation errors, already flattened by the backend. */
export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[];

  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: FieldError[];
}

/**
 * Every response is masked to a clean message. An HTML error page, an empty
 * body, or a parse failure all surface as a generic error rather than raw
 * server output.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError('Network error. Unable to reach the server.', 0);
  }

  let body: Partial<ApiEnvelope<T>> | null = null;
  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      typeof body?.message === 'string'
        ? body.message
        : 'Internal server error. Please try again later.',
      response.status,
      // The backend sends these for 400s; the old client threw them away, so
      // per-field messages never reached the form.
      Array.isArray(body?.errors) ? body.errors : []
    );
  }

  return (body ?? { success: true, message: '', data: null as T }) as ApiEnvelope<T>;
}

const jsonPost = (payload: unknown, accessToken?: string | null): RequestInit => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  },
  body: JSON.stringify(payload),
});

export interface SessionPayload {
  user: User;
  mustChangePassword: boolean;
  tokens: AuthTokens;
}

export function loginApi(payload: { email: string; password: string }) {
  return request<SessionPayload>('/auth/login', jsonPost(payload));
}

export function googleLoginApi(payload: { idToken: string }) {
  return request<SessionPayload & { tempPasswordCleared?: boolean }>(
    '/auth/google',
    jsonPost(payload)
  );
}

export function refreshApi(payload: { refreshToken: string }) {
  return request<{ accessToken: string }>('/auth/refresh', jsonPost(payload));
}

export function getMeApi(accessToken: string) {
  return request<{ user: User }>('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Requires the current password — a pending change never waives it. */
export function changePasswordApi(
  payload: { currentPassword: string; newPassword: string },
  accessToken: string
) {
  return request<{ user: User }>('/auth/change-password', jsonPost(payload, accessToken));
}

/** First password for a Google-only account, where no current one exists. */
export function setPasswordApi(payload: { newPassword: string }, accessToken: string) {
  return request<{ user: User }>('/auth/set-password', jsonPost(payload, accessToken));
}

/** What the /users endpoints return: a safe User plus a status the backend derives, not the client. */
export interface AdminUser extends User {
  status: 'Active' | 'Inactive' | 'Pending';
}

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function authGet(accessToken: string): RequestInit {
  return { method: 'GET', headers: authHeaders(accessToken) };
}

function jsonPatch(payload: unknown, accessToken: string): RequestInit {
  return {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(accessToken) },
    body: JSON.stringify(payload),
  };
}

// The only endpoints in the app gated by isAdmin — mirrors sentinel-backend's
// requireAdmin middleware on the /users router.
export function listUsersApi(accessToken: string) {
  return request<{ users: AdminUser[] }>('/users', authGet(accessToken));
}

export function createUserApi(payload: { email: string; fullname: string }, accessToken: string) {
  return request<{ user: AdminUser; tempPassword: string; notice: string }>(
    '/users',
    jsonPost(payload, accessToken)
  );
}

export function resetPasswordApi(userId: number, accessToken: string) {
  return request<{ user: AdminUser; tempPassword: string; notice: string }>(
    `/users/${userId}/reset-password`,
    { method: 'POST', headers: authHeaders(accessToken) }
  );
}

export function setUserStatusApi(userId: number, isActive: boolean, accessToken: string) {
  return request<{ user: AdminUser }>(`/users/${userId}/status`, jsonPatch({ isActive }, accessToken));
}
