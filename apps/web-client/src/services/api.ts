import axios from 'axios';

const API_GATEWAY = 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_GATEWAY,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});