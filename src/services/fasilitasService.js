// Fasilitas Service
// Connect to backend API for fasilitas data

import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fasilitas_data';

const INITIAL_FASILITAS = [
  {
    id: 1,
    kode: 'LAB-KOMP-01',
    nama: 'Laboratorium Komputer 1',
    kategori: 'Laboratorium',
    kapasitas: 40,
    lokasi: 'Gedung A Lantai 2',
    deskripsi: 'Laboratorium dengan 40 unit komputer untuk praktikum programming',
    fasilitas: ['AC', 'Proyektor', 'Whiteboard', 'Komputer', 'Internet'],
    status: 'aktif',
    icon: 'laptop',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 2,
    kode: 'LAB-KOMP-02',
    nama: 'Laboratorium Komputer 2',
    kategori: 'Laboratorium',
    kapasitas: 35,
    lokasi: 'Gedung A Lantai 3',
    deskripsi: 'Laboratorium untuk praktikum jaringan dan sistem operasi',
    fasilitas: ['AC', 'Proyektor', 'Server', 'Komputer', 'Internet'],
    status: 'aktif',
    icon: 'laptop',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 3,
    kode: 'RK-A-101',
    nama: 'Ruang Kelas A.101',
    kategori: 'Ruang Kelas',
    kapasitas: 50,
    lokasi: 'Gedung A Lantai 1',
    deskripsi: 'Ruang kelas untuk kuliah umum dan presentasi',
    fasilitas: ['AC', 'Proyektor', 'Whiteboard', 'Sound System'],
    status: 'aktif',
    icon: 'google-classroom',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 4,
    kode: 'RK-A-201',
    nama: 'Ruang Kelas A.201',
    kategori: 'Ruang Kelas',
    kapasitas: 45,
    lokasi: 'Gedung A Lantai 2',
    deskripsi: 'Ruang kelas dengan fasilitas multimedia lengkap',
    fasilitas: ['AC', 'Proyektor', 'Whiteboard', 'Sound System'],
    status: 'aktif',
    icon: 'google-classroom',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
];

// Daftar kategori fasilitas
export const KATEGORI_FASILITAS = [
  'Laboratorium',
  'Ruang Kelas',
];

// Daftar icon yang bisa dipilih
export const ICON_OPTIONS = [
  { name: 'laptop', label: 'computer' },
  { name: 'google-classroom', label: 'Classroom' },
  { name: 'office-building', label: 'Building' },
  { name: 'lan', label: 'Network' },
];

/**
 * Initialize fasilitas data in AsyncStorage (First time only)
 */
const initializeFasilitas = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('initializeFasilitas - existing data:', existing ? 'YES' : 'NO');
    if (!existing) {
      console.log('initializeFasilitas - initializing with INITIAL_FASILITAS');
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FASILITAS));
    } else {
      console.log('initializeFasilitas - data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Initialize fasilitas error:', error);
  }
};

// Initialize on module load
initializeFasilitas();

const unwrapApiData = (payload) => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }
  return payload;
};

const getStoredFasilitas = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredFasilitas = async (data) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const isNetworkError = (error) => error?.status === 0 || error?.status === -1;

const normalizeFasilitasItem = (item = {}) => ({
  ...item,
  status: item.status || 'aktif',
  icon: item.icon || 'office-building',
  deskripsi: item.deskripsi || '',
  fasilitas: Array.isArray(item.fasilitas) ? item.fasilitas : [],
});

const normalizeFasilitasList = (list = []) => list.map((item) => normalizeFasilitasItem(item));

/**
 * Get semua fasilitas from backend API
 * @param {boolean} includeInactive - Include inactive fasilitas (for admin)
 * @returns {Promise<Array>} Array of fasilitas
 */
export const getAllFasilitas = async (includeInactive = false) => {
  try {
    console.log('getAllFasilitas - trying API...');
    const response = await api.get('/fasilitas');
    const raw = unwrapApiData(response);
    const apiData = normalizeFasilitasList(Array.isArray(raw) ? raw : []);
    if (apiData.length > 0) {
      await setStoredFasilitas(apiData);
    }
    console.log('getAllFasilitas - API SUCCESS, count:', apiData.length);
    if (includeInactive) {
      return apiData;
    }
    return apiData.filter((item) => item.status === 'aktif');
  } catch (error) {
    console.error('Get all fasilitas error:', error);
    console.log('getAllFasilitas - API failed, falling back to AsyncStorage...');
    try {
      const data = await getStoredFasilitas();
      const normalizedData = normalizeFasilitasList(data);
      console.log('getAllFasilitas - AsyncStorage fallback SUCCESS, count:', normalizedData.length);
      if (includeInactive) {
        return normalizedData;
      }
      return normalizedData.filter((item) => item.status === 'aktif');
    } catch (e) {
      console.error('AsyncStorage fallback error:', e);
    }
    return [];
  }
};

