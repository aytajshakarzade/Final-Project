import axios from 'axios';
import { getAccessToken, getRefreshToken, clearAuth, replaceTokens } from '../services/authService';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5062/api';

export const axiosClient = axios.create({ baseURL, timeout: 30000 });
const refreshClient = axios.create({ baseURL, timeout: 20000 });
let refreshPromise = null;

// Attach Bearer token to every request
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const req = error.config;
    const isAuthRoute = req?.url?.includes('/Auth/');
    if (error.response?.status !== 401 || req?._retry || isAuthRoute) throw error;

    const refreshToken = getRefreshToken();
    if (!refreshToken) { clearAuth(); throw error; }

    req._retry = true;
    try {
      refreshPromise ??= refreshClient
        .post('/Auth/refresh', { refreshToken })
        .then(({ data }) => unwrap({ data }))
        .finally(() => { refreshPromise = null; });

      const refreshed = await refreshPromise;
      replaceTokens(refreshed);
      req.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return axiosClient(req);
    } catch {
      clearAuth();
      throw error;
    }
  }
);

/** Unwrap ApiResponse<T> → T */
export function unwrap(response) {
  const payload = response.data;
  if (payload?.success === false) throw new Error(payload.message || 'Request failed.');
  return payload?.data ?? payload;
}

/** Generic resource API factory */
export function createResourceApi(path) {
  return {
    getAll: (params) => axiosClient.get(path, { params }).then(unwrap),
    getById: (id) => axiosClient.get(`${path}/${id}`).then(unwrap),
    create: (data) => axiosClient.post(path, data).then(unwrap),
    update: (id, data) => axiosClient.put(`${path}/${id}`, data).then(unwrap),
    remove: (id) => axiosClient.delete(`${path}/${id}`).then(unwrap),
  };
}

export default axiosClient;
