import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_BASE_URL_CANDIDATES, STORAGE_KEYS } from '../utils/constants';

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

    // Keep track of retry index for base URL fallback.
    if (typeof config.__baseUrlIndex !== 'number') {
      config.__baseUrlIndex = API_BASE_URL_CANDIDATES.findIndex((url) => url === (config.baseURL || API_BASE_URL));
      if (config.__baseUrlIndex < 0) {
        config.__baseUrlIndex = 0;
      }
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
    console.log('[api] Response success:', response.config?.url, 'Status:', response.status);
    return response.data;
  },
  async (error) => {
    console.error('[api] Response error for URL:', error.config?.url);
    
    if (error.response) {
      console.error('[api] HTTP Error - Status:', error.response.status, 'Message:', error.response.data?.message);
      
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
      console.error('[api] Network error - No response received for URL:', error.config?.url);
      console.error('[api] Request details - Method:', error.config?.method, 'BaseURL:', error.config?.baseURL);

      const currentIndex = typeof error.config?.__baseUrlIndex === 'number' ? error.config.__baseUrlIndex : 0;
      const nextIndex = currentIndex + 1;
      const nextBaseURL = API_BASE_URL_CANDIDATES[nextIndex];

      if (nextBaseURL) {
        console.warn('[api] Retrying with fallback BaseURL:', nextBaseURL);
        return api.request({
          ...error.config,
          baseURL: nextBaseURL,
          __baseUrlIndex: nextIndex,
        });
      }
      
      const failedUrl = error.config?.baseURL || 'Unknown URL';
      return Promise.reject({
        message: `Tidak dapat terhubung ke server (${failedUrl}). Periksa koneksi internet Anda.`,
        status: 0,
      });
    } else {
      // Other errors
      console.error('[api] Error:', error.message);
      return Promise.reject({
        message: error.message || 'Terjadi kesalahan',
        status: -1,
      });
    }
  }
);

export default api;