/**
 * Get fasilitas by ID from backend API
 * @param {number} id - Fasilitas ID
 * @returns {Promise<Object>} Fasilitas object
 */
export const getFasilitasById = async (id) => {
  try {
    const response = await api.get(`/fasilitas/${id}`);
    const data = unwrapApiData(response) || response;
    return normalizeFasilitasItem(data);
  } catch (error) {
    console.error('Get fasilitas by ID error:', error);
    throw error;
  }
};

/**
 * Create new fasilitas
 * @param {Object} data - Fasilitas data
 * @returns {Promise<Object>} Created fasilitas
 */
export const createFasilitas = async (data) => {
  try {
    console.log('createFasilitas - trying API...');
    const response = await api.post('/fasilitas', data);
    const created = unwrapApiData(response) || response;
    console.log('createFasilitas - API SUCCESS');
    return created;
  } catch (error) {
    console.error('Create fasilitas API error, fallback to AsyncStorage:', error);
    if (!isNetworkError(error)) {
      throw new Error(error.message || 'Gagal membuat fasilitas di server');
    }
    try {
      const allFasilitas = await getStoredFasilitas();

      const exists = allFasilitas.find((f) => f.kode.toUpperCase() === data.kode.toUpperCase());
      if (exists) {
        throw new Error('Kode fasilitas sudah digunakan');
      }

      const newId = allFasilitas.length > 0
        ? Math.max(...allFasilitas.map((f) => f.id)) + 1
        : 1;

      const newFasilitas = {
        id: newId,
        ...data,
        kode: data.kode.toUpperCase(),
        status: data.status || 'aktif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      allFasilitas.push(newFasilitas);
      await setStoredFasilitas(allFasilitas);

      return newFasilitas;
    } catch (fallbackError) {
      console.error('Create fasilitas fallback error:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Update existing fasilitas
 * @param {number} id - Fasilitas ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated fasilitas
 */
export const updateFasilitas = async (id, data) => {
  try {
    console.log('updateFasilitas - trying API for id:', id);
    const response = await api.put(`/fasilitas/${id}`, data);
    const updated = unwrapApiData(response) || response;
    console.log('updateFasilitas - API SUCCESS');
    return updated;
  } catch (error) {
    console.error('Update fasilitas API error, fallback to AsyncStorage:', error);
    if (!isNetworkError(error)) {
      throw new Error(error.message || 'Gagal memperbarui fasilitas di server');
    }
    try {
      const allFasilitas = await getStoredFasilitas();
      const index = allFasilitas.findIndex((f) => f.id === id);

      if (index === -1) {
        throw new Error('Fasilitas tidak ditemukan');
      }

      if (data.kode) {
        const kodeExists = allFasilitas.find(
          (f) => f.id !== id && f.kode.toUpperCase() === data.kode.toUpperCase()
        );
        if (kodeExists) {
          throw new Error('Kode fasilitas sudah digunakan');
        }
      }

      allFasilitas[index] = {
        ...allFasilitas[index],
        ...data,
        id,
        kode: data.kode ? data.kode.toUpperCase() : allFasilitas[index].kode,
        updated_at: new Date().toISOString(),
      };

      await setStoredFasilitas(allFasilitas);
      return allFasilitas[index];
    } catch (fallbackError) {
      console.error('Update fasilitas fallback error:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Delete fasilitas
 * @param {number} id - Fasilitas ID
 * @returns {Promise<Object>} Result object
 */
export const deleteFasilitas = async (id) => {
  try {
    console.log('deleteFasilitas - trying API for id:', id);
    await api.delete(`/fasilitas/${id}`);
    console.log('deleteFasilitas - API SUCCESS');
    const cached = await getStoredFasilitas();
    const filteredCache = cached.filter((f) => f.id !== id);
    await setStoredFasilitas(filteredCache);
    return {
      success: true,
      message: 'Fasilitas berhasil dihapus'
    };
  } catch (error) {
    console.error('Delete fasilitas API error, fallback to AsyncStorage:', error);
    if (!isNetworkError(error)) {
      return {
        success: false,
        message: error.message || 'Gagal menghapus fasilitas di server'
      };
    }
    try {
      const allFasilitas = await getStoredFasilitas();
      const filtered = allFasilitas.filter((f) => f.id !== id);

      if (filtered.length === allFasilitas.length) {
        return {
          success: false,
          message: 'Fasilitas tidak ditemukan'
        };
      }

      await setStoredFasilitas(filtered);

      return {
        success: true,
        message: 'Fasilitas berhasil dihapus (mode lokal)'
      };
    } catch (fallbackError) {
      console.error('Delete fasilitas fallback error:', fallbackError);
      return {
        success: false,
        message: fallbackError.message || 'Gagal menghapus fasilitas'
      };
    }
  }
};

/**
 * Toggle fasilitas status (aktif/tidak_aktif)
 * @param {number} id - Fasilitas ID
 * @returns {Promise<Object>} Updated fasilitas
 */
export const toggleStatus = async (id) => {
  try {
    const fasilitas = await getFasilitasById(id);
    const newStatus = fasilitas.status === 'aktif' ? 'tidak_aktif' : 'aktif';
    return await updateFasilitas(id, { status: newStatus });
  } catch (error) {
    console.error('Toggle status error:', error);
    throw error;
  }
};

/**
 * Search fasilitas by nama, kode, or lokasi
 * @param {string} query - Search query
 * @param {boolean} includeInactive - Include inactive fasilitas
 * @returns {Promise<Array>} Filtered fasilitas
 */
export const searchFasilitas = async (query, includeInactive = false) => {
  try {
    const allFasilitas = await getAllFasilitas(includeInactive);
    
    if (!query || query.trim() === '') {
      return allFasilitas;
    }
    
    const lowerQuery = query.toLowerCase();
    return allFasilitas.filter(
      (f) =>
        f.nama.toLowerCase().includes(lowerQuery) ||
        f.kode.toLowerCase().includes(lowerQuery) ||
        f.lokasi.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Search fasilitas error:', error);
    return [];
  }
};

/**
 * Filter fasilitas by kategori
 * @param {string} kategori - Kategori name
 * @param {boolean} includeInactive - Include inactive fasilitas
 * @returns {Promise<Array>} Filtered fasilitas
 */
export const filterByKategori = async (kategori, includeInactive = false) => {
  try {
    const allFasilitas = await getAllFasilitas(includeInactive);
    
    if (!kategori || kategori === 'Semua') {
      return allFasilitas;
    }
    
    return allFasilitas.filter((f) => f.kategori === kategori);
  } catch (error) {
    console.error('Filter by kategori error:', error);
    return [];
  }
};

/**
 * Get all kategori fasilitas
 * @returns {Array<string>} Array of kategori
 */
export const getAllKategori = () => {
  return ['Semua', ...KATEGORI_FASILITAS];
};

/**
 * Get fasilitas stats
 * @returns {Promise<Object>} Stats object
 */
export const getFasilitasStats = async () => {
  try {
    console.log('getFasilitasStats - fetching all fasilitas...');
    const allFasilitas = await getAllFasilitas(true);
    console.log('getFasilitasStats - got', allFasilitas.length, 'items');
    
    const stats = {
      total: allFasilitas.length,
      aktif: allFasilitas.filter((f) => f.status === 'aktif').length,
      tidak_aktif: allFasilitas.filter((f) => f.status === 'tidak_aktif').length,
      byKategori: {
        Laboratorium: allFasilitas.filter((f) => f.kategori === 'Laboratorium').length,
        'Ruang Kelas': allFasilitas.filter((f) => f.kategori === 'Ruang Kelas').length,
        Perpustakaan: allFasilitas.filter((f) => f.kategori === 'Perpustakaan').length,
        'Ruang Pertemuan': allFasilitas.filter((f) => f.kategori === 'Ruang Pertemuan').length,
        'Fasilitas Umum': allFasilitas.filter((f) => f.kategori === 'Fasilitas Umum').length,
      },
    };
    console.log('getFasilitasStats - stats:', stats);
    return stats;
  } catch (error) {
    console.error('Get fasilitas stats error:', error);
    return {
      total: 0,
      aktif: 0,
      tidak_aktif: 0,
      byKategori: {},
    };
  }
};

export default {
  getAllFasilitas,
  getFasilitasById,
  createFasilitas,
  updateFasilitas,
  deleteFasilitas,
  toggleStatus,
  searchFasilitas,
  getAllKategori,
  filterByKategori,
  getFasilitasStats,
  KATEGORI_FASILITAS,
  ICON_OPTIONS,
};
