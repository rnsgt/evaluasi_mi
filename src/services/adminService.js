// Admin Service
// API calls for admin-specific features

import api from './api';

const adminService = {
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get laporan evaluasi with filters
   * @param {Object} filters - { periode_id, tipe }
   * @returns {Promise<Object>} Laporan data { dosen: [], fasilitas: [] }
   */
  getLaporan: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.periode_id) {
      params.append('periode_id', filters.periode_id);
    }
    
    if (filters.tipe) {
      params.append('tipe', filters.tipe);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/admin/laporan?${queryString}` : '/admin/laporan';
    
    const response = await api.get(url);
    return response.data;
  },
};

export default adminService;
