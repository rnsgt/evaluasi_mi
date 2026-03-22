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

  hasEvaluatedDosen: async (mahasiswaId, dosenId, periodeId) => {
    // This will be validated by backend duplicate check
    return false;
  },
};

export default evaluasiService;
