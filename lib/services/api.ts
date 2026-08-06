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

function jsonPut(payload: unknown, accessToken: string): RequestInit {
  return {
    method: 'PUT',
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

export interface Transaction {
  id: number;
  transaction_date: string;
  amount: string;
  type: string;
  category: string;
  description: string;
  vendor_id: number | null;
  vendor_name: string | null;
  input_by_user_id: number;
  user_fullname: string | null;
}

export interface Vendor {
  id: number;
  vendor_name: string;
  bank_account: string;
  join_date: string;
  status: string;
}

export function listTransactionsApi(
  accessToken: string,
  params?: { page?: number; limit?: number; type?: string; category?: string; search?: string }
) {
  let url = '/transactions?';
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.type && params.type !== 'All') searchParams.set('type', params.type.toLowerCase());
    if (params.category && params.category !== 'All') searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    url += searchParams.toString();
  }
  return request<{ transactions: Transaction[], pagination: any }>(url, authGet(accessToken));
}

export function updateTransactionApi(id: number, payload: Partial<Transaction>, accessToken: string) {
  return request<{ transaction: Transaction }>(`/transactions/${id}`, jsonPut(payload, accessToken));
}

export function createTransactionApi(payload: { transaction_date: string; amount: number; type: string; category: string; description: string; vendor_id?: number | null; input_by_user_id: number }, accessToken: string) {
  return request<{ transaction: Transaction }>('/transactions', jsonPost(payload, accessToken));
}

export function getTransactionCategoriesApi(type: string | undefined, accessToken: string) {
  const url = type ? `/transactions/categories?type=${type}` : '/transactions/categories';
  return request<{ income?: string[], expense?: string[] }>(url, authGet(accessToken));
}

export function listVendorsApi(accessToken: string) {
  return request<{ vendors: Vendor[] }>('/vendors', authGet(accessToken));
}

export function createVendorApi(payload: { vendor_name: string; bank_account: string; status?: string }, accessToken: string) {
  return request<{ vendor: Vendor }>('/vendors', jsonPost(payload, accessToken));
}

export function updateVendorApi(id: number, payload: { vendor_name?: string; bank_account?: string; status?: string }, accessToken: string) {
  return request<{ vendor: Vendor }>(`/vendors/${id}`, jsonPut(payload, accessToken));
}
