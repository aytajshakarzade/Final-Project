import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthenticatedUser, login, logout, register, subscribeToAuth } from '../services/authenticationService';
import { clearRuntimeStore, hydrateRuntimeStore } from '../services/runtimeStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuthenticatedUser());
  const [loading, setLoading] = useState(Boolean(getAuthenticatedUser()));

  useEffect(() => subscribeToAuth(setUser), []);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    hydrateRuntimeStore().catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) { const next = await login(credentials); await hydrateRuntimeStore(); return next; },
    async register(payload) { await register(payload); },
    async logout() { await logout(); clearRuntimeStore(); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
