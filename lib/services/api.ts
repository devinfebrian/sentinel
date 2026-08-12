import { clearSessionOutsideReact, type AuthTokens, type User } from '@/lib/stores/auth.store';
import type {
  FindingRow,
  SummaryRow,
  RiskLevel,
  Resolution,
  FindingStatusFilter,
} from '@/lib/contract/findings.contract';

// Finding contract values/types come from the agent server's OpenAPI snapshot —
// see lib/contract/findings.contract.ts and scripts/contract-pull.mjs.
export { RISK_LEVELS, RESOLUTIONS, FINDING_STATUS_FILTERS } from '@/lib/contract/findings.contract';
export type {
  RiskLevel,
  Resolution,
  FindingStatusFilter,
} from '@/lib/contract/findings.contract';

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

/** Whether this call presented a token, i.e. whether a 401 means "expired". */
function isAuthenticatedRequest(options: RequestInit): boolean {
  const headers = options.headers;
  if (!headers) return false;
  if (headers instanceof Headers) return headers.has('Authorization');
  if (Array.isArray(headers)) return headers.some(([key]) => key.toLowerCase() === 'authorization');
  return Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');
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

  // A 401 on a call that carried a token means the session died mid-use. Drop
  // it so AuthGate redirects to /login, rather than leaving every page to paint
  // the backend's "Session expired" text into an error banner and stay put.
  // Login and refresh send no Authorization header, so a 401 there is a genuine
  // bad-credentials error and still surfaces to the form as normal.
  if (response.status === 401 && isAuthenticatedRequest(options)) {
    clearSessionOutsideReact();
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
  /** Kapan mutasi tercatat. Satu-satunya waktu sebuah transaksi. */
  created_at: string;
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
  return request<{ transactions: Transaction[]; pagination: unknown }>(url, authGet(accessToken));
}

export function getTransactionApi(id: number, accessToken: string, signal?: AbortSignal) {
  return request<{ transaction: Transaction }>(`/transactions/${id}`, {
    ...authGet(accessToken),
    signal,
  });
}

export function updateTransactionApi(
  id: number,
  payload: {
    amount?: number;
    type?: string;
    category?: string;
    description?: string;
    vendor_id?: number | null;
  },
  accessToken: string
) {
  return request<{ transaction: Transaction }>(`/transactions/${id}`, jsonPut(payload, accessToken));
}

export function createTransactionApi(
  payload: {
    amount: number;
    type: string;
    category: string;
    description: string;
    vendor_id?: number | null;
    input_by_user_id: number;
  },
  accessToken: string
) {
  return request<{ transaction: Transaction }>('/transactions', jsonPost(payload, accessToken));
}

export function getTransactionCategoriesApi(type: string | undefined, accessToken: string) {
  const url = type ? `/transactions/categories?type=${type}` : '/transactions/categories';
  return request<{ income?: string[], expense?: string[] }>(url, authGet(accessToken));
}

export interface ImportTransactionRow {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date?: string;
  invoice_no?: string;
  vendor_name?: string;
  vendor_id?: number | null;
}

export function importTransactionsApi(rows: ImportTransactionRow[], accessToken: string) {
  return request<{
    inserted: number;
    rejected: { row: number; message: string }[];
    transactions: Transaction[];
  }>('/transactions/import', jsonPost({ transactions: rows }, accessToken));
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

export interface AskResponse {
  answer: string;
  figures?: Record<string, unknown>;
  tools_used?: string[];
  steps?: unknown[];
  unsourced_figures?: string[];
  warning?: string;
}

export function askApi(question: string, accessToken: string) {
  return request<AskResponse>('/ask', jsonPost({ question }, accessToken));
}

/** Why the score is what it is. One entry per rule that fired. */
export interface Trigger {
  code: string;
  points: number;
  owner: string;
  amplifier_only: boolean;
  /** Indonesian, written by the scoring engine — not by a model. */
  narrative: string;
  detail: Record<string, unknown>;
}

/**
 * The half of a finding that outlives an LLM outage. Every number here was
 * computed by Python, so it stays valid and auditable even when `analysis` is
 * null. This is what an auditor traces.
 */
export interface Evidence {
  triggers: Trigger[];
  suppressed_triggers: { code: string; points: number; reason: string }[];
  base_risk_score: number;
  raw_score: number;
  /** True when the raw total exceeded the 80-point base ceiling. */
  capped: boolean;
  agent_scores: { agent: string; score: number }[];
  provenance: { scored_by: string; llm_model: string; llm_model_verifier: string };
}

/** How the agents reasoned. Null when the LLM half of the pipeline failed. */
export interface Analysis {
  investigation?: {
    agent1_verdict?: string | null;
    agent1_confidence?: string | null;
    agent2_verdict?: string | null;
    agent2_confidence?: string | null;
    verdict_review?: { agent1?: string; agent2?: string; reason?: string };
  };
  /** Capped at ±20 by the scoring engine, and it must come with a reason. */
  llm_semantic_adjustment: number;
  adjustment_reason: string;
  llm_review_failed: boolean;
  semantic?: { source: string; insight: string }[];
  context?: { source: string; insight: string }[];
}

/** A finding as served by the agent server; wire shape single-sourced from the OpenAPI contract. */
export type Finding = FindingRow;

export interface FindingDetail extends Omit<Finding, 'evidence' | 'analysis'> {
  evidence: Evidence;
  analysis: Analysis | null;
}

/** Headline counts for the findings page; wire shape from the OpenAPI contract. */
export type FindingsSummary = SummaryRow;

export function listFindingsApi(
  accessToken: string,
  params?: { status?: FindingStatusFilter; risk_level?: RiskLevel; limit?: number }
) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.risk_level) search.set('risk_level', params.risk_level);
  if (params?.limit) search.set('limit', String(params.limit));

  const qs = search.toString();
  return request<{ findings: Finding[] }>(`/findings${qs ? `?${qs}` : ''}`, authGet(accessToken));
}

export function findingsSummaryApi(accessToken: string) {
  return request<{ summary: FindingsSummary }>('/findings/summary', authGet(accessToken));
}

/** Same row as the list, plus `evidence` and `analysis`. */
export function getFindingApi(id: number, accessToken: string, signal?: AbortSignal) {
  return request<{ finding: FindingDetail }>(`/findings/${id}`, {
    ...authGet(accessToken),
    signal,
  });
}

/**
 * `resolved_by` is deliberately absent: the backend fills it from the verified
 * token. For an audit trail, a self-reported "who signed this off" is worse
 * than no record at all.
 */
export function resolveFindingApi(
  id: number,
  payload: { resolution: Resolution; note?: string },
  accessToken: string
) {
  return request<{ finding: Finding }>(`/findings/${id}/resolve`, jsonPatch(payload, accessToken));
}
