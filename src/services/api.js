import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - Token expired
      if (error.response.status === 401) {
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
        // You can dispatch logout action here if using Redux
      }
      
      // Return formatted error
      return Promise.reject({
        message: error.response.data?.message || 'Terjadi kesalahan',
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        status: 0,
      });
    } else {
      // Other errors
      return Promise.reject({
        message: error.message || 'Terjadi kesalahan',
        status: -1,
      });
    }
  }
);

export default api;
