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
    const simulatedIp = localStorage.getItem('gpa_simulated_ip');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (simulatedIp) {
      config.headers['x-simulated-ip'] = simulatedIp;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
    // If there are detailed validation errors, append the first one to the message
    if (err.response?.data?.errors && err.response.data.errors.length > 0) {
      err.message = err.response.data.errors[0].message;
    } else if (err.response?.data?.message) {
      err.message = err.response.data.message;
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;
