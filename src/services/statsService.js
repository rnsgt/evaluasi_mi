// Stats Service untuk Admin Dashboard
// Helper untuk kalkulasi statistik dari mock data

import dosenService from './dosenService';
import fasilitasService from './fasilitasService';
import evaluasiService from './evaluasiService';

/**
 * Get dashboard stats untuk admin
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getAdminDashboardStats = async () => {
  try {
    // Get all evaluasi data
    const allEvaluasiDosen = await evaluasiService.getAllRiwayat('all');
    const evaluasiDosen = allEvaluasiDosen.filter((e) => e.type === 'dosen');
    const evaluasiFasilitas = allEvaluasiDosen.filter((e) => e.type === 'fasilitas');

    // Calculate time-based stats
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEvaluasi = allEvaluasiDosen.filter(
      (e) => new Date(e.submitted_at) >= startOfToday
    ).length;

    const weekEvaluasi = allEvaluasiDosen.filter(
      (e) => new Date(e.submitted_at) >= startOfWeek
    ).length;

    const monthEvaluasi = allEvaluasiDosen.filter(
      (e) => new Date(e.submitted_at) >= startOfMonth
    ).length;

    // Calculate participation rate (mock - assume 100 mahasiswa)
    const totalMahasiswa = 100;
    const uniqueMahasiswa = new Set(allEvaluasiDosen.map((e) => e.mahasiswa_id)).size;
    const participationRate = ((uniqueMahasiswa / totalMahasiswa) * 100).toFixed(1);

    // Calculate average ratings for dosen
    const dosenRatings = {};
    evaluasiDosen.forEach((evaluasi) => {
      if (!dosenRatings[evaluasi.dosen_id]) {
        dosenRatings[evaluasi.dosen_id] = {
          id: evaluasi.dosen_id,
          nama: evaluasi.dosen_nama,
          nip: evaluasi.dosen_nip,
          totalNilai: 0,
          totalJawaban: 0,
        };
      }
      
      // Sum all jawaban values
      evaluasi.jawaban.forEach((jawab) => {
        dosenRatings[evaluasi.dosen_id].totalNilai += jawab.nilai;
        dosenRatings[evaluasi.dosen_id].totalJawaban += 1;
      });
    });

    // Calculate average and get top 5
    const dosenWithAvg = Object.values(dosenRatings).map((dosen) => ({
      ...dosen,
      rataRata: (dosen.totalNilai / dosen.totalJawaban).toFixed(2),
      jumlahEvaluasi: evaluasiDosen.filter((e) => e.dosen_id === dosen.id).length,
    }));

    const top5Dosen = dosenWithAvg
      .sort((a, b) => b.rataRata - a.rataRata)
      .slice(0, 5);

    // Calculate average ratings for fasilitas
    const fasilitasRatings = {};
    evaluasiFasilitas.forEach((evaluasi) => {
      if (!fasilitasRatings[evaluasi.fasilitas_id]) {
        fasilitasRatings[evaluasi.fasilitas_id] = {
          id: evaluasi.fasilitas_id,
          nama: evaluasi.fasilitas_nama,
          kode: evaluasi.fasilitas_kode,
          kategori: evaluasi.fasilitas_kategori,
          totalNilai: 0,
          totalJawaban: 0,
        };
      }
      
      evaluasi.jawaban.forEach((jawab) => {
        fasilitasRatings[evaluasi.fasilitas_id].totalNilai += jawab.nilai;
        fasilitasRatings[evaluasi.fasilitas_id].totalJawaban += 1;
      });
    });

    const fasilitasWithAvg = Object.values(fasilitasRatings).map((fasilitas) => ({
      ...fasilitas,
      rataRata: (fasilitas.totalNilai / fasilitas.totalJawaban).toFixed(2),
      jumlahEvaluasi: evaluasiFasilitas.filter((e) => e.fasilitas_id === fasilitas.id).length,
    }));

    // Get fasilitas yang perlu perbaikan (rating < 3.5)
    const fasilitasPerluPerbaikan = fasilitasWithAvg
      .filter((f) => f.rataRata < 3.5)
      .sort((a, b) => a.rataRata - b.rataRata)
      .slice(0, 5);

    return {
      totalEvaluasi: allEvaluasiDosen.length,
      todayEvaluasi,
      weekEvaluasi,
      monthEvaluasi,
      evaluasiDosen: evaluasiDosen.length,
      evaluasiFasilitas: evaluasiFasilitas.length,
      participationRate,
      totalMahasiswa,
      uniqueMahasiswa,
      top5Dosen,
      fasilitasPerluPerbaikan,
    };
  } catch (error) {
    console.error('Get admin stats error:', error);
    throw error;
  }
};

/**
 * Get monthly trend data
 * @returns {Promise<Array>} Monthly statistics for last 6 months
 */
export const getMonthlyTrend = async () => {
  try {
    const allEvaluasi = await evaluasiService.getAllRiwayat('all');
    
    // Group by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    allEvaluasi.forEach((evaluasi) => {
      const date = new Date(evaluasi.submitted_at);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          dosen: 0,
          fasilitas: 0,
          total: 0,
        };
      }
      
      if (evaluasi.type === 'dosen') {
        monthlyData[monthKey].dosen += 1;
      } else {
        monthlyData[monthKey].fasilitas += 1;
      }
      monthlyData[monthKey].total += 1;
    });
    
    return Object.values(monthlyData).slice(-6); // Last 6 months
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return [];
  }
};

export default {
  getAdminDashboardStats,
  getMonthlyTrend,
};
