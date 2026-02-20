// Fasilitas Service dengan AsyncStorage untuk CRUD operations
// Data dapat dikelola oleh admin (Create, Read, Update, Delete)

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
  {
    id: 5,
    kode: 'PERPUS-01',
    nama: 'Perpustakaan Pusat',
    kategori: 'Perpustakaan',
    kapasitas: 100,
    lokasi: 'Gedung B Lantai 1-3',
    deskripsi: 'Perpustakaan dengan koleksi lengkap dan area baca yang nyaman',
    fasilitas: ['AC', 'WiFi', 'Ruang Baca', 'Komputer', 'Printer'],
    status: 'aktif',
    icon: 'book-open-page-variant',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 6,
    kode: 'LAB-MULTI-01',
    nama: 'Laboratorium Multimedia',
    kategori: 'Laboratorium',
    kapasitas: 30,
    lokasi: 'Gedung A Lantai 4',
    deskripsi: 'Laboratorium untuk praktikum desain grafis dan multimedia',
    fasilitas: ['AC', 'Komputer Spek Tinggi', 'Proyektor', 'Tablet Grafis'],
    status: 'aktif',
    icon: 'palette',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 7,
    kode: 'MUSHOLA-01',
    nama: 'Mushola Kampus',
    kategori: 'Fasilitas Umum',
    kapasitas: 80,
    lokasi: 'Gedung C Lantai 1',
    deskripsi: 'Tempat ibadah dengan fasilitas wudhu terpisah',
    fasilitas: ['AC', 'Tempat Wudhu', 'Sajadah', 'Mukena', 'Al-Quran'],
    status: 'aktif',
    icon: 'mosque',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 8,
    kode: 'KANTIN-01',
    nama: 'Kantin Kampus',
    kategori: 'Fasilitas Umum',
    kapasitas: 120,
    lokasi: 'Area Belakang Kampus',
    deskripsi: 'Kantin dengan berbagai pilihan menu makanan dan minuman',
    fasilitas: ['Meja Makan', 'Musala Kecil', 'WiFi', 'Toilet'],
    status: 'aktif',
    icon: 'food-fork-drink',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 9,
    kode: 'TOILET-A',
    nama: 'Toilet Gedung A',
    kategori: 'Fasilitas Umum',
    kapasitas: 10,
    lokasi: 'Gedung A (Setiap Lantai)',
    deskripsi: 'Toilet umum dengan fasilitas pria dan wanita terpisah',
    fasilitas: ['Air Bersih', 'Sabun', 'Tisu', 'Cermin'],
    status: 'aktif',
    icon: 'toilet',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 10,
    kode: 'AULA-01',
    nama: 'Aula Serbaguna',
    kategori: 'Ruang Pertemuan',
    kapasitas: 300,
    lokasi: 'Gedung D Lantai 1',
    deskripsi: 'Aula untuk seminar, wisuda, dan acara besar lainnya',
    fasilitas: ['AC', 'Sound System', 'Proyektor', 'Panggung', 'Kursi Lipat'],
    status: 'aktif',
    icon: 'office-building',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 11,
    kode: 'RK-B-101',
    nama: 'Ruang Kelas B.101',
    kategori: 'Ruang Kelas',
    kapasitas: 40,
    lokasi: 'Gedung B Lantai 1',
    deskripsi: 'Ruang kelas standar dengan fasilitas dasar',
    fasilitas: ['AC', 'Proyektor', 'Whiteboard'],
    status: 'aktif',
    icon: 'google-classroom',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 12,
    kode: 'LAB-JAR-01',
    nama: 'Laboratorium Jaringan',
    kategori: 'Laboratorium',
    kapasitas: 30,
    lokasi: 'Gedung A Lantai 3',
    deskripsi: 'Laboratorium khusus untuk praktikum jaringan komputer',
    fasilitas: ['AC', 'Router', 'Switch', 'Komputer', 'Server', 'Kabel Jaringan'],
    status: 'aktif',
    icon: 'lan',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
];

