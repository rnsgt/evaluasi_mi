// Stats Service untuk Admin Dashboard

import api from './api';

/**
 * Get dashboard stats untuk admin
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getAdminDashboardStats = async () => {
  try {
    console.log('[statsService] Fetching admin dashboard stats...');
    
    // Call backend API for admin dashboard stats
    const response = await api.get('/admin/dashboard');
    
    console.log('[statsService] Response received:', response?.success, 'Has data:', !!response?.data);
    
    // Handle response format: API returns { success: true, data: {...} }
    const backendData = response?.data || response;
    
    console.log('[statsService] Processing data, evaluasiHariIni:', backendData?.evaluasiHariIni);
    
    return {
      totalEvaluasi: backendData?.totalEvaluasi || 0,
      todayEvaluasi: backendData?.evaluasiHariIni || 0,
      weekEvaluasi: backendData?.evaluasiMingguIni || 0,
      monthEvaluasi: backendData?.evaluasiBulanIni || 0,
      evaluasiDosen: backendData?.evaluasiDosen || 0,
      evaluasiFasilitas: backendData?.evaluasiFasilitas || 0,
      participationRate: backendData?.partisipasi?.persentase || 0,
      totalMahasiswa: backendData?.partisipasi?.totalMahasiswa || 0,
      uniqueMahasiswa: backendData?.partisipasi?.uniqueMahasiswa || 0,
      participationPeriodeId: backendData?.partisipasi?.periodeId || null,
      participationPeriodeNama: backendData?.partisipasi?.periodeNama || null,
      top5Dosen: (backendData?.topDosen || []).map(dosen => ({
        id: dosen.id,
        nama: dosen.nama,
        nip: dosen.nip,
        rataRata: parseFloat(dosen.rata_rata) || 0,
        jumlahEvaluasi: parseInt(dosen.jumlah_evaluasi) || 0,
      })),
      fasilitasPerluPerbaikan: (backendData?.fasilitasPerluPerbaikan || []).map(fasilitas => ({
        id: fasilitas.id,
        nama: fasilitas.nama,
        kode: fasilitas.kode,
        kategori: fasilitas.kategori,
        lokasi: fasilitas.lokasi,
        rataRata: parseFloat(fasilitas.rata_rata) || 0,
        jumlahEvaluasi: parseInt(fasilitas.jumlah_evaluasi) || 0,
      })),
    };
  } catch (error) {
    console.error('[statsService] Get admin stats error:', {
      message: error?.message,
      status: error?.status,
      fullError: error
    });
    throw error;
  }
};

/**
 * Get monthly trend data
 * @returns {Promise<Array>} Monthly statistics for last 6 months
 */
export const getMonthlyTrend = async () => {
  try {
    // TODO: Implement backend API endpoint for monthly trend
    // For now returning empty array
    return [];
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return [];
  }
};

export default {
  getAdminDashboardStats,
  getMonthlyTrend,
};
