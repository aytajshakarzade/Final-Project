import { authApi } from '../api/authApi';

const AUTH_STORAGE_KEY = 'silent-interview.auth';

let snapshot = readSnapshot();
const listeners = new Set();

function readSnapshot() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function publish(next) {
  snapshot = next;

  if (next) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  listeners.forEach(listener => listener(snapshot));
}

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

function toUser(auth) {
  if (!auth) return null;

  return {
    id: auth.userId,
    name: auth.fullName,
    email: auth.email,
    role: normalizeRole(auth.role)
  };
}

export const getAuthSnapshot = () => snapshot;
export const getAccessToken = () => snapshot?.accessToken ?? null;
export const getRefreshToken = () => snapshot?.refreshToken ?? null;
export const getAuthenticatedUser = () => toUser(snapshot);
export const findAuthenticatedUser = () => getAuthenticatedUser();

export const subscribeToAuth = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function replaceTokens(refreshed) {
  if (!snapshot) return;
  publish({ ...snapshot, ...refreshed });
}

export function clearAuth() {
  publish(null);
}

export async function login(credentials) {
  const auth = await authApi.login(credentials);
  publish(auth);
  return toUser(auth);
}

export async function register(payload) {
  await authApi.register({
    ...payload,
    confirmPassword: payload.confirmPassword || payload.password,
  });
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
  } finally {
    clearAuth();
  }
}