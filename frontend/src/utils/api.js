const API = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('cineplex_token');

const request = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json();
  return { data };
};

export const movieAPI = {
  getAll: (params) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v))
    ).toString();
    return request('GET', `/movies${query ? '?' + query : ''}`);
  },
  getById: (id) => request('GET', `/movies/${id}`),
};

export const bookingAPI = {
  create: (data) => request('POST', '/bookings', data),
  getMy: () => request('GET', '/bookings/my'),
  cancel: (id) => request('PATCH', `/bookings/${id}/cancel`),
};

export const userAPI = {
  getProfile: () => request('GET', '/user/profile'),
  updateProfile: (data) => request('PUT', '/user/profile', data),
  changePassword: (data) => request('PUT', '/user/change-password', data),
};

export default { movieAPI, bookingAPI, userAPI };