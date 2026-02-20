import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key untuk evaluasi
const STORAGE_KEY_EVALUASI_DOSEN = '@evaluasi_dosen';
const STORAGE_KEY_EVALUASI_FASILITAS = '@evaluasi_fasilitas';

const evaluasiService = {
  /**
   * Submit evaluasi dosen
   * @param {Object} evaluasiData 
   * @returns {Promise<Object>}
   */
  submitEvaluasiDosen: async (evaluasiData) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 1500));

        // Get existing evaluasi from storage
        const existingData = await AsyncStorage.getItem(STORAGE_KEY_EVALUASI_DOSEN);
        const evaluasiList = existingData ? JSON.parse(existingData) : [];

        // Check if already evaluated this dosen in current periode
        const isDuplicate = evaluasiList.some(
          (e) =>
            e.dosen_id === evaluasiData.dosen_id &&
            e.mahasiswa_id === evaluasiData.mahasiswa_id &&
            e.periode_id === evaluasiData.periode_id
        );

        if (isDuplicate) {
          reject(new Error('Anda sudah mengevaluasi dosen ini di periode ini'));
          return;
        }

        // Add new evaluasi
        const newEvaluasi = {
          ...evaluasiData,
          id: Date.now(),
          created_at: new Date().toISOString(),
          status: 'submitted',
        };

        evaluasiList.push(newEvaluasi);

        // Save to storage
        await AsyncStorage.setItem(
          STORAGE_KEY_EVALUASI_DOSEN,
          JSON.stringify(evaluasiList)
        );

        resolve({
          success: true,
          message: 'Evaluasi berhasil dikirim',
          data: newEvaluasi,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Submit evaluasi fasilitas (for Week 2)
   * @param {Object} evaluasiData 
   * @returns {Promise<Object>}
   */
  submitEvaluasiFasilitas: async (evaluasiData) => {
    return new Promise(async (resolve, reject) => {
      try {
        await new Promise(r => setTimeout(r, 1500));

        const existingData = await AsyncStorage.getItem(STORAGE_KEY_EVALUASI_FASILITAS);
        const evaluasiList = existingData ? JSON.parse(existingData) : [];

        const newEvaluasi = {
          ...evaluasiData,
          id: Date.now(),
          created_at: new Date().toISOString(),
          status: 'submitted',
        };

        evaluasiList.push(newEvaluasi);

        await AsyncStorage.setItem(
          STORAGE_KEY_EVALUASI_FASILITAS,
          JSON.stringify(evaluasiList)
        );

        resolve({
          success: true,
          message: 'Evaluasi berhasil dikirim',
          data: newEvaluasi,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get riwayat evaluasi dosen by mahasiswa
   * @param {number} mahasiswaId 
   * @returns {Promise<Array>}
   */
  getRiwayatEvaluasiDosen: async (mahasiswaId) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_EVALUASI_DOSEN);
      const evaluasiList = data ? JSON.parse(data) : [];
      return evaluasiList.filter((e) => e.mahasiswa_id === mahasiswaId);
    } catch (error) {
      console.error('Get riwayat error:', error);
      return [];
    }
  },

  /**
   * Get riwayat evaluasi fasilitas by mahasiswa
   * @param {number} mahasiswaId 
   * @returns {Promise<Array>}
   */
  getRiwayatEvaluasiFasilitas: async (mahasiswaId) => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_EVALUASI_FASILITAS);
      const evaluasiList = data ? JSON.parse(data) : [];
      return evaluasiList.filter((e) => e.mahasiswa_id === mahasiswaId);
    } catch (error) {
      console.error('Get riwayat error:', error);
      return [];
    }
  },

  /**
   * Get all riwayat (dosen + fasilitas) by mahasiswa
   * @param {number} mahasiswaId 
   * @returns {Promise<Array>}
   */
  getAllRiwayat: async (mahasiswaId) => {
    try {
      const dosenEvaluasi = await evaluasiService.getRiwayatEvaluasiDosen(mahasiswaId);
      const fasilitasEvaluasi = await evaluasiService.getRiwayatEvaluasiFasilitas(mahasiswaId);

      const allEvaluasi = [
        ...dosenEvaluasi.map((e) => ({ ...e, type: 'dosen' })),
        ...fasilitasEvaluasi.map((e) => ({ ...e, type: 'fasilitas' })),
      ];

      // Sort by created_at descending
      return allEvaluasi.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (error) {
      console.error('Get all riwayat error:', error);
      return [];
    }
  },

  /**
   * Check if mahasiswa already evaluated dosen in current periode
   * @param {number} mahasiswaId 
   * @param {number} dosenId 
   * @param {number} periodeId 
   * @returns {Promise<boolean>}
   */
  hasEvaluatedDosen: async (mahasiswaId, dosenId, periodeId) => {
    try {
      const riwayat = await evaluasiService.getRiwayatEvaluasiDosen(mahasiswaId);
      return riwayat.some(
        (e) => e.dosen_id === dosenId && e.periode_id === periodeId
      );
    } catch (error) {
      return false;
    }
  },

  /**
   * Clear all evaluasi data (for testing/debugging)
   * @returns {Promise<void>}
   */
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_EVALUASI_DOSEN,
        STORAGE_KEY_EVALUASI_FASILITAS,
      ]);
      console.log('All evaluasi data cleared');
    } catch (error) {
      console.error('Clear data error:', error);
    }
  },
};

export default evaluasiService;
