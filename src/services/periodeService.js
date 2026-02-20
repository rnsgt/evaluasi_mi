// Mock Periode Service
// Untuk manage periode evaluasi akademik

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@periode_evaluasi';

const MOCK_PERIODE = [
  {
    id: 1,
    nama: 'Semester Ganjil 2023/2024',
    tahun_ajaran: '2023/2024',
    semester: 'Ganjil',
    tanggal_mulai: '2023-09-01',
    tanggal_akhir: '2024-01-31',
    batas_evaluasi: '2023-12-30',
    status: 'aktif',
    keterangan: 'Periode evaluasi semester ganjil tahun ajaran 2023/2024',
    created_at: '2023-08-15T10:00:00.000Z',
  },
  {
    id: 2,
    nama: 'Semester Genap 2022/2023',
    tahun_ajaran: '2022/2023',
    semester: 'Genap',
    tanggal_mulai: '2023-02-01',
    tanggal_akhir: '2023-06-30',
    batas_evaluasi: '2023-06-15',
    status: 'selesai',
    keterangan: 'Periode evaluasi semester genap tahun ajaran 2022/2023',
    created_at: '2023-01-15T10:00:00.000Z',
  },
  {
    id: 3,
    nama: 'Semester Ganjil 2022/2023',
    tahun_ajaran: '2022/2023',
    semester: 'Ganjil',
    tanggal_mulai: '2022-09-01',
    tanggal_akhir: '2023-01-31',
    batas_evaluasi: '2023-01-15',
    status: 'selesai',
    keterangan: 'Periode evaluasi semester ganjil tahun ajaran 2022/2023',
    created_at: '2022-08-15T10:00:00.000Z',
  },
];

/**
 * Initialize periode data
 */
const initializePeriode = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PERIODE));
    }
  } catch (error) {
    console.error('Initialize periode error:', error);
  }
};

/**
 * Get all periode
 * @returns {Promise<Array>} List of periode
 */
export const getAllPeriode = async () => {
  try {
    await initializePeriode();
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const periode = data ? JSON.parse(data) : [];
    
    // Sort by created_at desc
    return periode.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Get all periode error:', error);
    return [];
  }
};

/**
 * Get active periode
 * @returns {Promise<Object|null>} Active periode or null
 */
export const getActivePeriode = async () => {
  try {
    const allPeriode = await getAllPeriode();
    return allPeriode.find((p) => p.status === 'aktif') || null;
  } catch (error) {
    console.error('Get active periode error:', error);
    return null;
  }
};

/**
 * Get periode by ID
 * @param {number} id - Periode ID
 * @returns {Promise<Object|null>} Periode object or null
 */
export const getPeriodeById = async (id) => {
  try {
    const allPeriode = await getAllPeriode();
    return allPeriode.find((p) => p.id === id) || null;
  } catch (error) {
    console.error('Get periode by ID error:', error);
    return null;
  }
};

/**
 * Create new periode
 * @param {Object} periodeData - Periode data
 * @returns {Promise<Object>} Created periode
 */
export const createPeriode = async (periodeData) => {
  try {
    const allPeriode = await getAllPeriode();
    
    // Generate new ID
    const newId = allPeriode.length > 0 
      ? Math.max(...allPeriode.map((p) => p.id)) + 1 
      : 1;
    
    const newPeriode = {
      id: newId,
      ...periodeData,
      status: 'tidak_aktif', // Default status
      created_at: new Date().toISOString(),
    };
    
    allPeriode.push(newPeriode);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allPeriode));
    
    return newPeriode;
  } catch (error) {
    console.error('Create periode error:', error);
    throw new Error('Gagal membuat periode baru');
  }
};

/**
 * Update periode
 * @param {number} id - Periode ID
 * @param {Object} periodeData - Updated data
 * @returns {Promise<Object>} Updated periode
 */
export const updatePeriode = async (id, periodeData) => {
  try {
    const allPeriode = await getAllPeriode();
    const index = allPeriode.findIndex((p) => p.id === id);
    
    if (index === -1) {
      throw new Error('Periode tidak ditemukan');
    }
    
    allPeriode[index] = {
      ...allPeriode[index],
      ...periodeData,
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allPeriode));
    
    return allPeriode[index];
  } catch (error) {
    console.error('Update periode error:', error);
    throw new Error(error.message || 'Gagal mengupdate periode');
  }
};

/**
 * Delete periode
 * @param {number} id - Periode ID
 * @returns {Promise<boolean>} Success status
 */
export const deletePeriode = async (id) => {
  try {
    const allPeriode = await getAllPeriode();
    const periode = allPeriode.find((p) => p.id === id);
    
    if (!periode) {
      return {
        success: false,
        message: 'Periode tidak ditemukan'
      };
    }
    
    // Don't allow deleting active periode
    if (periode.status === 'aktif') {
      return {
        success: false,
        message: 'Tidak dapat menghapus periode yang sedang aktif'
      };
    }
    
    const filtered = allPeriode.filter((p) => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      success: true,
      message: 'Periode berhasil dihapus'
    };
  } catch (error) {
    console.error('Delete periode error:', error);
    return {
      success: false,
      message: error.message || 'Gagal menghapus periode'
    };
  }
};

/**
 * Activate periode (set as active)
 * @param {number} id - Periode ID
 * @returns {Promise<Object>} Activated periode
 */
export const activatePeriode = async (id) => {
  try {
    const allPeriode = await getAllPeriode();
    
    // Deactivate all other periode
    const updated = allPeriode.map((p) => ({
      ...p,
      status: p.id === id ? 'aktif' : (p.status === 'aktif' ? 'tidak_aktif' : p.status),
      updated_at: new Date().toISOString(),
    }));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    const activePeriode = updated.find((p) => p.id === id);
    return activePeriode;
  } catch (error) {
    console.error('Activate periode error:', error);
    throw new Error('Gagal mengaktifkan periode');
  }
};

/**
 * Deactivate periode
 * @param {number} id - Periode ID
 * @returns {Promise<Object>} Deactivated periode
 */
export const deactivatePeriode = async (id) => {
  try {
    return await updatePeriode(id, { status: 'tidak_aktif' });
  } catch (error) {
    console.error('Deactivate periode error:', error);
    throw new Error('Gagal menonaktifkan periode');
  }
};

/**
 * Validate periode dates
 * @param {string} tanggalMulai - Start date
 * @param {string} tanggalAkhir - End date
 * @param {string} batasEvaluasi - Evaluation deadline
 * @returns {Object} Validation result
 */
export const validatePeriodeDates = (tanggalMulai, tanggalAkhir, batasEvaluasi) => {
  const mulai = new Date(tanggalMulai);
  const akhir = new Date(tanggalAkhir);
  const batas = new Date(batasEvaluasi);
  
  if (mulai >= akhir) {
    return {
      valid: false,
      message: 'Tanggal mulai harus lebih awal dari tanggal akhir',
    };
  }
  
  if (batas < mulai || batas > akhir) {
    return {
      valid: false,
      message: 'Batas evaluasi harus berada di antara tanggal mulai dan akhir',
    };
  }
  
  return { valid: true };
};

export default {
  getAllPeriode,
  getActivePeriode,
  getPeriodeById,
  createPeriode,
  updatePeriode,
  deletePeriode,
  activatePeriode,
  deactivatePeriode,
  validatePeriodeDates,
};
