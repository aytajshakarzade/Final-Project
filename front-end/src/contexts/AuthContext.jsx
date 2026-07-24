import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  clearAuth,
  getUser,
  login  as loginFn,
  logout as logoutFn,
  register as registerFn,
  subscribeToAuth,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise synchronously from localStorage — no flicker
  const [user,    setUser]    = useState(() => getUser());
  const [loading, setLoading] = useState(false);

  // Stay in sync with token refreshes or changes in other tabs
  useEffect(() => {
    const unsub = subscribeToAuth(() => setUser(getUser()));
    return unsub;
  }, []);

  /**
   * Login — returns the full user object immediately so callers
   * can navigate to the correct dashboard without waiting for context updates.
   *
   * ROOT CAUSE FIX: The legacy monolith used an internal state machine
   * (state.view) and never called React Router's navigate().  The new
   * architecture calls navigate(getRoleBase(user.role)) in the LoginPage
   * right after this function resolves.
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const nextUser = await loginFn(credentials);
      setUser(nextUser);
      return nextUser;          // ← callers use this to navigate
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      await registerFn(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutFn();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isRecruiter: user?.role === 'RECRUITER' || user?.role === 'ADMIN',
    isCandidate: user?.role === 'CANDIDATE',
    login,
    register,
    logout,
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