// Daftar kategori fasilitas
export const KATEGORI_FASILITAS = [
  'Laboratorium',
  'Ruang Kelas',
  'Perpustakaan',
  'Ruang Pertemuan',
  'Fasilitas Umum',
];

// Daftar icon yang bisa dipilih
export const ICON_OPTIONS = [
  { name: 'laptop', label: 'Laptop' },
  { name: 'google-classroom', label: 'Classroom' },
  { name: 'book-open-page-variant', label: 'Book' },
  { name: 'mosque', label: 'Mosque' },
  { name: 'food-fork-drink', label: 'Food' },
  { name: 'toilet', label: 'Toilet' },
  { name: 'office-building', label: 'Building' },
  { name: 'palette', label: 'Palette' },
  { name: 'lan', label: 'Network' },
  { name: 'wifi', label: 'WiFi' },
  { name: 'projector', label: 'Projector' },
  { name: 'desk', label: 'Desk' },
];

/**
 * Initialize fasilitas data in AsyncStorage (First time only)
 */
const initializeFasilitas = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FASILITAS));
    }
  } catch (error) {
    console.error('Initialize fasilitas error:', error);
  }
};

// Initialize on module load
initializeFasilitas();

/**
 * Get semua fasilitas
 * @param {boolean} includeInactive - Include inactive fasilitas (for admin)
 * @returns {Promise<Array>} Array of fasilitas
 */
export const getAllFasilitas = async (includeInactive = false) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const fasilitas = data ? JSON.parse(data) : [];
    
    if (includeInactive) {
      return fasilitas.sort((a, b) => b.id - a.id);
    }
    
    return fasilitas.filter((f) => f.status === 'aktif').sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Get all fasilitas error:', error);
    return [];
  }
};

/**
 * Get fasilitas by ID
 * @param {number} id - Fasilitas ID
 * @returns {Promise<Object>} Fasilitas object
 */
export const getFasilitasById = async (id) => {
  try {
    const allFasilitas = await getAllFasilitas(true);
    const fasilitas = allFasilitas.find((f) => f.id === id);
    if (!fasilitas) {
      throw new Error('Fasilitas tidak ditemukan');
    }
    return fasilitas;
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
    const allFasilitas = await getAllFasilitas(true);
    
    // Check if kode already exists
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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allFasilitas));
    
    return newFasilitas;
  } catch (error) {
    console.error('Create fasilitas error:', error);
    throw error;
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
    const allFasilitas = await getAllFasilitas(true);
    const index = allFasilitas.findIndex((f) => f.id === id);
    
    if (index === -1) {
      throw new Error('Fasilitas tidak ditemukan');
    }
    
    // Check if new kode conflicts with other fasilitas
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
      id, // Ensure ID doesn't change
      kode: data.kode ? data.kode.toUpperCase() : allFasilitas[index].kode,
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allFasilitas));
    return allFasilitas[index];
  } catch (error) {
    console.error('Update fasilitas error:', error);
    throw error;
  }
};

/**
 * Delete fasilitas
 * @param {number} id - Fasilitas ID
 * @returns {Promise<Object>} Result object
 */
export const deleteFasilitas = async (id) => {
  try {
    const allFasilitas = await getAllFasilitas(true);
    const filtered = allFasilitas.filter((f) => f.id !== id);
    
    if (filtered.length === allFasilitas.length) {
      return {
        success: false,
        message: 'Fasilitas tidak ditemukan'
      };
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      success: true,
      message: 'Fasilitas berhasil dihapus'
    };
  } catch (error) {
    console.error('Delete fasilitas error:', error);
    return {
      success: false,
      message: error.message || 'Gagal menghapus fasilitas'
    };
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
    const allFasilitas = await getAllFasilitas(true);
    
    return {
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
