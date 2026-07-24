/**
 * authService — single authority for authentication state.
 *
 * Consolidates: authApi + authenticationService + authService (3 layers → 1).
 *
 * Backend DTOs:
 *   POST /Auth/login    → ApiResponse<AuthResponse>
 *   POST /Auth/register → ApiResponse<bool>
 *   POST /Auth/refresh  → ApiResponse<RefreshTokenResponse>  { accessToken, refreshToken }
 *   POST /Auth/logout   → ApiResponse<bool>
 *
 * AuthResponse: { userId, fullName, email, role, accessToken, refreshToken,
 *                 accessTokenExpiresAt, refreshTokenExpiresAt }
 *
 * API versioning: AssumeDefaultVersionWhenUnspecified=true means
 * /api/Auth/login resolves to v1 without the /v1/ segment in the URL.
 */
import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5062/api';
const raw = axios.create({ baseURL: BASE_URL, timeout: 20_000 });

// ─── In-memory + persisted snapshot ─────────────────────────────────────────

let snapshot = _readStorage();
const listeners = new Set();

function _readStorage() {
  try   { const s = localStorage.getItem(STORAGE_KEYS.auth); return s ? JSON.parse(s) : null; }
  catch { return null; }
}

function _commit(next) {
  snapshot = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(next));
    else      localStorage.removeItem(STORAGE_KEYS.auth);
  } catch {}
  listeners.forEach(fn => fn(snapshot));
}

// ─── Token accessors used by axiosClient ────────────────────────────────────

export const getAccessToken  = () => snapshot?.accessToken  ?? null;
export const getRefreshToken = () => snapshot?.refreshToken ?? null;
export const getAuthSnapshot = () => snapshot;

/**
 * Called by axiosClient after a successful token refresh.
 * Backend RefreshTokenResponse returns { accessToken, refreshToken }.
 * We merge those into the existing snapshot so the user object is preserved.
 */
export function replaceTokens({ accessToken, refreshToken }) {
  if (!snapshot || !accessToken) return;
  _commit({ ...snapshot, accessToken, refreshToken });
}

export function clearAuth() {
  _commit(null);
}

// ─── User model ──────────────────────────────────────────────────────────────

/**
 * Maps backend AuthResponse → frontend User object.
 * role is normalised to UPPERCASE so all checks use 'RECRUITER' / 'CANDIDATE'.
 */
function toUser(auth) {
  if (!auth) return null;
  return {
    id:                   auth.userId,
    name:                 auth.fullName,
    email:                auth.email,
    role:                 String(auth.role ?? '').toUpperCase(),
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
  };
}

export const getUser = () => toUser(snapshot);

export function subscribeToAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _unwrap(res) {
  const p = res.data;
  if (p?.success === false) throw new Error(p.message || 'Authentication failed.');
  return p?.data ?? p;
}

// ─── Auth operations ─────────────────────────────────────────────────────────

export async function login({ email, password }) {
  const auth = await raw.post('/Auth/login', { email, password }).then(_unwrap);
  _commit(auth);
  return toUser(auth);
}

export async function register({ fullName, email, password, confirmPassword, role = 'Candidate' }) {
  await raw.post('/Auth/register', {
    fullName, email, password,
    confirmPassword: confirmPassword || password,
    role,
  }).then(_unwrap);
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) await raw.post('/Auth/logout', { refreshToken });
  } finally {
    _commit(null);
  }
}
