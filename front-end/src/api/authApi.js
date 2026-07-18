import axiosClient, { unwrap } from './axiosClient';

export const authApi = {
  login: (payload) => axiosClient.post('/Auth/login', payload).then(unwrap),
  register: (payload) => axiosClient.post('/Auth/register', payload).then(unwrap),
  logout: (refreshToken) => axiosClient.post('/Auth/logout', { refreshToken }).then(unwrap),
};
