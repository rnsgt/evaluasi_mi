// Evaluasi Service
// Connect to backend API for evaluasi operations

import api from './api';

const evaluasiService = {
  /**
   * Get pernyataan dosen from backend
   * @returns {Promise<Array>}
   */
  getPernyataanDosen: async () => {
    try {
      const response = await api.get('/evaluasi/pernyataan/dosen');
      return response.data || [];
    } catch (error) {
      console.error('Get pernyataan dosen error:', error);
      return [];
    }
  },

  /**
   * Get pernyataan fasilitas from backend
   * @returns {Promise<Array>}
   */
  getPernyataanFasilitas: async () => {
    try {
      const response = await api.get('/evaluasi/pernyataan/fasilitas');
      return response.data || [];
    } catch (error) {
      console.error('Get pernyataan fasilitas error:', error);
      return [];
    }
  },

  /**
   * Submit evaluasi dosen to backend
   * @param {Object} evaluasiData 
   * @returns {Promise<Object>}
   */
  submitEvaluasiDosen: async (evaluasiData) => {
    try {
      const response = await api.post('/evaluasi/dosen', evaluasiData);
      return response;
    } catch (error) {
      console.error('Submit evaluasi dosen error:', error);
      throw error;
    }
  },

  /**
   * Submit evaluasi fasilitas to backend
   * @param {Object} evaluasiData 
   * @returns {Promise<Object>}
   */
  submitEvaluasiFasilitas: async (evaluasiData) => {
    try {
      const response = await api.post('/evaluasi/fasilitas', evaluasiData);
      return response;
    } catch (error) {
      console.error('Submit evaluasi fasilitas error:', error);
      throw error;
    }
  },

  /**
   * Get riwayat evaluasi from backend
   * @returns {Promise<Array>}
   */
  getRiwayat: async () => {
    try {
      const response = await api.get('/evaluasi/riwayat');
      return response.data || [];
    } catch (error) {
      console.error('Get riwayat error:', error);
      return [];
    }
  },

  /**
   * Get statistik mahasiswa from backend
   * @returns {Promise<Object>}
   */
  getStatistik: async () => {
    try {
      const response = await api.get('/evaluasi/statistik');
      return response.data || {};
    } catch (error) {
      console.error('Get statistik error:', error);
      return {
        totalEvaluasi: 0,
        totalDosen: 0,
        totalFasilitas: 0,
        periodeAktif: 'Tidak ada periode aktif',
        achievement: null,
      };
    }
  },

  /**
   * Legacy methods for backward compatibility with old mock data
   */
  getRiwayatEvaluasiDosen: async (mahasiswaId) => {
    const riwayat = await evaluasiService.getRiwayat();
    return riwayat.filter((e) => e.type === 'DOSEN');
  },

  getRiwayatEvaluasiFasilitas: async (mahasiswaId) => {
    const riwayat = await evaluasiService.getRiwayat();
    return riwayat.filter((e) => e.type === 'FASILITAS');
  },

  getAllRiwayat: async (mahasiswaId) => {
    return await evaluasiService.getRiwayat();
  },

  /**
   * Get global statistics for Admin Dashboard
   * @returns {Promise<Object>}
   */
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data || {};
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return {};
    }
  },

  /**
   * Management for statements (Admin)
   */
  getAdminStatements: async (type) => {
    try {
      const response = await api.get(`/admin/pernyataan/${type}`);
      return response.data || [];
    } catch (error) {
      console.error(`Get admin statements ${type} error:`, error);
      return [];
    }
  },

  addAdminStatement: async (type, data) => {
    return await api.post(`/admin/pernyataan/${type}`, data);
  },

  updateAdminStatement: async (type, id, data) => {
    return await api.put(`/admin/pernyataan/${type}/${id}`, data);
  },

  deleteAdminStatement: async (type, id) => {
    return await api.delete(`/admin/pernyataan/${type}/${id}`);
  },

  deletePeriode: async (id) => {
    return await api.delete(`/periode/${id}`);
  },
};

export default evaluasiService;
