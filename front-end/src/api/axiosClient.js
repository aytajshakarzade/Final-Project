import axios from 'axios';
import { clearAuth, getAccessToken, getRefreshToken, replaceTokens } from '../services/authenticationService';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5062/api';

const axiosClient = axios.create({ baseURL, timeout: 20000 });
const refreshClient = axios.create({ baseURL, timeout: 20000 });
let refreshPromise = null;

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthRequest = request?.url?.includes('/Auth/');
    if (error.response?.status !== 401 || request?._retry || isAuthRequest) throw error;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      throw error;
    }

    request._retry = true;
    try {
      refreshPromise ??= refreshClient.post('/Auth/refresh', { refreshToken })
        .then(({ data }) => data.data)
        .finally(() => { refreshPromise = null; });
      const refreshed = await refreshPromise;
      replaceTokens(refreshed);
      request.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return axiosClient(request);
    } catch (refreshError) {
      clearAuth();
      throw refreshError;
    }
  },
);

export function unwrap(response) {
  const payload = response.data;
  if (payload?.success === false) throw new Error(payload.message || 'The request failed.');
  return payload?.data ?? payload;
}

export default axiosClient;
