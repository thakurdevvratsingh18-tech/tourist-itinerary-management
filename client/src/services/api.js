import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Graceful 401 response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/admin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Domain Service Endpoints ────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (passwords) => api.put('/auth/password', passwords),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const destinationService = {
  getAll: (params) => api.get('/destinations', { params }),
  getFeatured: () => api.get('/destinations/featured'),
  getBySlug: (slug) => api.get(`/destinations/${slug}`),
  search: (query) => api.get('/destinations/search', { params: { q: query } }),
  getNearby: (lat, lng) => api.get('/destinations/nearby', { params: { lat, lng } }),
  create: (data) => api.post('/destinations', data),
  update: (id, data) => api.put(`/destinations/${id}`, data),
  delete: (id) => api.delete(`/destinations/${id}`),
};

export const tripService = {
  getAll: (params) => api.get('/trips', { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  share: (id) => api.post(`/trips/${id}/share`),
  getShared: (token) => api.get(`/trips/shared/${token}`),
};

export const itineraryService = {
  getByTrip: (tripId) => api.get(`/itineraries/trip/${tripId}`),
  updateDay: (id, data) => api.put(`/itineraries/${id}`, data),
  addActivity: (dayId, activity) => api.post(`/itineraries/${dayId}/activities`, activity),
  updateActivity: (dayId, actId, activity) => api.put(`/itineraries/${dayId}/activities/${actId}`, activity),
  removeActivity: (dayId, actId) => api.delete(`/itineraries/${dayId}/activities/${actId}`),
};

export const budgetService = {
  getExpenses: (tripId) => api.get(`/budget/trip/${tripId}`),
  addExpense: (expenseData) => api.post('/budget', expenseData),
  deleteExpense: (id) => api.delete(`/budget/${id}`),
};

export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const reviewService = {
  getByDestination: (destId) => api.get(`/reviews/destination/${destId}`),
  create: (data) => api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (destinationId) => api.post('/favorites', { destination: destinationId }),
  remove: (destinationId) => api.delete(`/favorites/${destinationId}`),
  check: (destinationId) => api.get(`/favorites/check/${destinationId}`),
};

export const contactService = {
  send: (data) => api.post('/contact', data),
};

export const composerService = {
  optimize: (payload) => api.post('/composer/optimize', payload),
  saveAsTrip: (payload) => api.post('/composer/save', payload),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDestinations: (params) => api.get('/admin/destinations', { params }),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  moderateReview: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
  getMessages: (params) => api.get('/admin/messages', { params }),
  updateMessageStatus: (id, status) => api.put(`/admin/messages/${id}/status`, { status }),
};

export default api;
