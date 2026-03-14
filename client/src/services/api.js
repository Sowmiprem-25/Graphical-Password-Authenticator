import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gpa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
    // If there are detailed validation errors, use the first one
    if (err.response?.data?.errors && err.response.data.errors.length > 0) {
      msg = `${err.response.data.errors[0].message}`;
    }
    // Preserve the original response object so callers can check
    // err.response?.status (e.g. 423 for account locked, 410 for OTP expired)
    const error = new Error(msg);
    error.response = err.response;
    error.status   = err.response?.status;
    return Promise.reject(error);
  }
);

export default api;
